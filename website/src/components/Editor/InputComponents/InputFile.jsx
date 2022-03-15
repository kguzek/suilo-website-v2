import React, { useState } from "react";

const InputFile = ({ placeholder, label, onChange, acceptedExtensions }) => {
  const [focused, setFocus] = useState(false);
  const [value, setValue] = useState("");

  return (
    <label className="main pt-[.33rem]">
      <div
        className="input"
        required
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          height: "1.4em",
          maxWidth: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <input
          type="file"
          accept={acceptedExtensions}
          onChange={(e) => {
            setValue(e.target.value.replace("C:\\fakepath\\", ""));
            onChange(e);
          }}
        />
        {/* TODO: pls fix value element styling, this is a temporary solution */}
        <p style={{ marginTop: "-10px" }}>{value}</p>
      </div>
      <p
        className="placeholder"
        style={{
          transform:
            focused || value !== ""
              ? "translate(-.3em, -1em) scale(.75)"
              : "translate(0,0) scale(1)",
          color: focused ? "#111111" : "rgb(130, 130, 130)",
          padding: ".1em .2em",
          top: ".5em",
        }}
      >
        {value ? (
          <span>{label}</span>
        ) : (
          <>
            <span style={{ color: "red" }}>*</span>[{placeholder}]
          </>
        )}
      </p>
      <p
        className="char-count"
        style={{
          display: "block",
          color: "rgb(160, 160, 160)",
        }}
      >
        {`(Obsługiwane formaty: ${acceptedExtensions})`}
      </p>
    </label>
  );
};

export default InputFile;
