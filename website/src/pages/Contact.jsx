import React, { useState, useEffect } from 'react'

const Contact = ({ setPage }) => {

    useEffect(() => {
        setPage("contact")
    }, [])

    return (
        <div>
            <p>Contact</p>
        </div>
    );
}


export default Contact