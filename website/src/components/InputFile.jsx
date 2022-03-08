import React, { useState, useEffect } from 'react'

const InputFile = ({
    placeholder,
    onChange,
    acceptedExtensions
}) => {
    const [focused, setFocus] = useState(false);
    const [value, setValue] = useState("")

    return (
        <label
            className="main"
        >
            <div
                className="input"
                required
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                style={{ height: "1.4em", maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden" }}
            >
                <input
                    type="file"
                    accept={acceptedExtensions}
                    onChange={(e) => { setValue(e.target.value.replace(`C:\\fakepath\\`, "")); onChange(e) }}
                />
                {value}
            </div>
            <p
                className="placeholder"
                style={{
                    transform: (focused || value !== "") ? "translate(-.3em, -1em) scale(.75)" : "translate(0,0) scale(1)",
                    color: (focused) ? "#111111" : "rgb(130, 130, 130)",
                    padding: ".1em .2em",
                    top: ".2em",
                }}
            >
                {placeholder}
            </p>
            <p
                className="char-count"
                style={{
                    display: "block",
                    color: "rgb(160, 160, 160)"
                }}
            >
                {`(Obsługiwane formaty: ${acceptedExtensions})`}
            </p>
        </label>
    )
}

export default InputFile;