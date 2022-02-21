import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MetaTags from "react-meta-tags";
import InputBox from "../components/InputBox";
import InputDropdown from "../components/InputDropdown";

const Edit = ({ setPage, canEdit, loginAction }) => {
  let navigate = useNavigate();
  const [testValue, setTestValue] = useState("");
  const [testValueDate, setTestValueDate] = useState(" ");
  const [testValueNumber, setTestValueNumber] = useState("");
  const [testValueHour, setTestValueHour] = useState(" ");
  const [testValuePicker, setTestValuePicker] = useState("");

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
    <div style={{ minHeight: "89vh" }}>
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
      <p>Edit</p>
      <InputBox name="" placeholder="Tytuł" value={testValue} onChange={setTestValue} />
      <InputBox name="" placeholder="Data" type="date" value={testValueDate} onChange={setTestValueDate} />
      <InputBox name="" placeholder="Numer" type="number" value={testValueNumber} onChange={setTestValueNumber} />
      <InputBox name="" placeholder="Godzina" type="time" value={testValueHour} onChange={setTestValueHour} />
      <InputDropdown
        label="Post"
        currentValue={testValuePicker}
        onChangeCallback={setTestValuePicker}
        defaultLabel={"Nowy post"}
      // valueDisplayArray={[{ value: "1", display: "1" }, { value: "2", display: "2" }, { value: "3", display: "3" }]}
      />
    </div>
  );
};

export default Edit;
