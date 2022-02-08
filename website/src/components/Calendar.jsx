import React, { useState, useEffect } from "react";
import { Bars } from "react-loader-spinner";
import { fetchCachedData } from "../misc";

/*

       TYPES OF EVENTS - STRUCTURE

       typesOfEvents<Object>{
           primaryEvents<Array[Object]>:[
               { 
                   eventName<string>: "",
                   eventColor<Object>: {
                       topCorner<string>: "HEXvalue",
                       bottomCorner<string>: "HEXvalue",
                   }
               },
               ...
           ],
           secondaryEvents<Array[Object]>:[
               { 
                   eventName<string>: "",
                   eventColor<string>: "HEXvalue"
               },
               ...
           ]
       } 

   */

/*

    DATA FROM FETCH PER MONTH - STRUCTURE

    <Array[Object]>[
        {
            type<string>: "_PRIMARY_",
            subtype<string>: ""
            name<string>: "",
            date<Object>:{
                start<number>: 0,
                end<number>: 0,
            },
        },
        {
            type<string>: "_SECONDARY_",
            subtype<string>: "",
            name<string>: "",
            date<Object>:{
                start<number>: 0,
                end<number>: 0,
                startInPrev<boolean>: false,
                endInNext<boolean>: false,
            },
        },
        ...
    ]

*/

function Calendar({ typesOfEvents, updateCache = false }) {
  const [loaded, setLoaded] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [calendarData, setCalendarData] = useState({});

  // Current `calendarData` object signature:
  /*
  const calendarData = {
    year: int,
    month: int,
    monthName: string,
    numEvents: int,
    events: [
      {
        id: string,
        title: string,
        renderType: "PRIMARY",
        eventType: string,
        colour: {
          topCorner: "#XXXXXX",
          bottomCorner: "#XXXXXX",
        },
        date: {
          start: int,
          end: int,
        },
        views: int,
      },
      {
        id: string,
        title: string,
        renderType: "SECONDARY",
        eventType: string,
        colour: "#XXXXXX",
        date: {
          start: int,
          end: int,
          startsInPastMonth: bool,
          endsInFutureMonth: bool,
        },
        views: int,
      },
    ],
  };  */

  useEffect(() => {
    const fetchArgs = {
      setData: setCalendarData,
      setLoaded,
      updateCache,
      onSuccessCallback: (data) => (data && !data.errorMessage ? data : null),
    };
    const fetchURL = `/calendar/${year}/${month}/`;
    const cacheName = `calendar_${year}_${month}`;
    fetchCachedData(cacheName, fetchURL, fetchArgs);
  }, [updateCache]);

  if (!loaded) {
    // TODO: loading anim
    return (
      <div style={{ backgroundColor: "transparent" }}>
        <Bars color="#FFA900" height={50} width={50} />
      </div>
    );
  }

  return <div>Calendar in progress...</div>;
}

export default Calendar;
