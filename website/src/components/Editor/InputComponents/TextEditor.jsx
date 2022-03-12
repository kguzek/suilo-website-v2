// import React, { useState, useEffect } from "react";
// import { Editor, EditorState } from "draft-js";
// import 'draft-js/dist/Draft.css';
// const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
// useEffect(() => {
//     onChange()
// }, [editorState])
//<Editor editorState={editorState} onChange={setEditorState} />

const TextEditor = ({ onChange, value }) => {
  function _handleChange(e) {
    let text = e.target.innerHTML.trim();
    if (text.endsWith("<br>")) {
      text = text.substring(0, text.length - "<br>".length);
    }
    onChange(text);
  }
  
  return (
    <div className="relative w-full">
      <p className="absolute -top-[.55rem] leading-3 bg-bg scale-[.785] font-semibold text-text6 -left-[.25rem] ">
        {!value && <span style={{ color: "red" }}>*</span>}
        Treść
      </p>
      <div
        contentEditable={true}
        suppressContentEditableWarning={true}
        className=" p-[.1rem] px-1 ring-2 outline-none ring-[#d4d4d4] rounded-sm hover:ring-primary/50 focus:ring-primary text-[#222222] text-justify md:text-left mt-2 leading-[1.85rem] lg:leading-9 lg:mt-2  lg:text-xl  font-normal text-lg"
        onBlur={_handleChange}
      >
        {value}
        {/* TODO: Implement placeholder text */}
        {/* <p className="text-[#222222] text-justify md:text-left mt-2 leading-[1.85rem] lg:leading-9 lg:mt-2  lg:text-xl  font-normal text-lg">
          Edytuj...
        </p> */}
      </div>
    </div>
  );
};

export default TextEditor;
