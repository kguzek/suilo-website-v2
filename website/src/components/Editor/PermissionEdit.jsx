import React, { useEffect, useState } from "react";
import { Plus, Trash, Edit3 } from "react-feather";
import InputBox from "./InputComponents/InputBox";
import InputDropdown from "./InputComponents/InputDropdown";
import DialogBox from "../DialogBox";
import LoadingScreen from "../LoadingScreen";
import { fetchWithToken } from "../../firebase";
import { setErrorMessage } from "../../misc";

const PERMISSION_NAMES = [
  "Edycja aktualności",
  "Edycja wydarzeń",
  "Edycja kalendarza",
  "Skracanie linków",
  "Edycja uprawnień użytkowników",
];

export const PermissionEdit = ({
  data,
  loaded,
  refetchData,
  userPerms,
  allPerms,
}) => {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
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
    // Get the currently selected user
    const user = (data.contents ?? [])
      .filter((user) => user.id === currentlyActive)
      .shift();
    if (!user) {
      // No currently selected user
      return void _resetAllInputs();
    }
    setEmail(user.email);
    setIsAdmin(user.isAdmin);
    setCanEdit(new Set(user.canEdit));
  }, [currentlyActive]);

  // Display loading screen if news data hasn't been retrieved yet
  if (!loaded && 0) {
    return <LoadingScreen />;
  }

  const users = {};
  for (const user of data.contents ?? []) {
    // Only show users that have edit permissions
    if (user.isAdmin || user.canEdit?.length > 0) {
      users[user.id] = user.displayName;
    }
  }

  // Bitwise AND to ensure both functions are called
  const refresh = () => refetchData() & _resetAllInputs();

  function _resetAllInputs() {
    setEmail("");
    setIsAdmin(false);
    setCanEdit(new Set());
    setCurrentlyActive("_default");
  }

  const _handleSubmit = (e) => {
    e.preventDefault();
    const user = data.contents?.filter((user) => user.email === email).shift();
    if (!user) {
      return void setPopupError(
        "Nie można zarządzać użytkownikiem, który nie logował się nigdy na tej stronie."
      );
    }
    setClickedSubmit(true);
    const url = "/users/" + user.id;
    fetchWithToken(url, "PUT", {}, { email, canEdit: [...canEdit] }).then(
      (res) => {
        // Update the data once request is processed
        if (res.ok) {
          refresh();
          setPopupSuccess(true);
        } else {
          setErrorCode(res.status);
          setErrorMessage(res, setPopupError);
        }
        setClickedSubmit(false);
      }
    );
  };

  function _handleDelete() {
    setClickedDelete(true);
    fetchWithToken(`/users/${currentlyActive}`, "DELETE").then((_res) => {
      // Update the data once request is processed
      refresh();
      setClickedDelete(false);
    });
  }

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

  function PermissionCheckbox({ perm, children }) {
    const admin = perm === "isAdmin";
    // Disable editing permissions the user does not possess themself
    const disabled = !userPerms.canEdit.includes(perm) && !userPerms.isAdmin;
    // Grey out text when checkbox is disabled
    const labelStyle = admin || disabled ? { color: "dimgrey" } : {};
    return (
      <div>
        <label className="select-none">
          <input
            type="checkbox"
            name={perm}
            className="mr-2"
            checked={admin ? isAdmin : canEdit.has(perm)}
            onChange={admin ? setIsAdmin : onChange}
            disabled={admin || disabled}
          />
          <span style={labelStyle}>{children}</span>
        </label>
      </div>
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
        buttonTwoCallback={_handleDelete}
        isVisible={popupDelete}
        setVisible={setPopupDelete}
      />
      <DialogBox
        header={errorCode ? `Bład! (HTTP ${errorCode})` : "Błąd!"}
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
        valueDisplayObject={users}
      />
      <InputBox
        name="email"
        placeholder="Adres mailowy użytkownika"
        value={email}
        onChange={setEmail}
        maxLength={128}
        choices={data.contents?.map((user) => user.email) ?? []}
        disabled={currentlyActive !== "_default"}
      />
      <PermissionCheckbox perm="isAdmin">Administrator</PermissionCheckbox>
      {allPerms.map((perm, idx) => (
        <PermissionCheckbox key={idx} perm={perm}>
          {PERMISSION_NAMES[idx]}
        </PermissionCheckbox>
      ))}
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
              <p>usuń użytkownika</p>
            </button>
          ) : (
            <button
              type="button"
              className="delete-btn select-none cursor-pointer"
              style={{ pointerEvents: "all" }}
              onClick={() => setPopupDelete(true)}
            >
              <Trash color="rgb(252, 63, 30)" size={20} />
              <p>usuń użytkownika</p>
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
                ? "zaktualizuj użytkownika"
                : "dodaj użytkownika"}
            </p>
          </button>
        ) : (
          <button
            type="submit"
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
                ? "zaktualizuj użytkownika"
                : "dodaj użytkownika"}
            </p>
          </button>
        )}
      </div>
    </form>
  );
};
