import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MetaTags from "react-meta-tags";
import InputBox from "../components/InputBox";
import InputArea from "../components/InputArea";
import InputDropdown from "../components/InputDropdown";
import InputFile from "../components/InputFile";

const test = [
  { value: "1", display: "1" },
  { value: "2", display: "2" },
  { value: "3", display: "3" }
]
const editPickerList = [
  { value: "Aktualności", display: "Aktualności" },
  { value: "Wydarzenia", display: "Wydarzenia" },
  { value: "Kalendarz", display: "Kalendarz" }
]

const PostEdit = () => {
  const [currentlyActive, setCurrentlyActive] = useState("")
  const [title, setTitle] = useState("")
  const [postContent, setPostContent] = useState("")

  return (
    <form className="edit-segment">
      <InputDropdown label={"Post do edycji"} currentValue={currentlyActive} onChangeCallback={setCurrentlyActive} defaultLabel={"Nowy post"} valueDisplayArray={test} />
      <InputBox name="post-title" placeholder="Tytuł" maxLength={60} value={title} onChange={setTitle} />
      {/* PLACE FOR TEXT EDITOR */}
      <InputFile placeholder="Miniatura" acceptedExtensions={".jpeg, .jpg, .png,"} />
    </form>
  );
}

const EventEdit = () => {
  const [currentlyActive, setCurrentlyActive] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [timeStart, setTimeStart] = useState("")
  const [timeEnd, setTimeEnd] = useState("")
  const [place, setPlace] = useState("")

  return (
    <form className="edit-segment">
      <InputDropdown label={"Wydarzenie do edycji"} currentValue={currentlyActive} onChangeCallback={setCurrentlyActive} defaultLabel={"Nowe wydarzenie"} valueDisplayArray={test} />
      <InputBox name="event-name" placeholder="Nazwa" maxLength={60} value={name} onChange={setName} />
      <InputArea name="event-description" placeholder="Opis" maxLength={256} value={description} onChange={setDescription} />
      <InputBox name="event-date" type="date" pattern="dd/mm/yyyy" placeholder="Data wydarzenia" value={date} onChange={setDate} />
      <div className="fr" style={{ width: "100%", margin: "-1em 0", justifyContent: "space-between" }}>
        <InputBox width="47%" name="event-time-start" type="time" pattern="HH:mm" placeholder="Godzina rozpoczęcia" value={timeStart} onChange={setTimeStart} />
        <p className="from-to-indicator">-</p>
        <InputBox width="47%" name="event-time-end" type="time" pattern="HH:mm" placeholder="Godzina zakończenia" value={timeEnd} onChange={setTimeEnd} />
      </div>
      <InputBox name="location" placeholder="Miejsce wydarzenia" maxLength={30} value={place} onChange={setPlace} />
      {/* PLACE FOR TEXT EDITOR */}
      <InputFile placeholder="Miniatura" acceptedExtensions={".jpeg, .jpg, .png,"} />
    </form>
  );
}

const CalendarEdit = () => {
  const [name, setName] = useState("")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const [type, setType] = useState("")

  return (
    <form className="edit-segment">
      <InputDropdown label={"Typ wydarzenia"} currentValue={type} onChangeCallback={setType} defaultLabel={"Inne"} valueDisplayArray={test} />
      <InputBox maxLength={60} name="event-name" placeholder="Nazwa wydarzenia" value={name} onChange={setName} />
      <div className="fr" style={{ width: "100%", margin: "-1em 0", justifyContent: "space-between" }}>
        <InputBox width="47%" name="event-time-start" type="date" pattern="dd/mm/yyyy" placeholder="Rozpoczęcie" value={dateStart} onChange={setDateStart} />
        <p className="from-to-indicator">-</p>
        <InputBox width="47%" name="event-time-end" type="date" pattern="dd/mm/yyyy" placeholder="Zakończenie" value={dateEnd} onChange={setDateEnd} />
      </div>
    </form>
  );
}

const Edit = ({ setPage, canEdit, loginAction }) => {
  let navigate = useNavigate();
  const [editPicker, setEditPicker] = useState("Aktualności");


  useEffect(() => {
    if (canEdit) {
      setPage("edit");
    } else {
      navigate("/");
      setPage("home");
      loginAction();
    }
  }, [canEdit]);

  return (
    <div style={{ paddingTop: "2.5em", justifyContent: "left" }} className="page-main">
      <MetaTags>
        <title>
          Edycja treści | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w
          Gliwicach
        </title>
        <meta
          name="description"
          content="Edycja zawartości strony Samorządu Uczniowskiego 1 Liceum Ogólnokształącego w Gliwicach."
        />
        <meta property="og:title" content="Edycja | SUILO Gliwice" />
        <meta property="og:image" content="" /> {/* TODO: Add image */}
      </MetaTags>
      <div style={{ width: "50%" }}>
        <InputDropdown label={"Element strony do edycji"} currentValue={editPicker} onChangeCallback={setEditPicker} defaultLabel={""} valueDisplayArray={editPickerList} />
      </div>
      {editPicker === editPickerList[0].value && <PostEdit />}
      {editPicker === editPickerList[1].value && <EventEdit />}
      {editPicker === editPickerList[2].value && <CalendarEdit />}
    </div>
  );
};

export default Edit;
