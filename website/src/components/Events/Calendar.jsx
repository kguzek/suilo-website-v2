import React, { useEffect, useState } from "react";
import { fetchCachedData } from "../../misc";
import CustomCalendar from "./CustomCalendar";

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
  events,
  onCalendarClick,
  onMonthChange,
  onYearChange,
}) => {
  const _generateLegend = () => {
    return eventSubtypes.map((el, i) => (
      <li
        key={i}
        className={`flex flex-row justify-start align-middle w-full my-2 lg:my-3 ${i === 1 ? "mb-4 mt-3 lg:mt-4 lg:mb-5" : null
          } `}
      >
        <div
          className={`${i < 2
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
          events={events}
          onClickDate={onCalendarClick}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
          baseColors={legendColours}
        />
      </div>
      <div className="hidden lg:block lg:-mx-5 lg:-mr-6" />

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
