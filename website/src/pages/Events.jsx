import React, { useState, useEffect } from "react";
import { Bars } from "react-loader-spinner";
import MetaTags from "react-meta-tags";
import { Link, useParams, useSearchParams } from "react-router-dom";
import CalendarPreview from "../components/Calendar";
import {
  fetchCachedData,
  formatDate,
  formatTime,
  removeSearchParam,
} from "../misc";
import { serialiseDateArray, dateToArray } from "../common";

function getNextEvent(events = []) {
  const now = new Date();

  for (const event of events) {
    // date comparison for 'event' objects
    if (new Date(event.date) >= now) {
      return event;
    }
  }
}

function Events({ setPage, reload }) {
  const [loaded, setLoaded] = useState(false); // events loaded status
  const [eventsData, setEventsData] = useState({ contents: [] });
  const [searchParams, setSearchParams] = useSearchParams({});
  const [updateCache, setUpdateCache] = useState(false);
  const params = useParams();

  function _populatePageContents(forceUpdateCache = false) {
    // set the data fetch arguments
    const fetchArgs = {
      setData: setEventsData,
      setLoaded,
      updateCache: forceUpdateCache,
      onSuccessCallback: (data) =>
        data && !data.errorDescription ? data : null,
    };
    fetchCachedData("events", "/events", fetchArgs);
  }

  useEffect(() => {
    setPage("events");
    // determines if the cache should be updated by checking the 'refresh' URL query parameter
    const _frce = !!removeSearchParam(searchParams, setSearchParams, "refresh");
    setUpdateCache(_frce);
    _populatePageContents(_frce);
  }, [params.postID]);

  useEffect(() => {
    if (!reload) {
      return;
    }
    // The page content has updated on the server side; reload it
    setLoaded(false);
    _populatePageContents();
  }, [reload]);

  if (!loaded) {
    // wait until events have loaded
    return (
      <div
        className="loading-whole-screen"
        style={{ backgroundColor: "transparent" }}
      >
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }
  const nextEvent = getNextEvent(eventsData.contents);
  console.log("Next event:", nextEvent?.title);
  return (
    <div style={{ minHeight: "89vh" }}>
      <MetaTags>
        <title>
          Wydarzenia | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w
          Gliwicach
        </title>
        <meta name="description" content="Następne wydarzenie to:" />{" "}
        {(nextEvent ?? {}).title}
        <meta
          property="og:title"
          content="Kalendarz i wydarzenia | SUILO Gliwice"
        />
        <meta property="og:image" content="" /> {/* TODO: ADD IMAGE */}
      </MetaTags>
      {/* TODO: replace temporary calendar events render */}
      {/* <h2>Kalendarz szkolny</h2>
      {calendarData.events.length === 0
        ? "Brak wydarzeń kalendarzowych."
        : calendarData.events.map((event, index) => (
          <CalendarEventPreview
            event={event}
            key={index}
            data={calendarData}
          />
        ))}
      <br /> */}
      <h2>Wydarzenia szkolne</h2>
      <h3>Następne wydarzenie szkolne</h3>
      {nextEvent ? (
        <EventPreview event={nextEvent} />
      ) : (
        "Nie ma w najbliższym czasie żadnych wydarzeń."
      )}
      <CalendarPreview updateCache={updateCache} />
    </div>
  );
}

function EventPreview({ event }) {
  const numParticipants = event.participants.length;
  const suffix = numParticipants === 1 ? "" : "ów";
  return (
    <div>
      <small>
        <i>
          {formatDate(event.date)}&nbsp;&nbsp;·&nbsp;&nbsp;{numParticipants}{" "}
          uczestnik
          {suffix}
        </i>
      </small>
      <br />
      <b>
        <Link to={event.id}>{event.title}</Link>
      </b>
      <br />
      <i>
        Godz. {formatTime(event.startTime)}—{formatTime(event.endTime)}
        {event.location && (
          <span>&nbsp;&nbsp;·&nbsp;&nbsp;Miejsce: {event.location}</span>
        )}
      </i>
      <br />
      {event.content}
    </div>
  );
}

export default Events;
