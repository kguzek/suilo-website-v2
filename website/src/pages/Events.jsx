import React, { useState, useEffect } from 'react'

const Events = ({ setPage }) => {

    useEffect(() => {
        setPage("events")
        document.title = "Wydarzenia | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach";

    }, [])

    return (
        <div style={{ minHeight: "89vh" }}>
            <p>Events</p>
        </div>
    );
}


export default Events