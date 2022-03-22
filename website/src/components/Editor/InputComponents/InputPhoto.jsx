import React, { useEffect, useState } from "react";
import {
  DEFAULT_IMAGE,
  getDataFromFilename,
  handlePhotoUpdate,
} from "../../../misc";
import InputBox from "./InputBox";
import InputFile from "./InputFile";

const OPTIONS = [
  "Prześlij nowe zdjęcie",
  "Wpisz URL zdjęcia",
  "Użyj istniejącego zdjęcia",
  "Brak zdjęcia",
];

export default function InputPhoto({
  oldImageURL,
  newImageURL,
  setNewImageURL,
  photos,
  imageAuthor,
  setImageAuthor,
  imageAltText,
  setImageAltText,
  currentlyActive,
  refetchPhotos,
}) {
  const [selectedOption, setSelectedOption] = useState(
    photos.includes(newImageURL) ? 2 : 0
  );
  const [existingPhoto, setExistingPhoto] = useState(undefined);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  useEffect(() => {
    // Set the default option whenever the post is changed
    if (photos.includes(oldImageURL)) {
      // "Use existing photo"
      setSelectedOption(2);
      return;
    }
    if (oldImageURL) {
      // "Enter image URL"
      setSelectedOption(1);
    } else {
      if (currentlyActive === "_default") {
        // "Upload new photo"
        newImageURL || setSelectedOption(0);
      } else {
        // "No image"
        setSelectedOption(3);
        setExistingPhoto(undefined);
        setPreview(null);
      }
    }
  }, [oldImageURL]);

  useEffect(() => {
    if (existingPhoto === newImageURL) return;
    if (!photos.includes(newImageURL)) {
      setPreview(null);
      return void setExistingPhoto(undefined);
    }
    _handlePreviewChange(newImageURL);
  }, [newImageURL]);

  useEffect(() => {
    // Reset the inputs whenever the selected option is changed
    if (selectedOption === 2) {
      if (photos.includes(newImageURL)) {
        preview || _handlePreviewChange(newImageURL);
      } else {
        setNewImageURL("");
      }
    } else {
      if (selectedOption !== 1) {
        setNewImageURL("");
      }
      setExistingPhoto(undefined);
      setPreview(null);
    }
    setImageFile(null);
  }, [selectedOption]);

  useEffect(() => {
    if (uploadProgress === null) {
      document.body.style.cursor = "default";
    } else {
      document.body.style.cursor = "progress";
    }
  }, [uploadProgress]);

  /** Reads the relevant fields from the image's metadata and updates the client-side data. */
  function setMetadata(rawMetadata) {
    let metadata = {};
    try {
      metadata = JSON.parse(rawMetadata)?.customMetadata ?? {};
    } catch (parseError) {
      console.error(rawMetadata, parseError);
    }
    setImageAuthor && setImageAuthor(metadata.author ?? "");
    setImageAltText && setImageAltText(metadata.altText ?? "");
  }

  function _handlePreviewChange(photoName) {
    setExistingPhoto(photoName);

    setNewImageURL(photoName);
    setPreview(DEFAULT_IMAGE);
    getDataFromFilename(photoName, "400x300", setPreview, setMetadata);
  }

  function _handleSelectPhoto(e) {
    setImageFile(e.target.files[0]);
  }

  const canUploadFile =
    uploadProgress === null &&
    (!setImageAuthor || imageAuthor) &&
    (!setImageAltText || imageAltText);
  const showImageMetadataInputs = [0, 1].includes(selectedOption);

  const uploadBtnStyle = {
    marginTop: -10,
    marginBottom: 8,
    cursor: canUploadFile
      ? "pointer"
      : uploadProgress === null
      ? "not-allowed"
      : "wait",
  };

  /** Uploads the selected file to the server. */
  function _handleSubmitPhoto(e) {
    if (!canUploadFile) {
      return void e.preventDefault();
    }
    handlePhotoUpdate(
      imageFile,
      setUploadProgress,
      imageAuthor,
      imageAltText
    ).then((photoName) => {
      setNewImageURL(photoName);
      setSelectedOption(2);
      refetchPhotos();
      setUploadProgress(null);
    });
  }

  return (
    <div className="w-full mb-4 pt-1">
      <div className="w-full inline-flex justify-between">
        {OPTIONS.map((text, idx) => (
          <label className="select-none mx-auto" key={idx}>
            <input
              className="mr-2"
              type="radio"
              name="photoRadio"
              checked={idx === selectedOption}
              onChange={() => setSelectedOption(idx)}
            />
            {text}
          </label>
        ))}
      </div>
      {selectedOption === 0 ? (
        <InputFile
          label={"Miniatura"}
          placeholder={"Wybierz zdjęcie..."}
          onChange={_handleSelectPhoto}
          acceptedExtensions=".jpeg, .jpg, .png"
          required
        />
      ) : (
        [1, 2].includes(selectedOption) && (
          <InputBox
            name="image-url"
            placeholder={selectedOption === 1 ? "URL zdjęcia" : "Nazwa zdjęcia"}
            maxLength={256}
            value={newImageURL}
            onChange={setNewImageURL}
            choices={selectedOption === 2 ? photos : []}
            required
          />
        )
      )}
      {preview && (
        <img
          className="mt-3 bg-gray-200/75 object-cover w-full aspect-[16/10] rounded-xl group-hover:ring-[.2rem] ring-primaryDark/40 transition-all duration-300"
          src={preview}
        />
      )}
      {showImageMetadataInputs && setImageAuthor && (
        <InputBox
          name="image-author"
          placeholder="Autor zdjęcia"
          maxLength={64}
          value={imageAuthor}
          onChange={setImageAuthor}
          required
        />
      )}
      {showImageMetadataInputs && setImageAltText && (
        <InputBox
          name="image-alt-text"
          placeholder="Tekst alternatywny do zdjęcia"
          maxLength={64}
          value={imageAltText}
          onChange={setImageAltText}
          required
        />
      )}
      {imageFile && selectedOption === 0 && (
        <div>
          <button
            type="button"
            className="add-btn"
            style={uploadBtnStyle}
            onClick={_handleSubmitPhoto}
            title={canUploadFile ? "" : "Pola oznaczone gwiazdką są wymagane."}
          >
            <p>
              {uploadProgress === null ? "Prześlij zdjęcie" : uploadProgress}
            </p>
          </button>
        </div>
      )}
    </div>
  );
}
