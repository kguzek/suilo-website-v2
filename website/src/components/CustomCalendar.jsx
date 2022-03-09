import React, { useEffect, useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'react-feather'

const daysOfWeek = [
    {
        short: "Pon",
        long: "Poniedziałek",
        ang: "Mon"
    },
    {
        short: "Wt",
        long: "Wtorek",
        ang: "Tue"
    },
    {
        short: "Śr",
        long: "Środa",
        ang: "Wed"
    },
    {
        short: "Czw",
        long: "Czwartek",
        ang: "Thu"
    },
    {
        short: "Pt",
        long: "Piątek",
        ang: "Fri"
    },
    {
        short: "Sob",
        long: "Sobota",
        ang: "Sat"
    },
    {
        short: "Ndz",
        long: "Niedziela",
        ang: "Sun"
    },
]

const monthsOfYear = [
    {
        short: "Sty",
        long: "Styczeń"
    },
    {
        short: "Lut",
        long: "Luty"
    },
    {
        short: "Mar",
        long: "Marzec"
    },
    {
        short: "Kwi",
        long: "Kwiecień"
    },
    {
        short: "Maj",
        long: "Maj"
    },
    {
        short: "Cze",
        long: "Czerwiec"
    },
    {
        short: "Lip",
        long: "Lipiec"
    },
    {
        short: "Sie",
        long: "Sierpień"
    },
    {
        short: "Wrz",
        long: "Wrzesień"
    },
    {
        short: "Paź",
        long: "Październik"
    },
    {
        short: "Lis",
        long: "Listopad"
    },
    {
        short: "Gru",
        long: "Grudzień"
    }
]

const getDaysInMonth = (month, year) => {
    let date = new Date(Date.UTC(year, month, 1));
    let days = [];
    while (date.getUTCMonth() === month) {
        days.push(new Date(date));
        date.setUTCDate(date.getUTCDate() + 1);
    }
    return days;
}

const CalendarCell = ({ daysInPrevMonth, baseColors, daysInMonth, onPress, idx, type, daysBefore, daysCurrent, length, events, changeMonth }) => {
    const beginningOfTheWeek = ((String(daysInMonth[idx - daysBefore]).substring(0, 3) === "Mon") || (idx === 0)) ? true : false;
    const endOfTheWeek = ((String(daysInMonth[idx - daysBefore]).substring(0, 3) === "Sun") || (idx === length - 1)) ? true : false;
    let newPrimEvents = [];
    let newSecEvents = [];
    let eventIDs = [];
    const d = new Date()
    const isToday = ((idx - daysBefore + 1) === d.getDate()) ? true : false;
    let title = "";

    events.forEach((el, i) => {
        if (el.startDate[2] === (idx + 1 - daysBefore)) {
            if (el.renderType === "PRIMARY") {
                newPrimEvents.push(el)
            } else if (el.renderType === "SECONDARY") {
                newSecEvents.push(el)
            }
        }
    })

    // save all ids for current date
    newPrimEvents.forEach(el => eventIDs.push(el.id))
    newSecEvents.forEach(el => eventIDs.push(el.id))

    // make one title string for date
    newPrimEvents.forEach((el, i) => title = ((title.length !== 0 ? "\n" : "") + title + el.title))
    newSecEvents.forEach((el, i) => title = (title + "\n" + el.title))

    return (
        <div
            onClick={() => { return type === "_BEFORE_" ? changeMonth("_PREV_") : type === "_AFTER_" ? changeMonth("_NEXT_") : onPress((idx - daysBefore + 1), eventIDs) }}
            title={title}
            className={`
                w-full relative inline-flex justify-center font-medium align-middle aspect-square
                ${isToday ? "bg-primary/20 hover:bg-primaryDark/30" : "hover:bg-gray-200/75"}
                 transition duration-[75ms] border-gray-200/70 
                ${endOfTheWeek ? "border-r-[0px]" : "border-r-[1px]"} ${idx < 7 ? "border-t-white" : "border-t-gray-200/70"} 
                border-t-[1px] group select-none ${newPrimEvents[0] && "cursor-pointer"}
                text-base lg:text-lg
            `}
        >
            {
                newPrimEvents[0] &&
                <>
                    <div
                        style={{ animationDelay: (String(idx * 35) + "ms") }}
                        className={`m-auto animate-slow-ping origin-bottom -translate-y-1/2 scale-105 top-1/2 w-2/3 aspect-square absolute rounded-full 
                    bg-gradient-to-br ${!newPrimEvents[0].type ? "from-primary to-secondary" : "from-[#CC00FF] to-[#FF0000]"}`}
                    />
                    <div
                        className={`m-auto shadow-md -translate-y-1/2 scale-105 top-1/2 w-2/3 aspect-square absolute rounded-full 
                    bg-gradient-to-br ${!newPrimEvents[0].type ? "from-primary to-secondary" : "from-[#CC00FF] to-[#FF0000]"}`}
                    />
                </>

            }
            {type === "_BEFORE_" ?
                <p
                    className="m-auto text-slate-300 text-center"
                >
                    {(daysInPrevMonth - daysBefore + idx + 1)}
                </p> :
                type === "_CURRENT_" ?
                    <p
                        className={`
                            m-auto text-center z-10 ${newPrimEvents[0] !== undefined ? "text-white" : String(daysInMonth[idx - daysBefore]).substring(0, 3) === "Sun" ? "text-[#FF1818]" :
                                String(daysInMonth[idx - daysBefore]).substring(0, 3) === "Sat" ? "text-text4" : "text-text2"}
                        `}
                    >
                        {(idx + 1 - daysBefore)}
                    </p>
                    :
                    type === "_AFTER_" ?
                        <p
                            className="m-auto text-center text-slate-300"
                        >
                            {(idx + 1 - (daysBefore + daysCurrent))}
                        </p> :
                        null
            }{
                newSecEvents[0] &&
                <div className="absolute top-px right-px flex flex-row justify-end py-px">
                    {newSecEvents[0] && <div className="mr-[2px] z-20 "><div className={`w-2 h-2 rounded-full absolute animate-slow-ping `} style={{ backgroundColor: baseColors[newSecEvents[0].type], animationDelay: (String(idx * 50) + "ms") }} /><div className={`w-2 h-2 rounded-full `} style={{ backgroundColor: baseColors[newSecEvents[0].type] }} /></div>}
                    {newSecEvents[1] && <div className="mr-[2px] z-20"><div className={`w-2 h-2 rounded-full absolute animate-slow-ping `} style={{ backgroundColor: baseColors[newSecEvents[1].type], animationDelay: (String(idx * 50 + 25) + "ms") }} /><div className={`w-2 h-2 rounded-full `} style={{ backgroundColor: baseColors[newSecEvents[1].type] }} /></div>}
                    {newSecEvents[2] && <div className="mr-[2px] z-20"><div className={`w-2 h-2 rounded-full absolute animate-slow-ping `} style={{ backgroundColor: baseColors[newSecEvents[2].type], animationDelay: (String(idx * 50 + 50) + "ms") }} /><div className={`w-2 h-2 rounded-full `} style={{ backgroundColor: baseColors[newSecEvents[2].type] }} /></div>}
                    {newSecEvents[3] && <div className="mr-[2px] z-20"><div className={`w-2 h-2 rounded-full absolute animate-slow-ping `} style={{ backgroundColor: baseColors[newSecEvents[3].type], animationDelay: (String(idx * 50 + 75) + "ms") }} /><div className={`w-2 h-2 rounded-full `} style={{ backgroundColor: baseColors[newSecEvents[3].type] }} /></div>}
                </div>
            }

        </div >
    )
}

const CustomCalendar = ({ events, onMonthChange, onClickDate, baseColors }) => {
    const d = new Date;
    const [currentMonth, setCurrMonth] = useState(d.getMonth())
    const [currentYear, setCurrYear] = useState(d.getFullYear())
    const [daysInMonth, setDaysInMonth] = useState([])
    const [daysInPrevMonth, setDaysInPrevMonth] = useState([])
    const [daysInNextMonth, setDaysInNextMonth] = useState([])

    useEffect(() => {
        if (currentMonth === 0) {
            setDaysInPrevMonth(getDaysInMonth(11, (currentYear - 1)))
            setDaysInNextMonth(getDaysInMonth((currentMonth + 1), currentYear))
        } else if (currentMonth === 11) {
            setDaysInPrevMonth(getDaysInMonth((currentMonth - 1), currentYear))
            setDaysInNextMonth(getDaysInMonth(0, (currentYear + 1)))
        } else {
            setDaysInPrevMonth(getDaysInMonth((currentMonth - 1), currentYear))
            setDaysInNextMonth(getDaysInMonth((currentMonth + 1), currentYear))
        }
        setDaysInMonth(getDaysInMonth(currentMonth, currentYear))
        onMonthChange(currentMonth + 1)
    }, [currentMonth])

    const _clickAction = (day, eventIDs) => {
        onClickDate({ day: day, month: currentMonth + 1, year: currentYear, eventIDs: eventIDs })
    }

    const _setDateToday = () => {
        let td = new Date;
        setCurrMonth(td.getMonth())
        setCurrYear(td.getFullYear())
    }

    const _generateHeader = () => {
        return daysOfWeek.map((el, i) => <div key={String(el.long) + "_" + String(i)} className="col-span-1 inline-flex justify-center align-bottom"><p className="m-auto text-text3 font-base text-xs -mt-1 -mb-px">{el.short}</p></div>)
    }

    const _generateDay = () => {
        let daysBefore;
        let daysAfter;

        switch (String(daysInMonth[0]).substring(0, 3)) {
            case "Mon":
                daysBefore = 0;
                break;
            case "Tue":
                daysBefore = 1;
                break;
            case "Wed":
                daysBefore = 2;
                break;
            case "Thu":
                daysBefore = 3;
                break;
            case "Fri":
                daysBefore = 4;
                break;
            case "Sat":
                daysBefore = 5;
                break;
            case "Sun":
                daysBefore = 6;
                break;
            default:
                daysBefore = 0;
        }
        switch (String(daysInMonth[daysInMonth.length - 1]).substring(0, 3)) {
            case "Mon":
                daysAfter = 6;
                break;
            case "Tue":
                daysAfter = 5;
                break;
            case "Wed":
                daysAfter = 4;
                break;
            case "Thu":
                daysAfter = 3;
                break;
            case "Fri":
                daysAfter = 2;
                break;
            case "Sat":
                daysAfter = 1;
                break;
            case "Sun":
                daysAfter = 0;
                break;
            default:
                daysAfter = 0;
        }

        let renderArray = [];

        for (let i = 0; i < daysBefore; i++) {
            renderArray.push("_BEFORE_")
        }
        for (let i = 0; i < daysInMonth.length; i++) {
            renderArray.push("_CURRENT_")
        }
        for (let i = 0; i < daysAfter; i++) {
            renderArray.push("_AFTER_")
        }

        return renderArray.map((el, idx) => <CalendarCell baseColors={baseColors} onPress={_clickAction} changeMonth={_changeMonth} events={events} key={el + idx} type={el} idx={idx} daysInMonth={daysInMonth} length={renderArray.length} daysBefore={daysBefore} daysCurrent={(renderArray.length - (daysBefore + daysAfter))} daysInPrevMonth={daysInPrevMonth.length} />)
    }

    const _changeMonth = (typeOfChange) => {
        if (typeOfChange === "_PREV_") {
            if (currentMonth === 0) {
                setCurrMonth(11)
                setCurrYear((currentYear - 1))
            } else {
                setCurrMonth((currentMonth - 1))
            }
        }
        else if (typeOfChange === "_NEXT_") {
            if (currentMonth === 11) {
                setCurrMonth(0)
                setCurrYear((currentYear + 1))
            } else {
                setCurrMonth((currentMonth + 1))
            }
        }
    }

    return (
        <div className="drop-shadow-3xl">
            <div className="rounded-t-2xl inline-flex px-2 py-1 lg:py-[.35rem] lg:px-[.65rem] w-full justify-between align-middle bg-gradient-to-br from-primary to-secondary">
                <div onClick={() => _changeMonth("_PREV_")} className="cursor-pointer group select-none inline-flex justify-center align-middle  my-auto rounded-full transition-all p-1 -m-1 duration-150 hover:bg-black/10 active:bg-black/20">
                    <ChevronLeft size={18} className="stroke-white stroke-[2.5px] m-auto" />
                </div>
                <p className="capitalize text-white text-lg lg:text-xl font-semibold m-auto cursor-pointer pt-px" onClick={() => _setDateToday()}>
                    {monthsOfYear[currentMonth].long.toUpperCase()}&nbsp;{currentYear}
                </p>
                <div onClick={() => _changeMonth("_NEXT_")} className="cursor-pointer group inline-flex justify-center align-middle select-none my-auto rounded-full transition-all p-1 -m-1 duration-150 hover:bg-black/10 active:bg-black/20">
                    <ChevronRight size={18} className="stroke-white stroke-[2.5px] m-auto " />
                </div>
            </div>
            <div className="bg-white p-5 rounded-b-2xl">
                <div className="grid grid-cols-7 w-full">
                    {_generateHeader()}
                </div>
                <div className="grid grid-cols-7 w-full">
                    {_generateDay()}
                </div>
            </div>
        </div>
    )
}

export default CustomCalendar