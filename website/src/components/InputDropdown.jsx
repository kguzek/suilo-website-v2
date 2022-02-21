import React, { useState } from "react";


const Option = (el) => {
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

// MIKOŁAJ currentSchoolId nic nie robi nie chcę ci grzebać w kodzie zrób tak że jak się to przesyła to zmienia opcje na tą którą się przesłało jak ma się wyświetlić nowa szkoła przesyła ""
const InputDropdown = (onChangeCallback, currentValue, defaultLabel, valueDisplayArray, label) => {

    const DEF = {
        value: "",
        display: defaultLabel
    }

    return (
        <div style={{ marginTop: "-15px" }} >
            <h4 className="dropdown-label">
                {label}
            </h4>
            <div className="spacer" />
            <select
                className="dropdown-header"
                value={currentValue}
                onChange={(e) => onChangeCallback(e.target.value)}
            >
                <Option value={DEF} />
                {/* {
                    valueDisplayArray.map(el => <Option el={el} />)
                } */}
                {/* { RENDER OPRIONS
                    valueDisplayArray.map(Obj => <Option value={Obj} />)

                /* {schools.filter(school => permisions.schoolList.includes(school.id || "") || permisions.admin).
                    map(scholobj =>
                        <Option value={scholobj} />
                    )} */}
            </select>
        </div >
    );
}

export default InputDropdown