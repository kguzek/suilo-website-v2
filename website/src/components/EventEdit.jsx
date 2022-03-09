import React, { useEffect, useState } from "react";
import { Plus, Trash, Edit3 } from "react-feather";
import InputBox from "../components/InputBox";
import InputArea from "../components/InputArea";
import InputDropdown from "../components/InputDropdown";
import InputFile from "../components/InputFile";
import DialogBox from "../components/DialogBox";
import { formatDate, formatTime } from "../misc";
import { serialiseDateArray } from "../common";
import { fetchWithToken, storage } from "../firebase";
import { getDownloadURL, uploadBytesResumable, ref } from "firebase/storage";
import { LoadingScreen, LoadingButton } from "../pages/Edit";

export const EventEdit = ({ data, loaded, refetchData }) => {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [eventURL, setEventURL] = useState("");
  const [imagePath, setImagePath] = useState();
  const [imgRef, setImgRef] = useState();
  const [imageAuthor, setImageAuthor] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  const [popupSuccess, setPopupSuccess] = useState(false);
  const [popupDelete, setPopupDelete] = useState(false);

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
    setName(event.title);
    setDescription(event.content);
    setDate(serialiseDateArray(event.date));
    setStartTime(formatTime(event.startTime));
    setEndTime(formatTime(event.endTime));
    setLocation(event.location ?? ""); // location is nullable
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

  // Bitwise AND to ensure both functions are called
  const refresh = () => refetchData() & _resetAllInputs();

  function _resetAllInputs() {
    for (const setVar of [
      setName,
      setDescription,
      setDate,
      setStartTime,
      setEndTime,
      setLocation,
    ]) {
      setVar("");
    }
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
    // ?title=Tytuł wydarzenia&date=1970-01-01&startTime=00:00&endTime=23:59location=null&content=Treść wydarzenia...
    const params = {
      title: name,
      date,
      startTime,
      endTime,
      location,
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
        console.log(meta);
      }).catch((error) => {
        console.log(error);
      })
    }
   */
    fetchWithToken(url, method, params).then((res) => {
      // Update the data once request is processed
      res.ok && refresh();
      setClickedSubmit(false);
      setPopupSuccess(res.ok);
    });
  }

  function _handleDelete() {
    setClickedDelete(true);
    fetchWithToken(`/events/${currentlyActive}`, "DELETE").then((_res) => {
      // Update the data once request is processed
      refresh();
      setClickedDelete(false);
    });
  }

  function _handlePhotoUpdate(file) {
    if (!file) return;
    const storageRef = ref(storage, `/photos/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setImagePath(file.name.split(".")[0]);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round(
          (100 * snapshot.bytesTransferred) / snapshot.totalBytes
        );
        setImageURL(`Postęp: ${prog}%`);
      },
      (error) => console.log(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(() => {
          /*
        console.log(url);
        let basefileName = getFileNameFromFirebaseUrl(url);
        console.log(basefileName);
      
        let fullHDfileName = basefileName.split(".")[0] + "_1920x1080.jpeg";
        console.log(fullHDfileName);
        setImagePath(fullHDfileName);
        */
        });
      }
    );
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
        buttonTwoCallback={() => _handleDelete()}
        isVisible={popupDelete}
        setVisible={setPopupDelete}
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
        maxLength={60}
        value={name}
        onChange={setName}
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
          placeholder="Godzina zakończenia"
          value={endTime}
          onChange={setEndTime}
        />
      </div>
      <InputBox
        name="location"
        placeholder="Miejsce wydarzenia"
        maxLength={60}
        value={location}
        onChange={setLocation}
      />
      {/* PLACE FOR TEXT EDITOR */}
      <InputFile
        placeholder={"Miniatura"}
        onChange={(e) => {
          _handlePhotoUpdate(e.target.files[0]);
        }}
        acceptedExtensions=".jpeg, .jpg, .png"
      />
      <InputBox
        name="image-url"
        placeholder="URL zdjęcia"
        maxLength={256}
        value={imageURL}
        onChange={setImageURL}
      />
      <InputBox
        name="event-url"
        placeholder="Zewnętrzny link do wydarzenia"
        maxLength={256}
        value={eventURL}
        onChange={setEventURL}
      />
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
