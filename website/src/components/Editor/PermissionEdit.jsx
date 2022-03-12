import React, { useState } from "react";
import { Plus, Trash, Edit3 } from "react-feather";
import InputBox from "./InputComponents/InputBox";
import InputDropdown from "./InputComponents/InputDropdown";
import DialogBox from "../DialogBox";
import { LoadingButton } from "../LoadingScreen";

export const PermissionEdit = ({}) => {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [user, setUser] = useState("");
  const [userPermissions, setUserPermissions] = useState({
    news: false,
    events: false,
    calendar: false,
    linkShortener: false,
    permissions: false,
    isAdmin: false,
  });
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  const [popupSuccess, setPopupSuccess] = useState(false);
  const [popupDelete, setPopupDelete] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const [errorCode, setErrorCode] = useState(null);

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
        placeholder="Mail użytkownika"
        value={user}
        onChange={setUser}
      />
      <div>
        <input
          type="checkbox"
          id="A1"
          name="news"
          value={userPermissions.news}
          onChange={(e) =>
            setUserPermissions({ ...userPermissions, news: e.target.value })
          }
        />
        <label htmlFor="A1">Edycja aktualności</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="E1"
          name="events"
          value={userPermissions.events}
          onChange={(e) =>
            setUserPermissions({ ...userPermissions, events: e.target.value })
          }
        />
        <label htmlFor="E1">Edycja wydarzeń</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="C1"
          name="calendar"
          value={userPermissions.calendar}
          onChange={(e) =>
            setUserPermissions({ ...userPermissions, calendar: e.target.value })
          }
        />
        <label htmlFor="C1">Edycja kalendarza</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="L1"
          name="link-shortener"
          value={userPermissions.linkShortener}
          onChange={(e) =>
            setUserPermissions({
              ...userPermissions,
              linkShortener: e.target.value,
            })
          }
        />
        <label htmlFor="L1">Skracanie linków</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="P1"
          name="permissions"
          value={userPermissions.permissions}
          onChange={(e) =>
            setUserPermissions({
              ...userPermissions,
              permissions: e.target.value,
            })
          }
        />
        <label htmlFor="P1">Strona uprawnień</label>
      </div>
      {/* <InputBox
              maxLength={32}
              name="short-link"
              placeholder="Skrócony kod linku"
              value={shortLink}
              onChange={setShortLink}
            /> */}

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
          <LoadingButton isOpaque={true} />
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
