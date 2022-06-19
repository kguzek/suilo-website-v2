import { useState, useEffect } from "react";

const Filter = ({ name, onChange, active }) => {
  const _onChange = () => {
    if (active) {
      onChange({ type: "REMOVE", filter: name });
    } else {
      onChange({ type: "ADD", filter: name });
    }
  };

  return (
    <button
      className={`
        ${
          active
            ? "bg-primary text-white hover:bg-primaryDark"
            : "bg-gray-200 text-text1 hover:bg-gray-300"
        }
        transition-all duration-75
        rounded-md inline-block px-3 py-1
      `}
      onClick={() => _onChange()}
    >
      <p className='p-0 m-0 text-sm'>{name}</p>
    </button>
  );
};

export default Filter;
