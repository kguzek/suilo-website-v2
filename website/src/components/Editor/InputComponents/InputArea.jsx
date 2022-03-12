import { useState, useEffect } from "react";

const InputArea = ({
  value,
  type = "text",
  name,
  placeholder,
  width = "100%",
  onChange,
  cleanup,
  maxLength = 0,
  pattern = ".{2,}",
}) => {
  const [focused, setFocus] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  return (
    <div className="main" style={{ width: width }}>
      <textarea
        className="input"
        required
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        value={value}
        type={type}
        name={name}
        style={{ maxWidth: width, maxHeight: "10em", height: "2em" }}
        pattern={pattern}
        maxLength={maxLength === 0 ? 512 : maxLength}
        onChange={(e) => {
          onChange(e.target.value);
          setCharCount(e.target.value.length);
          if (cleanup !== undefined) {
            cleanup();
          }
        }}
      />
      <p
        className="placeholder"
        style={{
          transform:
            focused || value !== ""
              ? type === "date" || type === "time"
                ? "translate(-.3em, -1.2em) scale(.75)"
                : "translate(-.3em, -1em) scale(.75)"
              : "translate(0,0) scale(1)",
          color: focused ? "#111111" : "rgb(130, 130, 130)",
          padding:
            type === "date"
              ? ".3em 4em .25em .2em"
              : type === "time"
              ? ".1em .4em .25em .2em"
              : ".1em .2em",
          top: type === "date" ? ".75em" : type === "time" ? ".95em" : ".8em",
        }}
      >
        {placeholder}
      </p>
      <p
        className="char-count"
        style={{
          display: type === "text" ? "block" : "none",
          color: focused
            ? charCount === maxLength && maxLength !== 0
              ? "rgb(242, 50, 0)"
              : "rgb(160, 160, 160)"
            : "rgb(121, 121, 121)",
        }}
      >
        {charCount}
        {maxLength === 0 ? " znaków" : `/${maxLength}`}
      </p>
    </div>
  );
};

export default InputArea;
