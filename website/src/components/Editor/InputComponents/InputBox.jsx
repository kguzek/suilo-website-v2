import { useState, useEffect } from "react";
import { conjugatePolish } from "../../../misc";

const InputBox = ({
  value,
  type = "text",
  name,
  required = true,
  placeholder,
  width = "100%",
  onChange,
  cleanup,
  maxLength = 0,
  pattern = ".{2,}",
  min,
  max,
  disabled = false,
  //adam tried to do a thing
  choices = [],
  onBlur,
}) => {
  const [focused, setFocus] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setCharCount(value?.length ?? 0);
  }, [value]);

  const style = hidden ? { color: "transparent" } : {};

  useEffect(() => {
    if (type !== "date") return;
    setHidden(!focused && !value);
  }, [focused, value]);

  return (
    <div className="main my-1" style={{ width: width }}>
      <input
        className="input"
        style={style}
        required={required}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false);
          onBlur && onBlur();
        }}
        value={value}
        type={type}
        name={name}
        min={min}
        max={max}
        pattern={pattern}
        maxLength={maxLength === 0 ? 512 : maxLength}
        onChange={(e) => {
          onChange(e.target.value);
          setCharCount(e.target.value.length);
          if (cleanup !== undefined) {
            cleanup();
          }
        }}
        disabled={disabled}
        //adam tried to da a thing
        list={choices.length === 0 ? "" : "list" + name}
      />
      {choices.length !== 0 && (
        <datalist id={"list" + name}>
          {choices.map((val) => (
            <option value={val} key={val} />
          ))}
        </datalist>
      )}

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
        {required && !value && <span style={{ color: "red" }}>*</span>}
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
        {maxLength === 0
          ? conjugatePolish(charCount, "znak", "", "i", "ów")
          : `${charCount}/${maxLength}`}
      </p>
    </div>
  );
};

export default InputBox;
