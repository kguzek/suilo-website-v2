import React, { useState, useEffect } from "react";
import { Bars } from "react-loader-spinner";
import MetaTags from "react-meta-tags";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Calendar from "../components/Calendar";
import {
  fetchCachedData,
  formatDate,
  formatTime,
  removeSearchParam,
} from "../misc";
const { serialiseDateArray, dateToArray } = require("../common");

function getNextEvent(events = []) {
  const now = new Date();

  for (const event of events) {
    // date comparison for 'event' objects
    if (new Date(event.date) < now) {
      // these store the date as a three-element array, e.g. [2022, 1, 1]
      continue;
    }
    return event;
  }
}

function Events({ setPage }) {
  const [loaded, setLoaded] = useState(false); // events loaded status
  const [eventsData, setEventsData] = useState({ contents: [] });
  const [searchParams, setSearchParams] = useSearchParams({});
  const [updateCache, setUpdateCache] = useState(false);
  const params = useParams();

  useEffect(() => {
    setPage("events");
    // determines if the cache should be updated by checking the 'refresh' URL query parameter
    const temp = !!removeSearchParam(searchParams, setSearchParams, "refresh");
    setUpdateCache(temp);
    // set the data fetch arguments
    const fetchArgs = {
      setData: setEventsData,
      setLoaded,
      updateCache: temp,
      onSuccessCallback: (data) =>
        data && !data.errorDescription ? data : null,
    };
    fetchCachedData("events", "/events", fetchArgs);
  }, [params.postID]);

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
  nextEvent && console.log("Next event:", nextEvent.title);
  return (
    <div style={{ minHeight: "89vh" }}>
      <MetaTags>
        <title>
          Wydarzenia | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w
          Gliwicach
        </title>
        <meta name="description" content="Następne wydarzenie to:" />{" "}
        {(nextEvent || {}).title}
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
      <Calendar updateCache={updateCache} />
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

// TODO: change this
function CalendarEventPreview({ event, data }) {
  const elem = (
    <div>
      <p>
        <small>
          <i>
            {formatDate([data.yearInt, data.monthInt, event.date.start])}
            {event.date.start !== event.date.end &&
              ` — ${formatDate([data.yearInt, data.monthInt, event.date.end])}`}
            {event.eventType && (
              <span>&nbsp;&nbsp;·&nbsp;&nbsp;[{event.eventType}]</span>
            )}
          </i>
        </small>
        <br />
        {event.title}
      </p>
    </div>
  );
  // temporary render style
  const eventEndDate = new Date(
    serialiseDateArray([data.yearInt, data.monthInt, event.date.end])
  );
  const todayMidnight = new Date(dateToArray());
  const tomorrowMidnight = new Date();
  tomorrowMidnight.setHours(24, 0, 0, 0);
  if (eventEndDate < todayMidnight) {
    // cross out past events
    return <s>{elem}</s>;
  }
  if (eventEndDate <= tomorrowMidnight) {
    // bolden events that are today
    return <b>{elem}</b>;
  }
  // no style effect for future events
  return elem;
}

export default Events;
