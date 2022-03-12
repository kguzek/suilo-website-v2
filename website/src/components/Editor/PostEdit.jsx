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
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [imageAuthor, setImageAuthor] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [ytID, setYtID] = useState("");
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
    setAuthor(post.author);
    setTitle(post.title);
    setDescription(post.content);
    // photo properties are all nullable
    setImageURL(post.photo ?? "");
    setImageAuthor(post.photoAuthor ?? "");
    setImageAltText(post.alt ?? "");
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
      setDescription,
      setImageURL,
      setImageAuthor,
      setImageAltText,
      setYtID,
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
    const shortDescription = description.substring(0, 180);
    // ?date=null&author=autor&title=Tytuł Postu&text=Krótka treść postu...&content=Wydłużona treść postu.&photo=null&photoAuthor=null&alt=null&ytID=null
    const params = {
      date: new Date().toISOString(),
      author,
      title,
      text: shortDescription,
      content: description,
      photo: imageURL,
      //those two should be stored with the photo imo
      photoAuthor: imageAuthor,
      alt: imageAltText,
      ytID,
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
        maxLength={64}
        value={title}
        onChange={setTitle}
      />
      {/* PLACE FOR TEXT EDITOR */}
      {/* <InputArea
        name="post-description"
        placeholder="Treść"
        maxLength={256}
        value={description}
        onChange={setDescription} /> */}
      <TextEditor onChange={setDescription} value={description} />
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
      />
      <InputBox
        name="image-author"
        placeholder="Autor zdjęcia"
        maxLength={64}
        value={imageAuthor}
        onChange={setImageAuthor}
        required={imageURL !== "" ? true : false}
      />
      <InputBox
        name="image-alt-text"
        placeholder="Tekst alternatywny do zdjęcia"
        maxLength={64}
        value={imageAltText}
        onChange={setImageAltText}
        required={imageURL !== "" ? true : false}
      />
      <InputBox
        name="yt-url"
        placeholder="ID filmu na serwisie YouTube"
        maxLength={11}
        value={ytID}
        required={false}
        onChange={setYtID}
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
