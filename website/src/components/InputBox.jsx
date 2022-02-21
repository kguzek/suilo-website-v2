import { useState } from "react";

const InputBox = ({
    value,
    type = "text",
    placeholder,
    onChange,
    cleanup,
    pattern = ".{2,}",
}) => {
    const [focused, setFocus] = useState(false);

    return (
        <div
            className="main"
        >
            <input
                className="input"
                required
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                value={value}
                type={type}
                name={type}
                pattern={pattern}
                onChange={(e) => { onChange(e.target.value); if (cleanup !== undefined) { cleanup() } }}
            />
            <p
                className="placeholder"
                style={{
                    transform: (focused || value !== "") ? "translate(-.3em, -1em) scale(.75)" : "translate(0,0) scale(1)",
                    color: (focused) ? "#111111" : "rgb(100, 100, 100)"
                }}
            >
                {placeholder}
            </p>
        </div>
    );
}

export default InputBox;