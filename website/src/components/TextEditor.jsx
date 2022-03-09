import React, { useState, useEffect } from 'react'
import { Editor, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';

const TextEditor = ({ onChange }) => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    useEffect(() => {
        onChange()
    }, [editorState])

    return (
        <>
            <Editor editorState={editorState} onChange={setEditorState} />
        </>
    );
}

export default TextEditor;