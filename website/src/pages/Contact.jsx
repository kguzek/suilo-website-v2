import React, { useState, useEffect } from 'react'

const Contact = ({ setPage }) => {

    useEffect(() => {
        setPage("contact")
        document.title = "Kontakt | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach";

    }, [])

    return (
        <div style={{ minHeight: "89vh" }}>
            <p>Contact</p>
        </div>
    );
}


export default Contact