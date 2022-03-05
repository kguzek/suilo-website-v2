import React, { useState, useEffect } from "react";
import { Bars } from "react-loader-spinner";
import { fetchCachedData } from "../misc";
import Calendar from 'react-awesome-calendar';

const events = [{
  id: 1,
  color: '#fd3153',
  from: '2022-03-02T18:00:00+00:00',
  to: '2022-03-05T19:00:00+00:00',
  title: 'This is an event'
}, {
  id: 2,
  color: '#1ccb9e',
  from: '2022-03-01T13:00:00+00:00',
  to: '2022-03-05T14:00:00+00:00',
  title: 'This is another event'
}, {
  id: 3,
  color: '#3694DF',
  from: '2022-03-05T13:00:00+00:00',
  to: '2022-03-05T20:00:00+00:00',
  title: 'This is also another event'
}];

const CalendarPreview = ({ updateCache = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    const fetchArgs = {
      setData: setCalendarData,
      setLoaded,
      updateCache,
      onSuccessCallback: (data) =>
        data && !data.errorDescription ? data : null,
    };
    const fetchURL = `/calendar/${year}/${month}/`;
    const cacheName = `calendar_${year}_${month}`;
    fetchCachedData(cacheName, fetchURL, fetchArgs);
  }, [updateCache]);

  if (!loaded) {
    return (
      <div style={{ backgroundColor: "transparent" }}>
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }

  return (
    <Calendar
      events={events}
    />
  );
}

export default CalendarPreview;
