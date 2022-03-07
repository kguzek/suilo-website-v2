import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bars } from "react-loader-spinner";
import { fetchCachedData } from "../misc";
import Calendar from "react-awesome-calendar";
import { serialiseDateArray } from "../common";
import CustomCalendar from "./CustomCalendar";

const CalendarPreview = ({ updateCache = false }) => {
  const d = new Date()
  const [loaded, setLoaded] = useState(false);
  const [year, setYear] = useState(d.getFullYear());
  const [month, setMonth] = useState(d.getMonth() + 1);
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
  const setData = (data) => {
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

  const onChange = ({ day, mode, month, year }) => {
    setMonth(month + 1);
    setYear(year);
    setCalendarMode(mode);
  }

  const onClickEvent = (id) => {
    console.log("User clicked calendar event with ID", id);
    // TODO: integrate individual calendar event pages
    // navigate(`/wydarzenia/kalendarz/${id}`);
  }

  const onClickTimeLine = ({ year, month, day, hour }) => {
    console.log("User clicked calendar timeline");
  }

  const onCalendarClick = ({ day, month, year, eventIDs }) => {
    //EVERYTHING HERE FOR CLICK INFO
    console.log(day + "/" + month + "/" + year, eventIDs[0] !== undefined ? "event IDs for chosen day: " + eventIDs : "")
  }
  const onMonthChange = (month) => {
    //EVERYTHING HERE FOR MONTH CHANGE
    console.log("calendar month: " + month)
  }

  return (
    <div className="">
      {/* <Calendar
        events={events ?? []}
        onChange={onChange}
        onClickEvent={onClickEvent}
        onClickTimeLine={onClickTimeLine}
      /> */}
      <CustomCalendar
        events={events ?? []}
        onClickDate={onCalendarClick}
        onMonthChange={onMonthChange}
      />
    </div>
  );
}

export default CalendarPreview;
