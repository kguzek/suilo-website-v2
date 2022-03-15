import React, { useEffect, useState } from "react";
import { Plus, Trash, Edit3 } from "react-feather";
import InputBox from "./InputComponents/InputBox";
// import InputArea from "./InputComponents/InputArea";
import InputDropdown from "./InputComponents/InputDropdown";
import TextEditor from "./InputComponents/TextEditor";
import DialogBox from "../DialogBox";
import { auth, fetchWithToken } from "../../firebase";
import LoadingScreen, { LoadingButton } from "../LoadingScreen";
import { handlePhotoUpdate, setErrorMessage } from "../../misc";
import InputPhoto from "./InputComponents/InputPhoto";

export const PostEdit = ({ data, loaded, refetchData, photos }) => {
  const [currentlyActive, setCurrentlyActive] = useState("_default");
  const [author, setAuthor] = useState(auth.currentUser?.displayName);
  const [title, setTitle] = useState("");
  const [formattedContent, setFormattedContent] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [imageAuthor, setImageAuthor] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [ytID, setYtID] = useState("");
  const [link, setLink] = useState("");

  const [addYtID, setAddYtID] = useState(false);
  const [addLink, setAddLink] = useState(false);

  const [clickedSubmit, setClickedSubmit] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);

  const [popupSuccess, setPopupSuccess] = useState(false);
  const [popupDelete, setPopupDelete] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const [errorCode, setErrorCode] = useState(null);

  useEffect(() => {
    // Reset the YouTube video ID if the user unselects the "add YouTube ID" option
    addYtID || setYtID("");
  }, [addYtID]);

  useEffect(() => {
    // Reset the external URL if the user unselects the "add external URL" option
    addLink || setLink("");
  }, [addLink]);

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
    setAuthor(post.author);
    setTitle(post.title);
    setRawContent(post.rawContent);
    setFormattedContent(post.formattedContent);
    // these properties are all nullable
    setImageURL(post.photo ?? "");
    setImageAuthor(post.photoAuthor ?? "");
    setImageAltText(post.alt ?? "");

    setYtID(post.ytID ?? "");
    setLink(post.link ?? "");
    setAddYtID(!!post.ytID);
    setAddLink(!!post.link);
  }, [currentlyActive]);

  // Display loading screen if news data hasn't been retrieved yet
  if (!loaded) {
    return <LoadingScreen />;
  }

  const posts = {};
  for (const post of data ?? []) {
    posts[post.id] = post.title;
  }

  // Bitwise AND to ensure both functions are called
  const refresh = () => refetchData() & _resetAllInputs();

  function _resetAllInputs() {
    for (const setVar of [
      setTitle,
      setFormattedContent,
      setRawContent,
      setImageURL,
      setImageAuthor,
      setImageAltText,
      setYtID,
      setLink,
    ]) {
      setVar("");
    }
    setCurrentlyActive("_default");

    setAuthor(auth.currentUser?.displayName);
  }

  function _handleSubmit(e) {
    e.preventDefault();
    setClickedSubmit(true);
    let url = "/news/";
    let method = "POST";
    // Check if an existing post is selected
    if (currentlyActive !== "_default") {
      method = "PUT";
      url += currentlyActive;
    }
    // ?date=null&author=autor&title=Tytuł Postu&text=Krótka treść postu...&content=Wydłużona treść postu.&photo=null&photoAuthor=null&alt=null&ytID=null
    const params = {
      date: new Date().toISOString(),
      author,
      title,
      rawContent,
      formattedContent,
      photo: imageURL,
      ytID,
      link,
      // these two should be stored with the photo imo
      photoAuthor: imageAuthor,
      alt: imageAltText,
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
      if (res.ok) {
        refresh();
        setPopupSuccess(true);
      } else {
        setErrorCode(res.status);
        setErrorMessage(res, setPopupError);
      }
      setClickedSubmit(false);
    });
  }
  const setPostContent = ({ html, text }) => {
    setFormattedContent(html);
    setRawContent(text);
    console.log(text);
    console.log(html);
  };

  function _handleDelete() {
    setClickedDelete(true);
    fetchWithToken(`/news/${currentlyActive}`, "DELETE").then((_res) => {
      // Update the data once request is processed
      refresh();
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
        label="Post do edycji"
        currentValue={currentlyActive}
        onChangeCallback={setCurrentlyActive}
        defaultLabel="Nowy post"
        valueDisplayObject={posts}
      />
      <InputBox
        name="post-title"
        placeholder="Tytuł"
        maxLength={81}
        value={title}
        onChange={setTitle}
      />
      <TextEditor
        onChange={setPostContent}
        value={{ html: formattedContent, text: rawContent }}
      />
      <InputBox
        name="post-author"
        placeholder="Autor"
        maxLength={64}
        value={author}
        disabled={true}
      />
      <InputPhoto
        imageURL={imageURL}
        setImageURL={setImageURL}
        photos={photos}
        handlePhotoUpdate={handlePhotoUpdate}
        imageAuthor={imageAuthor}
        setImageAuthor={setImageAuthor}
        imageAltText={imageAltText}
        setImageAltText={setImageAltText}
      />
      <div>
        <label className="select-none">
          <input
            type="checkbox"
            onClick={() => (addYtID ? setAddYtID(false) : setAddYtID(true))}
          />
          &nbsp;Dodaj film z serwisu YouTube
        </label>
      </div>

      {addYtID && (
        <InputBox
          name="yt-url"
          placeholder="ID filmu na serwisie YouTube"
          maxLength={11}
          value={ytID}
          onChange={setYtID}
        />
      )}
      <div>
        <label className="select-none">
          <input
            type="checkbox"
            onClick={() => (addLink ? setAddLink(false) : setAddLink(true))}
          />
          &nbsp;Dodaj link do zewnętrznego serwisu
        </label>
      </div>

      {addLink && (
        <InputBox
          name="third-party-url"
          placeholder="Zewnętrzne łącze URL"
          maxLength={126}
          value={link}
          onChange={setLink}
        />
      )}

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
          <LoadingButton isOpaque={true} />
        ) : (
          <button type="submit" className="add-btn">
            {currentlyActive !== "_default" ? (
              <Edit3 color="#FFFFFF" size={24} />
            ) : (
              <Plus color="#FFFFFF" size={24} />
            )}
            <p>
              {currentlyActive !== "_default" ? "edytuj post" : "dodaj post"}
            </p>
          </button>
        )}
      </div>
    </form>
  );
};
