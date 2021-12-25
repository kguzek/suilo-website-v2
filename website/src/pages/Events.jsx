import React, { useState, useEffect } from 'react'

const Events = ({ setPage }) => {

    useEffect(() => {
        setPage("events")
    }, [])

    return (
        <div>
            <p>Events</p>
        </div>
    );
}


export default Events