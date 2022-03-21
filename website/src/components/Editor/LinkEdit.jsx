import React, { useEffect, useState } from "react";
import { Plus, Trash, Edit3, Copy } from "react-feather";
import InputBox from "./InputComponents/InputBox";
import InputDropdown from "./InputComponents/InputDropdown";
import DialogBox from "../DialogBox";
import LoadingScreen from "../LoadingScreen";
import { fetchWithToken } from "../../firebase";
import { isURL, setErrorMessage, copyToClipboard } from "../../misc";

export const LinkEdit = ({ data, loaded, refetchData }) => {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [longLink, setLongLink] = useState("");

  const [actualLink, setActualLink] = useState("");
  const [visits, setVisits] = useState(0);

  const [shortLink, setShortLink] = useState("");
  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  const [popupSuccess, setPopupSuccess] = useState(false);
  const [popupCopy, setPopupCopy] = useState(false);
  const [popupDelete, setPopupDelete] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const [errorCode, setErrorCode] = useState(null);

  /** Gets the reference of the currently selected short link. */
  function _getCurrentlyActive() {
    return data?.contents?.[parseInt(currentlyActive)];
  }

  useEffect(() => {
    if (!loaded) {
      return;
    }
    const currentLink = _getCurrentlyActive();
    if (!currentLink) {
      // No currently selected link
      return void _resetAllInputs();
    }
    setLongLink(currentLink.destination);
    setShortLink(currentLink.shortLink);
    setVisits(currentLink.views ?? 0);
  }, [currentlyActive]);

  useEffect(() => {
    if (isURL(shortLink)) {
      setActualLink(shortLink);
    } else {
      // Ensure the path starts with "/"
      const path = shortLink.startsWith("/") ? shortLink : "/" + shortLink;
      // Use the current HTTP/HTTPS protocol
      setActualLink(`${window.location.origin}${path}`);
    }
  }, [shortLink]);

  // Display loading screen if events data hasn't been retrieved yet
  if (!loaded) {
    return <LoadingScreen />;
  }

  // Bitwise AND to ensure both functions are called
  const refresh = () => refetchData() & _resetAllInputs();

  function _resetAllInputs() {
    for (const setVar of [setLongLink, setShortLink]) {
      setVar("");
    }
    setVisits(0);
    setCurrentlyActive("_default");
  }

  const _handleSubmit = (e) => {
    e.preventDefault();
    setClickedSubmit(true);
    let url = "/links/";
    let method = "POST";
    // Check if an existing event is selected
    if (currentlyActive !== "_default") {
      method = "PUT";
      url += _getCurrentlyActive().id;
    }
    // ?destination=null&shortLink=null
    const params = { destination: longLink, shortLink };
    fetchWithToken(url, method, params).then((res) => {
      // Update the data once request is processed
      if (res.ok) {
        refresh();
        setPopupSuccess(true);
      } else {
        setErrorCode(res.status);
        setErrorMessage(res, setPopupError);
      }
      setClickedSubmit(false);
    });
  };

  const _handleDelete = () => {
    setClickedDelete(true);
    const deleteURL = "/links/" + _getCurrentlyActive().id;
    fetchWithToken(deleteURL, "DELETE").then((_res) => {
      // Update the data once request is processed
      refresh();
      setClickedDelete(false);
    });
  };

  // Get array of short link URLs
  const links = (data.contents ?? []).map(
    (link) => `${link.shortLink} > ${link.destination}`
  );
  return (
    <form className="w-full mt-6" onSubmit={_handleSubmit}>
      <DialogBox
        header="Sukces!"
        content="Stworzono skrócone łącze URl."
        duration={2000}
        isVisible={popupSuccess}
        setVisible={setPopupSuccess}
      />
      <DialogBox
        header="Sukces!"
        content={`Łącze: ${actualLink} zostało pomyślnie skopiowane do twojego schowka`}
        duration={2500}
        isVisible={popupCopy}
        setVisible={setPopupCopy}
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
        label="Link do edycji"
        currentValue={currentlyActive.shortLink ?? currentlyActive}
        onChangeCallback={setCurrentlyActive}
        defaultLabel="Nowy link"
        valueDisplayObject={links}
      />
      <InputBox
        maxLength={128}
        name="long-link"
        placeholder="Link do skrócenia"
        value={longLink}
        onChange={setLongLink}
      />
      <InputBox
        maxLength={32}
        name="short-link"
        placeholder="Skrócony kod linku (domyślnie: losowo wygenerowany URL)"
        value={shortLink}
        onChange={setShortLink}
        required={false}
      />
      <div className="w-full">
        {actualLink !== "" && (
          <div className="my-1 font-medium text-lg text-text1 inline-flex">
            <span>Link:&nbsp;</span>
            <a
              href={actualLink}
              target="_blank"
              className="text-text1 font-normal tracking-tight hover:text-primary transition-all duration-150"
            >
              {actualLink}
            </a>
            <Copy
              size={24}
              className="stroke-gray-400 mt-[.15rem] ml-2 cursor-pointer transition-all duration-150 hover:stroke-primary"
              onClick={() => copyToClipboard(actualLink, setPopupCopy)}
            />
          </div>
        )}
        {visits !== 0 && <p className="text-text6">Kliknięcia w link: {visits}</p>}
      </div>
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
              <p>usuń link</p>
            </button>
          ) : (
            <button
              type="button"
              className="delete-btn select-none cursor-pointer"
              style={{ pointerEvents: "all" }}
              onClick={() => setPopupDelete(true)}
            >
              <Trash color="rgb(252, 63, 30)" size={20} />
              <p>usuń link</p>
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
                ? "zaktualizuj skrócony link"
                : "dodaj skrócony link"}
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
                ? "zaktualizuj skrócony link"
                : "dodaj skrócony link"}
            </p>
          </button>
        )}
      </div>
    </form>
  );
};
