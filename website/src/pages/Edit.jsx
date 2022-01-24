import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";

const Edit = ({ setPage, logged, loginAction }) => {
    let navigate = useNavigate()
    useEffect(() => {
        if (!logged) {
            // console.log("edit nie zalogowano")
            loginAction();
            navigate("/")
            setPage("home")
            return;
        } else {
            // console.log("edit zalogowoano")
            setPage("edit")
            document.title = "Edycja kontentu | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach";
            return;
        }
    }, []) //INITIAL CALL

    useEffect(() => {
        if (!logged) {
            // console.log("edit nie zalogowano")
            // loginAction();
            navigate("/")
            setPage("home")
            return;
        } else {
            // console.log("edit zalogowoano")
            setPage("edit")
            return;
        }
    }, [logged]) //CALL WHEN LOGGED HAVE CHANGED

    return (
        <div style={{ minHeight: "89vh" }}>
            <p>Edit</p>
        </div>
    );
}


export default Edit