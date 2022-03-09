import React, { useState } from "react";
import { Plus, Trash, Edit3 } from "react-feather";
import InputBox from "../components/InputBox";
import InputDropdown from "../components/InputDropdown";
import DialogBox from "../components/DialogBox";
import { LoadingButton } from "../pages/Edit";

export const LinkEdit = ({ linksData }) => {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [longLink, setLongLink] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  const [popupSuccess, setPopupSuccess] = useState(false);
  const [popupDelete, setPopupDelete] = useState(false);

  const _handleSubmit = (e) => {
    e.preventDefault();
    setClickedSubmit(true);
    setPopupSuccess(true);
  };

  const _handleDelete = () => {
    setPopupDelete(true);

  };

  return (
    <form className="w-full mt-6" onSubmit={_handleSubmit}>
      <DialogBox
        header="Sukces!"
        content="Pomyślnie dokonano wszelkich zmian"
        duration={2000}
        isVisible={popupSuccess}
        setVisible={setPopupSuccess} />
      <DialogBox
        header="Uwaga!"
        content="Czy na pewno chcesz usunąć zawartość? Ta akcja jest nieodwracalna."
        type="DIALOG"
        buttonOneLabel="Kontynuuj edycje"
        buttonTwoLabel="Usuń"
        buttonTwoCallback={setClickedDelete(true)}
        isVisible={popupDelete}
        setVisible={setPopupDelete} />
      <InputDropdown
        label="Link do edycji"
        currentValue={currentlyActive}
        onChangeCallback={setCurrentlyActive}
        defaultLabel="Nowy link"
        valueDisplayObject={linksData} />
      <InputBox
        maxLength={126}
        name="long-link"
        placeholder="Link do skrócenia"
        value={longLink}
        onChange={setLongLink} />
      <InputBox
        maxLength={32}
        name="short-link"
        placeholder="Skrócony kod linku"
        value={shortLink}
        onChange={setShortLink} />

      <div className="fr" style={{ width: "100%", justifyContent: "right" }}>
        {currentlyActive !== "_default" &&
          (clickedDelete ? (
            <LoadingButton />
          ) : (
            <button
              type="button"
              className="delete-btn"
              onClick={() => _handleDelete()}
            >
              <Trash color="rgb(252, 63, 30)" size={20} />
              <p>usuń link</p>
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
              {currentlyActive !== "_default" ? "edytuj link" : "dodaj link"}
            </p>
          </button>
        )}
      </div>
    </form>
  );
};
