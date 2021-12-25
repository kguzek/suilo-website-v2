import React, { useState, useEffect } from 'react'

const Edit = ({ setPage }) => {

    useEffect(() => {
        setPage("edit")
    }, [])

    return (
        <div>
            <p>Edit</p>
        </div>
    );
}


export default Edit