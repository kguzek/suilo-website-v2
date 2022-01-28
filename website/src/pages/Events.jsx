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
    function processJsonData(data) {
      if (!data) {
        console.log("Could not retrieve calendar events data.");
        return setLoaded(true);
      }
      const newCache = {
        date: new Date(),
        data,
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
      {/* TODO: replace temporary calendar events render */}
      {calendarData.events.length === 0
        ? "Brak wydarzeń kalendarzowych."
        : calendarData.events.map((event, key) => {
            return (
              <div key={key}>
                <p>
                  <small>
                    <i>
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
                    </i>
                  </small>
                  <br />
                  {event.title}
                </p>
              </div>
            );
          })}
    </div>
  );
};

export default Events;
