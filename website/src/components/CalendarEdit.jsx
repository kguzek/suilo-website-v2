import React, { useEffect, useState } from "react";
import { Plus, Trash, Edit3 } from "react-feather";
import InputBox from "../components/InputBox";
import InputDropdown from "../components/InputDropdown";
import DialogBox from "../components/DialogBox";
import { fetchWithToken } from "../firebase";
import { LoadingScreen, LoadingButton } from "../pages/Edit";

export const CalendarEdit = ({
  data,
  loaded,
  refetchData,
  setYear,
  setMonth,
}) => {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("");
  const [subtype, setSubtype] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [colour, setColour] = useState("");

  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  const [popupSuccess, setPopupSuccess] = useState(false);
  const [popupDelete, setPopupDelete] = useState(false);

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
    setName(event.title);
    setSubtype(event.type);
    // setStartDate(serialiseDateArray(event.startDate));
    // setEndDate(serialiseDateArray(event.endDate));
    setStartDate(event.date.start);
    setEndDate(event.date.end);
    setColour(event.colour);
    setEventType(event.renderType);
  }, [currentlyActive]);

  // Display loading screen if calendar data hasn't been retrieved yet
  if (!loaded) {
    return <LoadingScreen />;
  }

  const eventSubtypes = data?.eventSubtypes ?? [];
  const calendarEvents = {};
  for (const event of data?.events ?? []) {
    calendarEvents[event.id] = event.title;
  }

  // Bitwise AND to ensure both functions are called
  const refresh = () => refetchData() & _resetAllInputs();

  function _resetAllInputs() {
    for (const setVar of [
      setName,
      setEventType,
      setSubtype,
      setStartDate,
      setEndDate,
      setColour,
    ]) {
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
    // ?title=Nazwa wydarzenia kalendarzowego.&type=0&startDate=1&endDate=1&isPrimary=true&colour=#000000
    const params = {
      title: name,
      type: subtype,
      startDate,
      endDate,
      isPrimary: eventType.toUpperCase().trim() === "PRIMARY",
      colour,
    };
    fetchWithToken(url, method, params).then((res) => {
      // Update the data once request is sent
      refresh();
      setClickedSubmit(false);
    });
    setPopupSuccess(true);
  }

  function _handleDelete() {
    setClickedDelete(true);
    fetchWithToken(`/calendar/${currentlyActive}`, "DELETE").then((res) => {
      // Update the data once request is sent
      refresh();
      setClickedDelete(false);
    });
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
      <InputDropdown
        label="Wydarzenie do edycji"
        currentValue={currentlyActive}
        onChangeCallback={setCurrentlyActive}
        defaultLabel="Nowe wydarzenie"
        valueDisplayObject={calendarEvents}
      />
      {/* TODO: Change this InputBox to an input checkbox/radiobox/dropdown */}
      <InputBox
        maxLength={9}
        name="event-type"
        placeholder="Typ wydarzenia (PRIMARY | SECONDARY)"
        value={eventType}
        onChange={setEventType}
      />
      <InputDropdown
        label="Subtyp wydarzenia"
        currentValue={subtype}
        onChangeCallback={setSubtype}
        defaultLabel="inne"
        valueDisplayObject={Object.fromEntries(eventSubtypes.entries())}
      />
      <InputBox
        maxLength={60}
        name="event-name"
        placeholder="Nazwa wydarzenia"
        value={name}
        onChange={setName}
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
          placeholder="Rozpoczęcie"
          value={startDate}
          onChange={setStartDate}
        />
        <p className="from-to-indicator">-</p>
        <InputBox
          width="47%"
          name="event-time-end"
          type="date"
          pattern="dd/mm/yyyy"
          placeholder="Zakończenie"
          value={endDate}
          onChange={setEndDate}
        />
      </div>

      <div className="fr" style={{ width: "100%", justifyContent: "right" }}>
        {currentlyActive !== "_default" &&
          (clickedDelete ? (
            <LoadingButton />
          ) : (
            <button
              type="button"
              className="delete-btn"
              onClick={() => setPopupDelete(true)}
            >
              <Trash color="rgb(252, 63, 30)" size={20} />
              <p>usuń post</p>
            </button>
          ))}
        {clickedSubmit ? (
          <LoadingButton style="opaque" />
        ) : (
          <button type="submit" className="add-btn">
            {currentlyActive !== "_default" ? (
              <Edit3 color="#FFFFFF" size={24} />
            ) : (
              <Plus color="#FFFFFF" size={24} />
            )}
            <p>
              {currentlyActive !== "_default"
                ? "edytuj wydarzenie"
                : "dodaj wydarzenie"}
            </p>
          </button>
        )}
      </div>
    </form>
  );
};
