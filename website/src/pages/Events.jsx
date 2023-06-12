import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import CalendarPreview from '../components/Events/Calendar';
import EventPreview from '../components/Events/EventPreview';
import { fetchCachedData, removeSearchParam, setSearchParam } from '../misc';
import { dateToArray, serialiseDateArray } from '../common';
import LoadingScreen from '../components/LoadingScreen';
import { DEBUG_MODE } from '../firebase';

function Events({ setPage, reload, setReload, loginAction }) {
  const [rawPrimEvents, setRawPrimEvents] = useState([]);
  const [primEvents, setPrimEvents] = useState([]);
  const [secEvents, setSecEvents] = useState([]);

  const [loadedPrim, setLoadedPrim] = useState(false);
  const [loadedSec, setLoadedSec] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(undefined);
  const [calendarYear, setCalendarYear] = useState(undefined);

  const [nextEvent, setNextEvent] = useState(undefined);
  const [selectedEvent, setSelectedEvent] = useState(undefined);

  const [searchParams, setSearchParams] = useSearchParams();

  /** Fetches the secondary events from cache or API. */
  const fetchSecondaryEvents = useCallback(
    (forceUpdateCache = false) => {
      if (calendarYear === undefined || calendarMonth === undefined) return;
      const fetchArgs = {
        setData: (data) => setSecEvents(data.events),
        setLoaded: setLoadedSec,
        updateCache: forceUpdateCache,
      };
      const fetchURL = `/calendar/${calendarYear}/${calendarMonth}/`;
      const cacheName = `calendar_${calendarYear}_${calendarMonth}`;

      fetchCachedData(cacheName, fetchURL, fetchArgs);
    },
    [calendarMonth, calendarYear]
  );

  /** Fetches the primary events from cache or API. */
  const fetchPrimaryEvents = useCallback(
    (forceUpdateCache = false) => {
      // set the data fetch arguments
      const fetchArgs = {
        setData: (data) => setRawPrimEvents(data.contents),
        setLoaded: setLoadedPrim,
        updateCache: forceUpdateCache,
      };
      fetchCachedData('events', '/events', fetchArgs);
      fetchSecondaryEvents(forceUpdateCache);
    },
    [fetchSecondaryEvents]
  );

  /** Determine the next event. */
  const updateNextEvent = useCallback(() => {
    const now = new Date();
    const today = new Date(dateToArray(now));
    for (const event of rawPrimEvents) {
      const eventDate = new Date(event.date);
      eventDate.setHours(...event.startTime);
      if (eventDate < today) continue; // The event is in the past
      eventDate.setHours(...event.endTime);
      if (eventDate < now) continue; // The event is today but has ended
      setNextEvent(event);
      break;
    }
  }, [rawPrimEvents]);

  /** Filters out the primary events that are not this month and converts them into calendar format. */
  const processPrimaryEvents = useCallback(() => {
    const queryEventID = searchParams.get('event');
    const _primEvents = [];
    for (const event of rawPrimEvents) {
      // date comparison for 'event' objects to check the next event
      event.id === queryEventID && setSelectedEvent(event);
      const [year, month] = event.date;
      if (year !== calendarYear || month !== calendarMonth) {
        continue;
      }
      _primEvents.push({
        id: event.id,
        startDate: event.date,
        endDate: event.date,
        renderType: 'PRIMARY',
        type: event.type,
        title: event.title,
      });
    }
    updateNextEvent();
    setPrimEvents(_primEvents);
  }, [calendarMonth, calendarYear, rawPrimEvents, searchParams, updateNextEvent]);

  useEffect(() => {
    fetchSecondaryEvents();
    processPrimaryEvents();
  }, [fetchSecondaryEvents, processPrimaryEvents]);

  useEffect(() => {
    // determines if the cache should be updated by checking the 'refresh' URL query parameter
    const force = !!removeSearchParam(searchParams, setSearchParams, 'refresh');
    if (force || !loadedPrim) {
      setPage('events');
      fetchPrimaryEvents(force);
    }
  }, [searchParams, fetchPrimaryEvents, loadedPrim, setPage, setSearchParams]);

  useEffect(() => {
    if (!reload) {
      return;
    }
    // The page content has updated on the server side; reload it
    setReload(false);
    setLoadedPrim(false);
    fetchPrimaryEvents();
  }, [reload, setReload, fetchPrimaryEvents]);

  useEffect(() => {
    if (!selectedEvent) return;
    document
      .getElementById(selectedEvent.id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedEvent]);

  if (!loadedPrim || (calendarYear && calendarMonth && !loadedSec)) {
    return <LoadingScreen />;
  }

  /** Updates the reference to the currently selected event. */
  function updateSelectedEvent({ day, month, year, eventIDs }) {
    const event = rawPrimEvents.filter((event) => eventIDs.includes(event.id)).shift();
    if (!event) {
      DEBUG_MODE && console.debug('No event on', serialiseDateArray([year, month, day]));
      // Uncomment below to hide event preview when user clicks an empty day in calendar
      // setSelectedEvent(undefined);
      return;
    }
    DEBUG_MODE && console.debug('Setting currently selected event to:', event.title);
    setSelectedEvent(event);
    setSearchParam(searchParams, setSearchParams, 'event', event.id);
  }

  return (
    <div className="w-11/12 xl:w-10/12 flex flex-col justify-center align-top">
      <Helmet>
        <title>Wydarzenia | Samorząd Uczniowski I LO</title>
        <meta
          name="description"
          content="Kalendarz wydarzeń w I Liceum Ogólnokształcącym w Gliwicach."
        />
        <meta property="og:title" content="Kalendarz wydarzeń" />
        <meta property="og:image" content="" /> {/* TODO: ADD IMAGE */}
      </Helmet>
      {nextEvent ? (
        <EventPreview
          event={nextEvent}
          isNextEvent
          loginAction={loginAction}
          updateNextEvent={updateNextEvent}
        />
      ) : (
        // TODO: Render something better if there are no future events
        <div className="grid lg:mb-14 py-36 my-16">
          <p className="mx-auto">Nie ma w najbliższym czasie żadnych wydarzeń.</p>
        </div>
      )}
      <CalendarPreview
        events={[...primEvents, ...secEvents]}
        onCalendarClick={updateSelectedEvent}
        onMonthChange={setCalendarMonth}
        onYearChange={setCalendarYear}
      />
      {selectedEvent && <EventPreview event={selectedEvent} loginAction={loginAction} />}
    </div>
  );
}

export default Events;
