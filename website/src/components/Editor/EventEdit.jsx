import React, { useEffect, useState } from "react";
import { Plus, Trash, Edit3 } from "react-feather";
import InputBox from "./InputComponents/InputBox";
import InputArea from "./InputComponents/InputArea";
import InputDropdown from "./InputComponents/InputDropdown";
import DialogBox from "../DialogBox";
import { formatDate, formatTime, setErrorMessage } from "../../misc";
import { serialiseDateArray } from "../../common";
import { fetchWithToken } from "../../firebase";
import LoadingScreen from "../LoadingScreen";
import { eventSubtypes } from "../Events/Calendar";
import InputPhoto from "./InputComponents/InputPhoto";

export const EventEdit = ({
  data,
  loaded,
  refetchData,
  refetchStorage,
  photos,
}) => {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [title, setTitle] = useState("");
  const [type, setType] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [oldImageURL, setOldImageURL] = useState("");
  const [newImageURL, setNewImageURL] = useState("");
  const [eventURL, setEventURL] = useState("");
  // const [imageAuthor, setImageAuthor] = useState("");
  // const [imageAltText, setImageAltText] = useState("");
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
    const event = (data?.contents ?? [])
      .filter((event) => event.id === currentlyActive)
      .shift();
    if (!event) {
      // No currently selected event
      return void _resetAllInputs();
    }
    setTitle(event.title);
    setType(event.type ?? 0);
    setDescription(event.content);
    setDate(serialiseDateArray(event.date));
    setStartTime(formatTime(event.startTime));
    setEndTime(formatTime(event.endTime));
    // location, image and external URL are all nullable
    setLocation(event.location ?? "");
    setOldImageURL(event.photo ?? "");
    setNewImageURL(event.photo ?? "");
    setEventURL(event.link ?? "");
  }, [currentlyActive]);

  // Display loading screen if events data hasn't been retrieved yet
  if (!loaded) {
    return <LoadingScreen />;
  }

  const events = {};
  for (const event of data?.contents ?? []) {
    const date = formatDate(event.date);
    events[event.id] = `${event.title} (${date})`;
  }

  function _resetAllInputs() {
    for (const setVar of [
      setTitle,
      setDescription,
      setDate,
      setStartTime,
      setEndTime,
      setLocation,
      setOldImageURL,
      setNewImageURL,
      setEventURL,
    ]) {
      setVar("");
    }
    setType(0);
    setCurrentlyActive("_default");
  }

  function _handleSubmit(e) {
    e.preventDefault();
    setClickedSubmit(true);
    let url = "/events/";
    let method = "POST";
    // Check if an existing post is selected
    if (currentlyActive !== "_default") {
      method = "PUT";
      url += currentlyActive;
    }
    // ?title=Tytuł wydarzenia&type=0&date=1970-01-01&startTime=00:00&endTime=23:59location=null&photo=null&link=null&content=Treść wydarzenia...
    const params = {
      title,
      type,
      date,
      startTime,
      endTime,
      location,
      photo: newImageURL,
      link: eventURL,
      content: description,
    };
    /*
    if(imgRef){
      const metadata = {
        customMetadata:{
          photoAuthor: imageAuthor,
          alt: imageAltText,
        }
      }
      updateMetadata(imgRef, metadata)
      .then((meta) => {
        console.debug(meta);
      }).catch((error) => {
        console.error(error);
      })
    }
   */
    fetchWithToken(url, method, params).then((res) => {
      // Update the data once request is processed
      if (res.ok) {
        refetchData();
        _resetAllInputs();
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
    fetchWithToken(`/events/${currentlyActive}`, "DELETE").then((_res) => {
      // Update the data once request is processed
      refetchData();
      _resetAllInputs();
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
      <DialogBox
        header={`Bład! (HTTP ${errorCode})`}
        content="Nastąpił błąd podczas wykonywania tej akcji. Spróbuj ponownie."
        extra={popupError}
        type="DIALOG"
        buttonOneLabel="Ok"
        isVisible={popupError}
        setVisible={setPopupError}
      />
      <InputDropdown
        label="Wydarzenie do edycji"
        currentValue={currentlyActive}
        onChangeCallback={setCurrentlyActive}
        defaultLabel="Nowe wydarzenie"
        valueDisplayObject={events}
      />
      <InputBox
        name="event-name"
        placeholder="Tytuł"
        maxLength={64}
        value={title}
        onChange={setTitle}
      />
      <InputDropdown
        label="Typ wydarzenia"
        currentValue={type}
        onChangeCallback={setType}
        valueDisplayObject={eventSubtypes.slice(0, 2)}
      />
      <InputArea
        name="event-description"
        placeholder="Opis"
        maxLength={256}
        value={description}
        onChange={setDescription}
      />
      <InputBox
        name="event-date"
        type="date"
        pattern="dd/mm/yyyy"
        placeholder="Data wydarzenia"
        value={date}
        onChange={setDate}
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
          type="time"
          pattern="HH:mm"
          max={endTime}
          placeholder="Godzina rozpoczęcia"
          value={startTime}
          onChange={setStartTime}
        />
        <p className="from-to-indicator">-</p>
        <InputBox
          width="47%"
          name="event-time-end"
          type="time"
          pattern="HH:mm"
          min={startTime}
          placeholder="Godzina zakończenia"
          value={endTime}
          onChange={setEndTime}
        />
      </div>
      <InputBox
        name="location"
        placeholder="Miejsce wydarzenia"
        maxLength={64}
        value={location}
        onChange={setLocation}
      />
      {/* PLACE FOR TEXT EDITOR */}
      <InputPhoto
        oldImageURL={oldImageURL}
        newImageURL={newImageURL}
        setNewImageURL={setNewImageURL}
        photos={photos}
        currentlyActive={currentlyActive}
        refetchPhotos={refetchStorage}
      />
      <InputBox
        name="event-url"
        placeholder="Zewnętrzny link do wydarzenia"
        maxLength={256}
        value={eventURL}
        onChange={setEventURL}
        required={false}
      />
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
