import React, { useState, useEffect } from 'react'

const NotFound = ({ setPage }) => {

    useEffect(() => {
        setPage("notFound")
    }, [])

    return (
        <div>
            <p>NotFound</p>
        </div>
    );
}


export default NotFound