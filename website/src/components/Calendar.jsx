import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bars } from "react-loader-spinner";
import { fetchCachedData } from "../misc";
import Calendar from "react-awesome-calendar";
import { serialiseDateArray } from "../common";

const testEvents = [
  {
    id: 1,
    color: "#fd3153",
    from: "2022-03-02T18:00:00+00:00",
    to: "2022-03-05T19:00:00+00:00",
    title: "This is an event",
  },
  {
    id: 2,
    color: "#1ccb9e",
    from: "2022-03-01T13:00:00+00:00",
    to: "2022-03-05T14:00:00+00:00",
    title: "This is another event",
  },
  {
    id: 3,
    color: "#3694DF",
    from: "2022-03-05T13:00:00+00:00",
    to: "2022-03-05T20:00:00+00:00",
    title: "This is also another event",
  },
];

function CalendarPreview({ updateCache = false }) {
  const [loaded, setLoaded] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [calendarMode, setCalendarMode] = useState("monthlyMode");
  const [events, setEvents] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchArgs = {
      setData,
      setLoaded,
      updateCache,
      onSuccessCallback: (data) =>
        data && !data.errorDescription ? data : null,
    };
    if (calendarMode === "yearlyMode") {
      var fetchURL = `/calendar/${year}/`;
      var cacheName = `calendar_${year}`;
    } else {
      var fetchURL = `/calendar/${year}/${month}/`;
      var cacheName = `calendar_${year}_${month}`;
    }
    fetchCachedData(cacheName, fetchURL, fetchArgs);
  }, [updateCache, year, month, calendarMode]);

  /** Callback function to be called when the calendar data is fetched. */
  function setData(data) {
    setEvents(
      // data.events.map((event) => ({
      //   id: event.id,
      //   color: event.colour,
      //   from: event.date.start,
      //   to: formatDate(event.date.end),
      //   title: event.title,
      // }))
      data.events.map((rawEvent) => ({
        id: rawEvent.id,
        color: rawEvent.colour,
        title: rawEvent.title,
        from: rawEvent.date.start,
        to: serialiseDateArray(rawEvent.endDate, true),
      }))
    );
  }

  if (!loaded) {
    return (
      <div style={{ backgroundColor: "transparent" }}>
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }

  function onChange({ day, mode, month, year }) {
    setMonth(month + 1);
    setYear(year);
    setCalendarMode(mode);
  }

  function onClickEvent(id) {
    console.log("User clicked calendar event with ID", id);
    // TODO: integrate individual calendar event pages
    // navigate(`/wydarzenia/kalendarz/${id}`);
  }

  function onClickTimeLine({ year, month, day, hour }) {
    console.log("User clicked calendar timeline");
  }

  return (
    <Calendar
      events={events ?? []}
      onChange={onChange}
      onClickEvent={onClickEvent}
      onClickTimeLine={onClickTimeLine}
    />
  );
}

export default CalendarPreview;
