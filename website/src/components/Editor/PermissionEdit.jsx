import React, { useEffect, useState } from "react";
import { Plus, Trash, Edit3 } from "react-feather";
import InputBox from "./InputComponents/InputBox";
import InputDropdown from "./InputComponents/InputDropdown";
import DialogBox from "../DialogBox";
import LoadingScreen, { LoadingButton } from "../LoadingScreen";
import { NO_SELECT_STYLE } from "./InputComponents/InputPhoto";

export const PermissionEdit = ({ data, loaded, refetchData }) => {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [user, setUser] = useState("");
  const [canEdit, setCanEdit] = useState(new Set());
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
    // Get the currently selected post
    const post = (data ?? [])
      .filter((post) => post.id === currentlyActive)
      .shift();
    if (!post) {
      // No currently selected post
      return void _resetAllInputs();
    }
    setCanEdit(new Set());
  }, [currentlyActive]);

  // Display loading screen if news data hasn't been retrieved yet
  if (!loaded && 0) {
    return <LoadingScreen />;
  }

  // Bitwise AND to ensure both functions are called
  const refresh = () => refetchData() & _resetAllInputs();

  function _resetAllInputs() {
    setCurrentlyActive("_default");
  }
  const _handleSubmit = (e) => {
    e.preventDefault();
    setClickedSubmit(true);
    setPopupSuccess(true);
  };

  const _handleDelete = () => {
    setPopupDelete(true);
  };
  
  function onChange(e) {
    const permission = e.target.name;
    if (e.target.checked) {
      setCanEdit(new Set([...canEdit, permission]));
    } else {
      const _temp = new Set(canEdit);
      _temp.delete(permission);
      setCanEdit(_temp);
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
        buttonTwoCallback={() => setClickedDelete(true)}
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
        label="Użytkownik do edycji"
        currentValue={currentlyActive}
        onChangeCallback={setCurrentlyActive}
        defaultLabel="Nowy użytkownik"
        valueDisplayObject={{}}
      />
      <InputBox
        name="email"
        placeholder="Adres mailowy użytkownika"
        value={user}
        onChange={setUser}
        maxLength={128}
      />
      <div>
        <label style={NO_SELECT_STYLE}>
          <input
            type="checkbox"
            name="news"
            className="mr-2"
            value={canEdit.has("news")}
            onChange={onChange}
          />
          Edycja aktualności
        </label>
      </div>
      <div>
        <label style={NO_SELECT_STYLE}>
          <input
            type="checkbox"
            id="E1"
            name="events"
            className="mr-2"
            value={canEdit.has("events")}
            onChange={onChange}
          />
          Edycja wydarzeń
        </label>
      </div>
      <div>
        <label style={NO_SELECT_STYLE}>
          <input
            type="checkbox"
            id="C1"
            name="calendar"
            className="mr-2"
            value={canEdit.has("calendar")}
            onChange={onChange}
          />
          Edycja kalendarza
        </label>
      </div>
      <div>
        <label style={NO_SELECT_STYLE}>
          <input
            type="checkbox"
            id="L1"
            name="links"
            className="mr-2"
            value={canEdit.has("links")}
            onChange={onChange}
          />
          Skracanie linków
        </label>
      </div>
      <div>
        <label style={NO_SELECT_STYLE}>
          <input
            type="checkbox"
            id="P1"
            name="permissions"
            className="mr-2"
            value={canEdit.has("permissions")}
            onChange={onChange}
          />
          Strona uprawnień
        </label>
      </div>
      <div className="fr" style={{ width: "100%", justifyContent: "right" }}>
        {currentlyActive !== "_default" &&
          (clickedDelete ? (
            <LoadingButton />
          ) : (
            <button
              type="button"
              className="delete-btn"
              onClick={_handleDelete}
            >
              <Trash color="rgb(252, 63, 30)" size={20} />
              <p>usuń link</p>
            </button>
          ))}
        {clickedSubmit ? (
          <LoadingButton isOpaque={true} />
        ) : (
          <button type="submit" className="add-btn">
            {currentlyActive !== "_default" ? (
              <Edit3 color="#FFFFFF" size={24} />
            ) : (
              <Plus color="#FFFFFF" size={24} />
            )}
            <p>
              {currentlyActive !== "_default"
                ? "zaktualizuj użytkownika"
                : "dodaj użytkownika"}
            </p>
          </button>
        )}
      </div>
    </form>
  );
};
