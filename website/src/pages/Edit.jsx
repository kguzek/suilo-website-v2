import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MetaTags from "react-meta-tags";
import InputBox from "../components/InputBox";
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
    <div className="edit-segment">
      <InputDropdown label={"Post do edycji"} currentValue={currentlyActive} onChangeCallback={setCurrentlyActive} defaultLabel={"Nowy post"} valueDisplayArray={test} />
      <InputBox name="post-title" placeholder="Tytuł" maxLength={64} value={title} onChange={setTitle} />
      {/* PLACE FOR TEXT EDITOR */}
      <InputFile placeholder="Miniatura" acceptedExtensions={".jpeg, .jpg, .png,"} />
    </div>
  );
}

const EventEdit = () => {
  const [currentlyActive, setCurrentlyActive] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState({ start: "", end: "" })
  const [place, setPlace] = useState("")

  return (
    <div className="edit-segment">
      <InputDropdown label={"Wydarzenie do edycji"} currentValue={currentlyActive} onChangeCallback={setCurrentlyActive} defaultLabel={"Nowe wydarzenie"} valueDisplayArray={test} />
      <InputBox name="event-name" placeholder="Nazwa" maxLength={64} value={name} onChange={setName} />
      <InputBox name="event-description" placeholder="Opis" maxLength={256} value={description} onChange={setDescription} />

      {/* PLACE FOR TEXT EDITOR */}
      <InputFile placeholder="Miniatura" acceptedExtensions={".jpeg, .jpg, .png,"} />
    </div>
  );
}

const CalendarEdit = () => {
  const [name, setName] = useState("")
  const [date, setDate] = useState({ start: "", end: "" })
  const [type, setType] = useState("")

  return (
    <div className="edit-segment">

      <InputDropdown label={"Typ wydarzenia"} currentValue={type} onChangeCallback={setType} defaultLabel={"Inne"} valueDisplayArray={test} />
    </div>
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
    <div style={{ minHeight: "89vh" }} className="page-main">
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
      <InputDropdown label={"Element strony do edycji"} currentValue={editPicker} onChangeCallback={setEditPicker} defaultLabel={""} valueDisplayArray={editPickerList} />
      {editPicker === editPickerList[0].value && <PostEdit />}
      {editPicker === editPickerList[1].value && <EventEdit />}
      {editPicker === editPickerList[2].value && <CalendarEdit />}
    </div>
  );
};

export default Edit;
