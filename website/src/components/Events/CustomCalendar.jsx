import React, { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const daysOfWeek = [
  {
    short: "Pon",
    long: "Poniedziałek",
    ang: "Mon",
  },
  {
    short: "Wt",
    long: "Wtorek",
    ang: "Tue",
  },
  {
    short: "Śr",
    long: "Środa",
    ang: "Wed",
  },
  {
    short: "Czw",
    long: "Czwartek",
    ang: "Thu",
  },
  {
    short: "Pt",
    long: "Piątek",
    ang: "Fri",
  },
  {
    short: "Sob",
    long: "Sobota",
    ang: "Sat",
  },
  {
    short: "Ndz",
    long: "Niedziela",
    ang: "Sun",
  },
];

const monthsOfYear = [
  {
    short: "Sty",
    long: "Styczeń",
  },
  {
    short: "Lut",
    long: "Luty",
  },
  {
    short: "Mar",
    long: "Marzec",
  },
  {
    short: "Kwi",
    long: "Kwiecień",
  },
  {
    short: "Maj",
    long: "Maj",
  },
  {
    short: "Cze",
    long: "Czerwiec",
  },
  {
    short: "Lip",
    long: "Lipiec",
  },
  {
    short: "Sie",
    long: "Sierpień",
  },
  {
    short: "Wrz",
    long: "Wrzesień",
  },
  {
    short: "Paź",
    long: "Październik",
  },
  {
    short: "Lis",
    long: "Listopad",
  },
  {
    short: "Gru",
    long: "Grudzień",
  },
];

const getDaysInMonth = (month, year) => {
  let date = new Date(Date.UTC(year, month, 1));
  let days = [];
  while (date.getUTCMonth() === month) {
    days.push(new Date(date));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return days;
};

const CalendarCell = ({
  daysInPrevMonth,
  baseColors,
  daysInMonth,
  onPress,
  idx,
  type,
  daysBefore,
  daysCurrent,
  length,
  events,
  currentMonth,
  changeMonth,
}) => {
  const isSunday = daysInMonth[idx - daysBefore]?.getDay() === 0;
  // const isMonday = daysInMonth[idx - daysBefore]?.getDay() === 1;
  const isSaturday = daysInMonth[idx - daysBefore]?.getDay() === 6;
  // const beginningOfTheWeek = isMonday || idx === 0;
  const endOfTheWeek = isSunday || idx === length - 1;
  const newPrimEvents = [];
  const newSecEvents = [];
  const eventIDs = [];
  const d = new Date();
  const isToday =
    idx - daysBefore + 1 === d.getDate() && currentMonth === d.getMonth()
      ? true
      : false;

  const primTitles = [];
  const secTitles = [];

  events.forEach((el) => {
    const [_year, month, day] = el.startDate;
    if (month !== currentMonth + 1) return;
    if (day === idx + 1 - daysBefore) {
      if (el.renderType === "PRIMARY") {
        newPrimEvents.push(el);
        primTitles.push(el.title);
      } else if (el.renderType === "SECONDARY") {
        newSecEvents.push(el);
        secTitles.push(el.title);
      } else {
        console.warn("Invalid event render type:", el);
      }
      // save all ids for current date
      eventIDs.push(el.id);
    }
  });

  if (isNaN(daysCurrent) || isNaN(daysInPrevMonth)) return null;

  return (
    <div
      onClick={() => {
        return type === "_BEFORE_"
          ? changeMonth("_PREV_")
          : type === "_AFTER_"
            ? changeMonth("_NEXT_")
            : onPress(idx - daysBefore + 1, eventIDs);
      }}
      title={[...primTitles, ...secTitles].join("\n")}
      className={`w-full relative inline-flex justify-center font-medium align-middle aspect-square ${isToday
        ? "bg-primary/20 hover:bg-primaryDark/30"
        : "hover:bg-gray-200/75"
        } transition duration-[75ms] border-gray-200/70 ${endOfTheWeek ? "border-r-[0px]" : "border-r-[1px]"
        } ${idx < 7 ? "border-t-white" : "border-t-gray-200/70"
        } border-t-[1px] group select-none ${newPrimEvents[0] && "cursor-pointer"
        } text-[.95rem] sm:text-base lg:text-lg`}
    >
      {newPrimEvents[0] && (
        <>
          <div
            style={{ animationDelay: `${idx * 35}ms` }}
            className={`m-auto animate-slow-ping origin-bottom -translate-y-1/2 scale-105 top-1/2 w-2/3 aspect-square absolute rounded-full bg-gradient-to-br ${newPrimEvents[0].type
              ? "from-[#CC00FF] to-[#FF0000]"
              : "from-primary to-secondary"
              }`}
          />
          <div
            className={`m-auto shadow-md -translate-y-1/2 scale-105 top-1/2 w-2/3 aspect-square absolute rounded-full bg-gradient-to-br ${newPrimEvents[0].type
              ? "from-[#CC00FF] to-[#FF0000]"
              : "from-primary to-secondary"
              }`}
          />
        </>
      )}
      {type === "_BEFORE_" ? (
        <p className="m-auto text-slate-300 text-center">
          {idx + 1 - daysBefore + daysInPrevMonth}
        </p>
      ) : type === "_CURRENT_" ? (
        <p
          className={`m-auto text-center z-10 ${newPrimEvents.length
            ? "text-white"
            : isSunday
              ? "text-[#FF1818]"
              : isSaturday
                ? "text-text7"
                : "text-text5"
            }`}
        >
          {idx + 1 - daysBefore}
        </p>
      ) : (
        type === "_AFTER_" && (
          <p className="m-auto text-center text-slate-300">
            {idx + 1 - daysBefore - daysCurrent}
          </p>
        )
      )}
      <div className="absolute top-px right-px flex flex-row justify-end py-px">
        {newSecEvents.map((secEvent, eventIdx) => (
          <div key={eventIdx} className="mr-[2px] z-20 ">
            <div
              className="w-2 h-2 rounded-full absolute animate-slow-ping"
              style={{
                backgroundColor: baseColors[secEvent.type],
                animationDelay: `${idx * 50 + eventIdx * 25}ms`,
              }}
            />
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: baseColors[secEvent.type] }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomCalendar = ({
  events,
  onMonthChange,
  onYearChange,
  onClickDate,
  baseColors,
}) => {
  const d = new Date();
  const [currentMonth, setCurrMonth] = useState(d.getMonth());
  const [currentYear, setCurrYear] = useState(d.getFullYear());
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [daysInPrevMonth, setDaysInPrevMonth] = useState([]);
  // const [daysInNextMonth, setDaysInNextMonth] = useState([]);

  useEffect(() => {
    // Previous month
    if (currentMonth === 0) {
      setDaysInPrevMonth(getDaysInMonth(11, currentYear - 1));
    } else {
      setDaysInPrevMonth(getDaysInMonth(currentMonth - 1, currentYear));
    }
    // // Next month
    // if (currentMonth === 11) {
    //   setDaysInNextMonth(getDaysInMonth(0, currentYear + 1));
    // } else {
    //   setDaysInNextMonth(getDaysInMonth(currentMonth + 1, currentYear));
    // }

    setDaysInMonth(getDaysInMonth(currentMonth, currentYear));
    onMonthChange(currentMonth + 1);
    console.log(daysInMonth)
  }, [currentMonth]);

  useEffect(() => {
    onYearChange(currentYear);
  }, [currentYear]);

  const _clickAction = (day, eventIDs) => {
    onClickDate({
      day: day,
      month: currentMonth + 1,
      year: currentYear,
      eventIDs,
    });
  };

  const _setDateToday = () => {
    let td = new Date();
    setCurrMonth(td.getMonth());
    setCurrYear(td.getFullYear());
  };

  const _generateHeader = () => {
    return daysOfWeek.map((el, i) => (
      <div
        key={`${el.long}_${i}`}
        className="col-span-1 inline-flex justify-center align-bottom"
      >
        <p className="m-auto text-text3 font-base text-xs -mt-1 -mb-px">
          {el.short}
        </p>
      </div>
    ));
  };

  const _generateDay = () => {
    // Day of the week of the first day of the month
    const daysBefore = (daysInMonth[0]?.getDay() + 6) % 7;
    // 6 - day of the week of the last day of the month
    const daysAfter =
      6 -
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(
        String(daysInMonth[daysInMonth.length - 1]).substring(0, 3)
      );

    const renderArray = [];

    let i;
    for (i = 0; i < daysBefore; i++) {
      renderArray.push("_BEFORE_");
    }
    for (const _ of daysInMonth) {
      renderArray.push("_CURRENT_");
    }
    for (i = 0; i < daysAfter; i++) {
      renderArray.push("_AFTER_");
    }

    return renderArray.map((el, idx) => (
      <CalendarCell
        baseColors={baseColors}
        onPress={_clickAction}
        changeMonth={_changeMonth}
        events={events}
        key={el + idx}
        type={el}
        currentMonth={currentMonth}
        idx={idx}
        daysInMonth={daysInMonth}
        length={renderArray.length}
        daysBefore={daysBefore}
        daysCurrent={renderArray.length - (daysBefore + daysAfter)}
        daysInPrevMonth={daysInPrevMonth.length}
      />
    ));
  };

  const _changeMonth = (typeOfChange) => {
    if (typeOfChange === "_PREV_") {
      if (currentMonth === 0) {
        setCurrMonth(11);
        setCurrYear(currentYear - 1);
      } else {
        setCurrMonth(currentMonth - 1);
      }
    } else if (typeOfChange === "_NEXT_") {
      if (currentMonth === 11) {
        setCurrMonth(0);
        setCurrYear(currentYear + 1);
      } else {
        setCurrMonth(currentMonth + 1);
      }
    }
  };

  return (
    <div className="drop-shadow-3xl">
      <div className="rounded-t-2xl inline-flex px-2 py-1 lg:py-[.35rem] lg:px-[.65rem] w-full justify-between align-middle bg-gradient-to-br from-primary to-secondary">
        <div
          onClick={() => _changeMonth("_PREV_")}
          className="cursor-pointer group select-none inline-flex justify-center align-middle  my-auto rounded-full transition-all p-1 -m-1 duration-150 hover:bg-black/10 active:bg-black/20"
        >
          <ChevronLeft
            size={18}
            className="stroke-white stroke-[2.5px] m-auto"
          />
        </div>
        <p
          className="capitalize text-white text-lg lg:text-xl font-semibold m-auto cursor-pointer pt-px"
          onClick={() => _setDateToday()}
        >
          {monthsOfYear[currentMonth].long.toUpperCase()}&nbsp;{currentYear}
        </p>
        <div
          onClick={() => _changeMonth("_NEXT_")}
          className="cursor-pointer group inline-flex justify-center align-middle select-none my-auto rounded-full transition-all p-1 -m-1 duration-150 hover:bg-black/10 active:bg-black/20"
        >
          <ChevronRight
            size={18}
            className="stroke-white stroke-[2.5px] m-auto "
          />
        </div>
      </div>
      <div className="bg-white p-5 rounded-b-2xl">
        <div className="grid grid-cols-7 w-full">{_generateHeader()}</div>
        <div className="grid grid-cols-7 w-full">{_generateDay()}</div>
      </div>
    </div>
  );
};

export default CustomCalendar;
