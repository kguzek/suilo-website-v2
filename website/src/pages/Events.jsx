import React, { useState, useEffect } from "react";
import { Bars } from "react-loader-spinner";
import MetaTags from "react-meta-tags";
import { useParams, useSearchParams } from "react-router-dom";
import { fetchData, formatDate, removeSearchParam } from "../misc";
import NotFound from "./NotFound";

const Events = ({ setPage }) => {
  const [loaded, setLoaded] = useState(false);
  const [calendarData, setCalendarData] = useState({});
  const [searchParams, setSearchParams] = useSearchParams({});
  const params = useParams();

  const cacheName = "calendar_events";
  const currentDate = new Date().getDate();

  function getNextEvent(eventContainer) {
    for (const event of eventContainer) {
      if (event.startDate < currentDate) {
        continue;
      }
      return event;
    }
    return null;
  }

  function fetchCalendarEventsData(updateCache = false) {
    function processJsonData(jsonData) {
      if (!jsonData) {
        console.log("Could not retrieve calendar events data.");
        return setLoaded(true);
      }
      // sort the events by start date
      const events = jsonData.events.sort(
        (event1, event2) => event1.startDate - event2.startDate
      );
      const newCache = {
        date: new Date(),
        data: { ...jsonData, events },
      };
      localStorage.setItem(cacheName, JSON.stringify(newCache));
      console.log("Created cache for calendar events data.", newCache);
      setCalendarData(newCache.data);
      setLoaded(true);
    }

    const args = {
      setData: setCalendarData,
      setLoaded,
      updateCache,
      onSuccessCallback: processJsonData,
    };
    fetchData(cacheName, "/calendar", args);
  }

  useEffect(() => {
    setPage("events");
    const updateCache = removeSearchParam(
      searchParams,
      setSearchParams,
      "refresh"
    );
    fetchCalendarEventsData(updateCache);
  }, [params.postID]);

  if (!loaded) {
    return (
      <div
        className="loading-whole-screen"
        style={{ backgroundColor: "transparent" }}
      >
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }
  if (calendarData.errorMessage) {
    return <NotFound setPage={setPage} msg={calendarData.errorMessage} />;
  }

  return (
    <div style={{ minHeight: "89vh" }}>
      <MetaTags>
        <title>
          Wydarzenia | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w
          Gliwicach
        </title>
        <meta name="description" content="Następne wydarzenie to:" />{" "}
        {getNextEvent(calendarData.events)}
        <meta
          property="og:title"
          content="Kalendarz i wydarzenia | SUILO Gliwice"
        />
        <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
      </MetaTags>
      {calendarData.events.map((event, key) => {
        return (
          <div key={key}>
            {event.title}:{" "}
            {formatDate([
              calendarData.yearInt,
              calendarData.monthInt,
              event.startDate,
            ])}
            {event.startDate !== event.endDate &&
              ` — ${formatDate([
                calendarData.yearInt,
                calendarData.monthInt,
                event.endDate,
              ])}`}
          </div>
        );
      })}
    </div>
  );
};

export default Events;
