import React, { useEffect, useState } from "react";
import { DEFAULT_IMAGE, getURLfromFileName } from "../../../misc";
import InputBox from "./InputBox";
import InputDropdown from "./InputDropdown";
import InputFile from "./InputFile";

const OPTIONS = [
  "Prześlij nowe zdjęcie",
  "Wpisz URL zdjęcia",
  "Użyj istniejącego zdjęcia",
  "Brak zdjęcia",
];

export default function InputPhoto({
  imageURL,
  setImageURL,
  photos,
  handlePhotoUpdate,
  imageAuthor,
  setImageAuthor,
  imageAltText,
  setImageAltText,
}) {
  const [selectedOption, setSelectedOption] = useState(0);
  const [existingPhoto, setExistingPhoto] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // Set the default option whenever the post is changed
    if (photos.includes(imageURL)) {
      setSelectedOption(2);
      setExistingPhoto(imageURL);
    } else {
      selectedOption !== 3 && setSelectedOption(imageURL ? 1 : 0);
    }
  }, [imageURL]);

  useEffect(() => {
    // Set blank image URL when "no image" is selected
    if ([0, 3].includes(selectedOption)) {
      setImageURL("");
      setExistingPhoto("");
      setPreview(null);
    }
  }, [selectedOption]);

  function _handlePreviewChange(idx) {
    const photoName = photos[idx];
    setExistingPhoto(photoName);

    setImageURL(photoName);
    setPreview(DEFAULT_IMAGE);
    getURLfromFileName(photoName, "400x300", setPreview);
  }

  return (
    <div>
      <div className="w-full inline-flex justify-between pl-20 pr-20">
        {OPTIONS.map((text, idx) => (
          <label className="select-none" key={idx}>
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
          onChange={(e) => handlePhotoUpdate(e.target.files[0], setImageURL)}
          acceptedExtensions=".jpeg, .jpg, .png"
          required={true}
        />
      ) : selectedOption === 1 ? (
        <InputBox
          name="image-url"
          placeholder="URL zdjęcia"
          maxLength={256}
          value={imageURL}
          onChange={setImageURL}
          required={true}
        />
      ) : (
        selectedOption === 2 && (
          // <InputBox
          //   name="existing-photo"
          //   placeholder="Nazwa zdjęcia"
          //   maxLength={256}
          //   value={existingPhoto}
          //   onChange={_handlePreviewChange}
          //   choices={photos}
          // />
          <InputDropdown
            name="existing-image"
            label="Nazwa zdjęcia"
            currentValue={photos.indexOf(existingPhoto)}
            defaultLabel={imageURL ? "" : "<Wybierz>"}
            onChangeCallback={_handlePreviewChange}
            valueDisplayObject={photos}
            isFirst={false}
            required={true}
          />
        )
      )}
      {preview && (
        <img
          className="mt-3 bg-gray-200/75 object-cover w-full aspect-[16/10] rounded-xl group-hover:ring-[.2rem] ring-primaryDark/40 transition-all duration-300"
          src={preview}
        />
      )}
      {selectedOption !== 3 && setImageAuthor && (
        <InputBox
          name="image-author"
          placeholder="Autor zdjęcia"
          maxLength={64}
          value={imageAuthor}
          onChange={setImageAuthor}
          required={imageURL !== "" ? true : false}
        />
      )}
      {selectedOption !== 3 && setImageAltText && (
        <InputBox
          name="image-alt-text"
          placeholder="Tekst alternatywny do zdjęcia"
          maxLength={64}
          value={imageAltText}
          onChange={setImageAltText}
          required={imageURL !== "" ? true : false}
        />
      )}
    </div>
  );
}
