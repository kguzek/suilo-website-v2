import React, { useState, useEffect } from "react";
import { Bars } from "react-loader-spinner";
import MetaTags from "react-meta-tags";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchData, formatDate, formatTime, removeSearchParam } from "../misc";
const { dateToArray, serialiseDateArray } = require("../common");

const calendarEventTypes = [
  "święta/wydarzenia szkolne",
  "święta/wydarzenia ogólnopolskie",
  "dzień wolny od zajęć dydaktycznych",
  "ferie zimowe",
  "przerwa wakacyjna",
  "nauka zdalna/hybrydowa",
  "matury i inne egzaminy",
];

function fetchEventsData(cacheName, updateCache = false, setData, setLoaded) {
  /** Verifies that the API response is valid and returns the processed data. */
  function processJsonData(data) {
    if (data) {
      return data;
    }
    console.log(`Could not retrieve ${cacheName} data.`);
  }
  const args = {
    setData,
    setLoaded,
    updateCache,
    onSuccessCallback: processJsonData,
  };
  fetchData(cacheName, `/${cacheName}`, args);
}

function getNextEvent(eventContainer) {
  const now = new Date();
  const container = eventContainer.events || eventContainer.contents;

  for (let i = 0; i < container.length; i++) {
    const event = container[i];
    const eventDate = new Date(
      serialiseDateArray([
        eventContainer.yearInt,
        eventContainer.monthInt,
        event.startDate,
      ])
    );
    // date comparison for 'event' objects
    if (new Date(event.date) < now) {
      // these store the date as a three-element array, eg. [2022, 1, 1]
      continue;
    }
    // date comparison for 'calendar event' objects
    if (eventDate < now) {
      // these store the date as an integer (day of the month)
      continue;
    }
    return event;
  }
}

const Events = ({ setPage }) => {
  const [loadedA, setLoadedA] = useState(false);
  const [loadedB, setLoadedB] = useState(false);
  const [eventsData, setEventsData] = useState({ contents: [] });
  const [calendarData, setCalendarData] = useState({ events: [] });
  const [searchParams, setSearchParams] = useSearchParams({});
  const params = useParams();

  useEffect(() => {
    setPage("events");
    const updateCache = removeSearchParam(
      searchParams,
      setSearchParams,
      "refresh"
    );
    fetchEventsData("events", updateCache, setEventsData, setLoadedA);
    fetchEventsData("calendar", updateCache, setCalendarData, setLoadedB);
  }, [params.postID]);

  if (!(loadedA && loadedB)) {
    // wait until both events and calendar have loaded
    return (
      <div
        className="loading-whole-screen"
        style={{ backgroundColor: "transparent" }}
      >
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }
  const nextEvent = getNextEvent(eventsData);
  const nextCalEvent = getNextEvent(calendarData);
  nextEvent && console.log("Next event:", nextEvent.title);
  nextCalEvent && console.log("Next calendar event:", nextCalEvent.title);
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
      <h2>Kalendarz szkolny</h2>
      {calendarData.events.length === 0
        ? "Brak wydarzeń kalendarzowych."
        : calendarData.events.map((event, index) => (
            <CalendarEventPreview
              event={event}
              key={index}
              data={calendarData}
            />
          ))}
      <br />
      <h2>Wydarzenia szkolne</h2>
      <h3>Następne wydarzenie szkolne</h3>
      {nextEvent ? (
        <EventPreview event={nextEvent} />
      ) : (
        "Nie ma w najbliższym czasie żadnych wydarzeń."
      )}
    </div>
  );
};

function EventPreview({ event }) {
  const numParticipants = event.participants.length;
  const suffix = numParticipants == 1 ? "" : "ów";
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
        Godzina: {formatTime(event.startTime)} — {formatTime(event.endTime)}
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
  const eventType = calendarEventTypes[event.type]; // undefined if the event type is invalid
  const elem = (
    <div>
      <p>
        <small>
          <i>
            {formatDate([data.yearInt, data.monthInt, event.startDate])}
            {event.startDate !== event.endDate &&
              ` — ${formatDate([data.yearInt, data.monthInt, event.endDate])}`}
            {eventType && <span>&nbsp;&nbsp;·&nbsp;&nbsp;[{eventType}]</span>}
          </i>
        </small>
        <br />
        {event.title}
      </p>
    </div>
  );
  // temporary render style: cross out events that are in the past
  const eventEndDate = new Date(
    serialiseDateArray([data.yearInt, data.monthInt, event.endDate])
  );
  const isCompleted = eventEndDate < new Date();
  return isCompleted ? <s>{elem}</s> : elem;
}

export default Events;
