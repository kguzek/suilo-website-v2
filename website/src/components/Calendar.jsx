import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bars } from "react-loader-spinner";
import { fetchCachedData } from "../misc";
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

  const legendColors = [
    { top: "#FFA600", bottom: "#FFC100" },
    { top: "#CC00FF", bottom: "#FF0000" },
    "#00E308",
    "#01B3FF",
    "#FFCC00",
    "#FF0000",
    "#E600FF"
  ]

  const legendItems = [
    "wydarzenia/święta szkolne",
    "wydarzenia/święta państwowe",
    "dzień wolny od zajęć dydaktycznych",
    "ferie zimowe",
    "przerwa wakacyjna",
    "matury i inne egzaminy",
    "inne",
  ]

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

  const _generateLegend = () => {
    return legendItems.map((el, i) => <li className={`flex flex-row justify-start align-middle w-full my-2 lg:my-3 ${i === 1 ? "mb-4 mt-3 lg:mt-4 lg:mb-5" : null} `}><div className={`${i < 2 ? "h-6 w-6 lg:h-7 lg:w-7 " : "w-3 h-3 lg:w-4 lg:h-4 ml-[1.1rem] lg:ml-[1.15rem]"} rounded-full my-auto m-3 drop-shadow-2xl`} style={{ background: (i < 2 ? `linear-gradient(135deg, ${legendColors[i].top}, ${legendColors[i].bottom})` : null), backgroundColor: (i >= 2 ? legendColors[i] : null) }} /><p className="my-auto text-[#292929] text-base -tracking-[.015rem] lg:text-[1.1rem]">{el}</p></li>)
  }

  return (
    <div className="flex flex-col md:flex-row mx-auto justify-center lg:justify-evenly align-middle my-5 md:my-8 w-full sm:w-10/12 md:w-full lg:w-10/12 xl:-translate-x-10">
      {/* <Calendar
        events={events ?? []}
        onChange={onChange}
        onClickEvent={onClickEvent}
        onClickTimeLine={onClickTimeLine}
      /> */}
      <div className="w-full mx-auto max-w-[27rem] lg:w-[27rem] lg:mx-auto mb-8">
        <CustomCalendar
          events={events ?? []}
          onClickDate={onCalendarClick}
          onMonthChange={onMonthChange}
          baseColors={legendColors}
        />
      </div>
      <div className="hidden lg:block lg:-mx-7 lg:-mr-8" />

      <div className=" w-fit pt-3 min-w-fit lg:mx-auto lg:ml-14 xl:mx-auto">
        <h3 className="text-text1 font-semibold text-xl mx-2 mb-3 lg:text-2xl lg:mb-4">Legenda:</h3>
        <ul>
          {_generateLegend()}
        </ul>
      </div>
    </div>
  );
}

export default CalendarPreview;
