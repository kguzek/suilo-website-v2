import React, { useEffect, useState } from "react";
import { Plus, Trash, Edit3 } from "react-feather";
import InputBox from "./InputComponents/InputBox";
import InputDropdown from "./InputComponents/InputDropdown";
import DialogBox from "../DialogBox";
import LoadingScreen from "../LoadingScreen";
import { eventSubtypes } from "../Events/Calendar";
import { fetchWithToken } from "../../firebase";
import { setErrorMessage } from "../../misc";

const MONTHS = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

export const CalendarEdit = ({
  data,
  loaded,
  refetchData,
  year,
  month,
  setYear,
  setMonth,
}) => {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [displayYear, setDisplayYear] = useState(
    year ?? new Date().getFullYear()
  );

  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  const [popupSuccess, setPopupSuccess] = useState(false);
  const [popupDelete, setPopupDelete] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const [errorCode, setErrorCode] = useState(null);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    // Get the currently selected event
    const event = (data?.events ?? [])
      .filter((event) => event.id === currentlyActive)
      .shift();
    if (!event) {
      // No currently selected event
      return void _resetAllInputs();
    }
    setTitle(event.title);
    setType(event.type - 2);
    setStartDate(event.date.start);
    setEndDate(event.date.end);
  }, [currentlyActive]);

  useEffect(() => {
    // Set the selected option to "new event" when the calendar period is changed
    _resetAllInputs();
    setCurrentlyActive("_default");
  }, [year, month]);

  // Display loading screen if calendar data hasn't been retrieved yet
  if (!loaded) {
    return <LoadingScreen />;
  }

  const calendarEvents = {};
  for (const event of data?.events ?? []) {
    calendarEvents[event.id] = event.title;
  }

  // Bitwise AND to ensure both functions are called
  const refresh = () => refetchData() & _resetAllInputs();

  function _resetAllInputs() {
    for (const setVar of [setTitle, setType, setStartDate, setEndDate]) {
      setVar("");
    }
    setCurrentlyActive("_default");
  }

  function _handleSubmit(e) {
    e.preventDefault();
    setClickedSubmit(true);
    let url = "/calendar/";
    let method = "POST";
    // Check if an existing event is selected
    if (currentlyActive !== "_default") {
      method = "PUT";
      url += currentlyActive;
    }
    // ?title=Nazwa wydarzenia kalendarzowego.&type=2&startDate=1&endDate=1
    const params = {
      title: title,
      type: parseInt(type) + 2,
      startDate,
      endDate,
    };
    fetchWithToken(url, method, params).then((res) => {
      // Update the data once request is processed
      if (res.ok) {
        refresh();
        setPopupSuccess(true);
      } else {
        setErrorCode(res.status);
        setErrorMessage(res, setPopupError);
      }
      setClickedSubmit(false);
    });
  }

  function _handleDelete() {
    setClickedDelete(true);
    fetchWithToken(`/calendar/${currentlyActive}`, "DELETE").then((_res) => {
      // Update the data once request is processed
      refresh();
      setClickedDelete(false);
    });
  }

  function _handleYearUpdate() {
    if (displayYear.length !== 4 || parseInt(displayYear) < 2022) {
      // Invalid year inputted
      setDisplayYear(year);
    } else {
      setYear(displayYear);
    }
  }

  return (
    <form className="w-full mt-6" onSubmit={_handleSubmit}>
      <DialogBox
        header="Sukces!"
        content="Pomyślnie dokonano wszelkich zmian"
        duration={2000}
        isVisible={popupSuccess}
        setVisible={setPopupSuccess}
      />
      <DialogBox
        header="Uwaga!"
        content="Czy na pewno chcesz usunąć zawartość? Ta akcja jest nieodwracalna."
        type="DIALOG"
        buttonOneLabel="Kontynuuj edycje"
        buttonTwoLabel="Usuń"
        buttonTwoCallback={_handleDelete}
        isVisible={popupDelete}
        setVisible={setPopupDelete}
      />
      <DialogBox
        header={`Bład! (HTTP ${errorCode})`}
        content="Nastąpił błąd podczas wykonywania tej akcji. Spróbuj ponownie."
        extra={popupError}
        type="DIALOG"
        buttonOneLabel="Ok"
        isVisible={popupError}
        setVisible={setPopupError}
      />
      <InputBox
        maxLength={4}
        name="event-year"
        type="number"
        placeholder="Rok w kalendarzu do edycji"
        value={displayYear}
        onChange={setDisplayYear}
        onBlur={_handleYearUpdate}
      />
      <InputDropdown
        label="Miesiąc w kalendarzu do edycji"
        currentValue={month}
        onChangeCallback={setMonth}
        valueDisplayObject={MONTHS}
      />
      <InputDropdown
        label="Wydarzenie do edycji"
        currentValue={currentlyActive}
        onChangeCallback={setCurrentlyActive}
        defaultLabel="Nowe wydarzenie"
        valueDisplayObject={calendarEvents}
        isFirst={false}
      />
      <InputDropdown
        label="Typ wydarzenia"
        currentValue={type}
        onChangeCallback={setType}
        valueDisplayObject={eventSubtypes.slice(2)}
        isFirst={false}
      />
      <InputBox
        maxLength={64}
        name="event-name"
        placeholder="Nazwa wydarzenia"
        value={title}
        onChange={setTitle}
      />
      <div
        className="fr"
        style={{
          width: "100%",
          margin: "-1em 0",
          justifyContent: "space-between",
        }}
      >
        <InputBox
          width="47%"
          name="event-time-start"
          type="date"
          pattern="dd/mm/yyyy"
          max={endDate}
          placeholder="Rozpoczęcie"
          value={startDate}
          onChange={setStartDate}
        />
        <p className="from-to-indicator">-</p>
        <InputBox
          width="47%"
          name="event-time-end"
          type="date"
          min={startDate}
          pattern="dd/mm/yyyy"
          placeholder="Zakończenie"
          value={endDate}
          onChange={setEndDate}
        />
      </div>

      <div className="fr" style={{ width: "100%", justifyContent: "right" }}>
        {currentlyActive !== "_default" &&
          (clickedDelete ? (
            <button
              type="button"
              className="delete-btn select-none cursor-wait"
              disabled
              style={{ pointerEvents: "none" }}
              onClick={() => setPopupDelete(true)}
            >
              <Trash color="rgb(252, 63, 30)" size={20} />
              <p>usuń wydarzenie</p>
            </button>
          ) : (
            <button
              type="button"
              className="delete-btn select-none cursor-pointer"
              style={{ pointerEvents: "all" }}
              onClick={() => setPopupDelete(true)}
            >
              <Trash color="rgb(252, 63, 30)" size={20} />
              <p>usuń wydarzenie</p>
            </button>
          ))}
        {clickedSubmit ? (
          <button
            type="submit"
            className="add-btn select-none cursor-wait"
            disabled
            style={{ pointerEvents: "none" }}
          >
            {currentlyActive !== "_default" ? (
              <Edit3 color="#FFFFFF" size={24} />
            ) : (
              <Plus color="#FFFFFF" size={24} />
            )}
            <p>
              {currentlyActive !== "_default"
                ? "zaktualizuj wydarzenie"
                : "dodaj wydarzenie"}
            </p>
          </button>
        ) : (
          <button
            type="submit  "
            className="add-btn select-none cursor-pointer"
            style={{ pointerEvents: "all" }}
          >
            {currentlyActive !== "_default" ? (
              <Edit3 color="#FFFFFF" size={24} />
            ) : (
              <Plus color="#FFFFFF" size={24} />
            )}
            <p>
              {currentlyActive !== "_default"
                ? "zaktualizuj wydarzenie"
                : "dodaj wydarzenie"}
            </p>
          </button>
        )}
      </div>
    </form>
  );
};
