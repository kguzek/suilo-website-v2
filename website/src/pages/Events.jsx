import React, { useState, useEffect } from "react";
import { Bars } from "react-loader-spinner";
import MetaTags from "react-meta-tags";
import { useParams, useSearchParams } from "react-router-dom";
import CalendarPreview from "../components/Events/Calendar";
import EventPreview from "../components/Events/EventPreview";
import { fetchCachedData, removeSearchParam } from "../misc";
import { serialiseDateArray } from "../common";

function Events({ setPage, reload }) {
  const [loaded, setLoaded] = useState(false); // events loaded status
  const [eventsData, setEventsData] = useState({ contents: [] });
  const [searchParams, setSearchParams] = useSearchParams({});
  const [updateCache, setUpdateCache] = useState(false);
  const [nextEvent, setNextEvent] = useState(undefined);
  const [selectedEvent, setSelectedEvent] = useState(undefined);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [allCalendarEvents, setAllCalendarEvents] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(undefined);
  const [calendarYear, setCalendarYear] = useState(undefined);
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

  useEffect(() => {
    if (!eventsData?.contents) {
      return;
    }
    const now = new Date();
    const _calendarEvents = [];
    for (const event of eventsData.contents) {
      // date comparison for 'event' objects to check the next event
      if (new Date(event.date) >= now) {
        setNextEvent(event);
      }
      _calendarEvents.push({
        id: event.id,
        startDate: event.date,
        endDate: event.date,
        renderType: "PRIMARY",
        type: event.type,
        title: event.title,
      });
    }
    setAllCalendarEvents(_calendarEvents);
  }, [eventsData]);

  useEffect(() => {
    if (!selectedEvent) return;
    document
      .getElementById("selectedEvent")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedEvent]);

  useEffect(() => {
    if (!allCalendarEvents) return;
    // Update the calendar events for this month
    setCalendarEvents(
      allCalendarEvents.filter((event) => {
        if (event.renderType === "SECONDARY") return true;
        const [year, month, _day] = event.startDate;
        return year === calendarYear && month === calendarMonth;
      })
    );
  }, [allCalendarEvents, calendarMonth, calendarYear]);

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

  function updateSelectedEvent({ day, month, year, eventIDs }) {
    for (const event of eventsData?.contents ?? []) {
      if (eventIDs.includes(event.id)) {
        console.log("Setting currently selected event to:", event.title);
        setSelectedEvent(event);
        return;
      }
    }
    console.log("No event on", serialiseDateArray([year, month, day]));
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
        <EventPreview event={nextEvent} isNextEvent={true} />
      ) : (
        // TODO: Render something better if there are no future events
        <p>Nie ma w najbliższym czasie żadnych wydarzeń.</p>
      )}
      <CalendarPreview
        data={calendarEvents}
        updateCache={updateCache}
        onCalendarClick={updateSelectedEvent}
        onMonthChange={setCalendarMonth}
        onYearChange={setCalendarYear}
        year={calendarYear}
        month={calendarMonth}
      />
      {selectedEvent && <EventPreview event={selectedEvent} />}
    </div>
  );
}

// function EventPreview({ event }) {
//   const numParticipants = event.participants.length;
//   const suffix = numParticipants === 1 ? "" : "ów";
//   return (
//     <div>
//       <small>
//         <i>
//           {formatDate(event.date)}&nbsp;&nbsp;·&nbsp;&nbsp;{numParticipants}{" "}
//           uczestnik
//           {suffix}
//         </i>
//       </small>
//       <br />
//       <b>
//         <Link to={event.id}>{event.title}</Link>
//       </b>
//       <br />
//       <i>
//         Godz. {formatTime(event.startTime)}—{formatTime(event.endTime)}
//         {event.location && (
//           <span>&nbsp;&nbsp;·&nbsp;&nbsp;Miejsce: {event.location}</span>
//         )}
//       </i>
//       <br />
//       {event.content}
//     </div>
//   );
// }

export default Events;
