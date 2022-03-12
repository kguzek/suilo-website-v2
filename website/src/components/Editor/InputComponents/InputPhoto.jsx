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

const NO_SELECT_STYLE = {
  MozUserSelect: "none",
  WebkitUserSelect: "none",
  msUserSelect: "none",
  userSelect: "none",
  OUserSelect: "none",
};

export default function InputPhoto({
  imageURL,
  setImageURL,
  photos,
  handlePhotoUpdate,
}) {
  const [selectedOption, setSelectedOption] = useState(1);
  const [existingPhoto, setExistingPhoto] = useState("");
  const [preview, setPreview] = useState(DEFAULT_IMAGE);

  function _handlePreviewChange(idx) {
    const photoName = photos[idx];
    setExistingPhoto(photoName);
    setImageURL(photoName);
    setPreview(DEFAULT_IMAGE);
    getURLfromFileName(photoName, "400x300", setPreview);
  }

  function onChange(e) {
    const option = e.target.id.split("_")[1];
    setSelectedOption(parseInt(option));
  }

  return (
    <div>
      <div
        className="w-full inline-flex justify-between pl-20 pr-20"
        onChange={onChange}
      >
        {OPTIONS.map((text, idx) => (
          <label key={idx} style={NO_SELECT_STYLE}>
            <input
              id={`option_${idx + 1}`}
              className="mr-2"
              type="radio"
              defaultChecked={idx === 0}
              name="photoRadio"
            />
            {text}
          </label>
        ))}
      </div>
      {selectedOption === 1 ? (
        <InputFile
          label={"Miniatura"}
          placeholder={"Wybierz zdjęcie..."}
          onChange={(e) => handlePhotoUpdate(e.target.files[0], setImageURL)}
          acceptedExtensions=".jpeg, .jpg, .png"
        />
      ) : selectedOption === 2 ? (
        <InputBox
          name="image-url"
          placeholder="URL zdjęcia"
          maxLength={256}
          value={imageURL}
          onChange={setImageURL}
        />
      ) : (
        selectedOption === 3 && (
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
            onChangeCallback={_handlePreviewChange}
            valueDisplayObject={photos}
            isFirst={false}
          />
        )
      )}
      {preview !== DEFAULT_IMAGE && (
        <img
          className="mt-3 bg-gray-200/75 object-cover w-full aspect-[16/10] rounded-xl group-hover:ring-[.2rem] ring-primaryDark/40 transition-all duration-300"
          src={preview}
        />
      )}
    </div>
  );
}
