import React, { useState } from "react";
const InputDropdown = ({ onChangeCallback, currentValue, defaultLabel, valueDisplayArray, label }) => {

    const [focused, setFocus] = useState(false)

    const DEF = {
        value: "",
        display: defaultLabel
    }

    const _renderOption = (data) => {
        return data.map((el) => <Option el={el} />)
    }

    return (
        <div style={{ marginTop: "-15px" }} >
            <p
                className="select-label"
                style={{
                    transform: "scale(.75)",
                    color: (focused) ? "#111111" : "rgb(100, 100, 100)"
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
                {defaultLabel !== "" && <Option el={DEF} />}
                {
                    _renderOption(valueDisplayArray)
                }
            </select>
        </div >
    );
}

const Option = ({ el }) => {
    return (
        <option
            key={el.value}
            className="dropdown-option"
            value={el.value}
        >
            {el.display}
        </option>
    )
}


export default InputDropdown;