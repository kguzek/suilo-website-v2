import React, { useState, useEffect } from "react";
import MetaTags from "react-meta-tags";
import { useParams, useSearchParams } from "react-router-dom";
import CalendarPreview from "../components/Events/Calendar";
import EventPreview from "../components/Events/EventPreview";
import { fetchCachedData, removeSearchParam } from "../misc";
import { serialiseDateArray } from "../common";
import LoadingScreen from "../components/LoadingScreen";
import { DEBUG_MODE } from "../firebase";

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

  /** Fetches the primary events from cache or API. */
  function fetchPrimaryEvents(forceUpdateCache = false) {
    // set the data fetch arguments
    const fetchArgs = {
      setData: (data) => setRawPrimEvents(data.contents),
      setLoaded: setLoadedPrim,
      updateCache: forceUpdateCache,
    };
    fetchCachedData("events", "/events", fetchArgs);
    fetchSecondaryEvents(forceUpdateCache);
  }

  /** Fetches the secondary events from cache or API. */
  function fetchSecondaryEvents(forceUpdateCache = false) {
    if (calendarYear === undefined || calendarMonth === undefined) return;
    const fetchArgs = {
      setData: (data) => setSecEvents(data.events),
      setLoaded: setLoadedSec,
      updateCache: forceUpdateCache,
    };
    const fetchURL = `/calendar/${calendarYear}/${calendarMonth}/`;
    const cacheName = `calendar_${calendarYear}_${calendarMonth}`;

    fetchCachedData(cacheName, fetchURL, fetchArgs);
  }

  useEffect(() => {
    fetchSecondaryEvents();
    processPrimaryEvents();
  }, [calendarYear, calendarMonth]);

  useEffect(() => {
    setPage("events");
    // determines if the cache should be updated by checking the 'refresh' URL query parameter
    const force = !!removeSearchParam(searchParams, setSearchParams, "refresh");
    fetchPrimaryEvents(force);
  }, [searchParams]);

  useEffect(() => {
    if (!reload) {
      return;
    }
    // The page content has updated on the server side; reload it
    setReload(false);
    setLoadedPrim(false);
    fetchPrimaryEvents();
  }, [reload]);

  useEffect(() => {
    processPrimaryEvents();
  }, [rawPrimEvents]);

  useEffect(() => {
    if (!selectedEvent) return;
    document
      .getElementById("selectedEvent")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedEvent]);

  if (!loadedPrim || (calendarYear && calendarMonth && !loadedSec)) {
    return <LoadingScreen />;
  }

  /** Filters out the primary events that are not this month and converts them into calendar format. */
  function processPrimaryEvents() {
    const now = new Date();
    const _primEvents = [];
    for (const event of rawPrimEvents) {
      // date comparison for 'event' objects to check the next event
      const eventDate = new Date(event.date);
      if (eventDate >= now) {
        // This event is in the future
        if (!nextEvent || new Date(nextEvent.date) > eventDate) {
          // The next event hasn't been defined yet or is after this event
          setNextEvent(event);
        }
      }
      const [year, month, _day] = event.date;
      if (year !== calendarYear || month !== calendarMonth) {
        continue;
      }
      _primEvents.push({
        id: event.id,
        startDate: event.date,
        endDate: event.date,
        renderType: "PRIMARY",
        type: event.type,
        title: event.title,
      });
    }
    setPrimEvents(_primEvents);
  }

  /** Updates the reference to the currently selected event. */
  function updateSelectedEvent({ day, month, year, eventIDs }) {
    for (const event of rawPrimEvents) {
      if (eventIDs.includes(event.id)) {
        // console.log("Setting currently selected event to:", event.title);
        return void setSelectedEvent(event);
      }
    }
    DEBUG_MODE &&
      console.log("No event on", serialiseDateArray([year, month, day]));
    // Uncomment below to hide event preview when user clicks an empty day in calendar
    // setSelectedEvent(undefined);
  }

  return (
    <div className="w-11/12 xl:w-10/12 flex flex-col justify-center align-top">
      <MetaTags>
        <title>
          Wydarzenia | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w
          Gliwicach
        </title>
        <meta name="description" content="Następne wydarzenie to:" />{" "}
        {nextEvent?.title}
        <meta
          property="og:title"
          content="Kalendarz i wydarzenia | SUILO Gliwice"
        />
        <meta property="og:image" content="" /> {/* TODO: ADD IMAGE */}
      </MetaTags>
      {nextEvent ? (
        <EventPreview event={nextEvent} isNextEvent loginAction={loginAction} />
      ) : (
        // TODO: Render something better if there are no future events
        <div className="grid lg:mb-14">
          <p className="mx-auto">
            Nie ma w najbliższym czasie żadnych wydarzeń.
          </p>
        </div>
      )}
      <CalendarPreview
        events={[...primEvents, ...secEvents]}
        onCalendarClick={updateSelectedEvent}
        onMonthChange={setCalendarMonth}
        onYearChange={setCalendarYear}
      />
      {selectedEvent && (
        <EventPreview event={selectedEvent} loginAction={loginAction} />
      )}
    </div>
  );
}

export default Events;
