import React, { useEffect, useState } from "react";
import { Bars } from "react-loader-spinner";
import { serialiseDateArray } from "../common";
import { fetchCachedData } from "../misc";
import CustomCalendar from "./CustomCalendar";

const testData = [
  {
    id: "P7NyRsWsN5Y4iD68NkYF",
    startDate: [2022, 3, 17],
    endDate: [2022, 3, 17],
    renderType: "PRIMARY",
    type: 1,
    title: "Ess",
  },
  {
    id: "P7NyRsWsN5Y4iD68NkYF",
    startDate: [2022, 3, 17],
    endDate: [2022, 3, 17],
    renderType: "SECONDARY",
    type: 4,
    title: "Idkdfsfd",
  },
  {
    id: "P7NyRsWsN5Y4iD68NkYF",
    startDate: [2022, 3, 17],
    endDate: [2022, 3, 17],
    renderType: "SECONDARY",
    type: 3,
    title: "Ferie Zimowe 2022 (Śląsk)",
  },
  {
    id: "P7NyRsWsN5Y4iD68NkYF",
    startDate: [2022, 3, 18],
    endDate: [2022, 3, 18],
    renderType: "SECONDARY",
    type: 2,
    title: "Idk teścik",
  },
  {
    id: "P7NyRsWsN5Y4iD68NkYF",
    startDate: [2022, 3, 8],
    endDate: [2022, 3, 8],
    renderType: "PRIMARY",
    type: 0,
    title: "Wybory do młodzieżowej rady miasta",
  },
  {
    id: "P7NyRsWsN5Y4iD68NkYF",
    startDate: [2022, 3, 8],
    endDate: [2022, 3, 8],
    renderType: "SECONDARY",
    type: 5,
    title: "Dzień kobiet",
  },
];

const legendColours = [
  { top: "#FFA600", bottom: "#FFC100" },
  { top: "#CC00FF", bottom: "#FF0000" },
  "#00E308",
  "#01B3FF",
  "#FFCC00",
  "#FF0000",
  "#E600FF",
];

export const eventSubtypes = [
  "święta/wydarzenia szkolne",
  "święta/wydarzenia ogólnopolskie",
  "dzień wolny od zajęć dydaktycznych",
  "ferie zimowe",
  "przerwa wakacyjna",
  "matury i inne egzaminy",
  "inne",
];

const CalendarPreview = ({
  data,
  updateCache,
  onCalendarClick,
  onMonthChange,
  onYearChange,
  year,
  month,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (year === undefined || month === undefined) return;
    const fetchArgs = {
      setData,
      setLoaded,
      updateCache,
      onSuccessCallback: (data) =>
        data && !data.errorDescription ? data : null,
    };
    const fetchURL = `/calendar/${year}/${month}/`;
    const cacheName = `calendar_${year}_${month}`;

    fetchCachedData(cacheName, fetchURL, fetchArgs);
  }, [updateCache, year, month]);

  useEffect(() => {
    console.log("Calendar events:", events);
  }, [events]);

  /** Callback function to be called when the calendar data is fetched. */
  const setData = (data) => {
    setEvents(data.events);
  };
  // if (!loaded) {
  //   return (
  //     <div style={{ backgroundColor: "transparent" }}>
  //       <Bars color="#FFA900" height={50} width={50} />
  //     </div>
  //   );
  // }

  const _generateLegend = () => {
    return eventSubtypes.map((el, i) => (
      <li
        key={i}
        className={`flex flex-row justify-start align-middle w-full my-2 lg:my-3 ${
          i === 1 ? "mb-4 mt-3 lg:mt-4 lg:mb-5" : null
        } `}
      >
        <div
          className={`${
            i < 2
              ? "h-6 w-6 lg:h-7 lg:w-7 "
              : "w-3 h-3 lg:w-4 lg:h-4 ml-[1.1rem] lg:ml-[1.15rem]"
          } rounded-full my-auto m-3 drop-shadow-2xl`}
          style={{
            background:
              i < 2
                ? `linear-gradient(135deg, ${legendColours[i].top}, ${legendColours[i].bottom})`
                : null,
            backgroundColor: i >= 2 ? legendColours[i] : null,
          }}
        />
        <p className="my-auto text-[#292929] text-base -tracking-[.015rem] lg:text-[1.1rem]">
          {el}
        </p>
      </li>
    ));
  };

  return (
    <div className="flex flex-col md:flex-row mx-auto justify-center lg:justify-evenly align-middle my-6 md:my-8 w-full sm:w-10/12 md:w-full lg:w-10/12 xl:-translate-x-10">
      <div className="w-full mx-auto max-w-[27rem] lg:w-[27rem] lg:mx-auto mb-4">
        <CustomCalendar
          events={[...events, ...data]}
          onClickDate={onCalendarClick}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
          baseColors={legendColours}
        />
      </div>
      <div className="hidden lg:block lg:-mx-7 lg:-mr-8" />

      <div className=" w-fit pt-3 min-w-fit lg:mx-auto lg:ml-14 xl:mx-auto">
        <h3 className="text-text1 font-semibold text-xl mx-2 mb-3 lg:text-2xl lg:mb-4">
          Legenda:
        </h3>
        <ul>{_generateLegend()}</ul>
      </div>
    </div>
  );
};

export default CalendarPreview;
