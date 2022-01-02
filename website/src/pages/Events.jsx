import React, { useState, useEffect } from 'react'

const Events = ({ setPage }) => {

    useEffect(() => {
        setPage("events")
    }, [])

    return (
        <div style={{ minHeight: "89vh" }}>
            <p>Events</p>
        </div>
    );
}


export default Events