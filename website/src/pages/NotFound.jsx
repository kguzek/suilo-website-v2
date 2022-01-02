import React, { useState, useEffect } from 'react'

const NotFound = ({ setPage }) => {

    useEffect(() => {
        setPage("notFound")
    }, [])

    return (
        <div style={{ minHeight: "89vh" }}>
            <p>NotFound</p>
        </div>
    );
}


export default NotFound