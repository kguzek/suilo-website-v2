import React, { useState } from "react";

export default function InputDropdown({
  onChangeCallback,
  currentValue,
  defaultLabel,
  valueDisplayObject,
  label,
  isFirst = true,
  required = false,
}) {
  const [focused, setFocus] = useState(false);

  function _renderOption(data) {
    const entries = Object.entries(data);
    if (defaultLabel) {
      // Add the default label to the beginning of the object entries
      entries.splice(0, 0, ["_default", defaultLabel]);
    }
    return entries.map(([key, display]) => (
      <option key={key} className="dropdown-option" value={key}>
        {display}
      </option>
    ));
  }

  return (
    <div style={isFirst ? { marginTop: "-.9em" } : {}}>
      <p
        className="select-label"
        style={{
          transform: "scale(.75)",
          marginBottom: "-.35rem",
          color: focused ? "#111111" : "rgb(100, 100, 100)",
        }}
      >
        {label}
      </p>
      <select
        className="dropdown-header"
        value={currentValue}
        onChange={(e) => onChangeCallback(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      >
        {_renderOption(valueDisplayObject)}
      </select>
    </div>
  );
}
