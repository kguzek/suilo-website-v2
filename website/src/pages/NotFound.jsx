import React, { useState, useEffect } from 'react'
import MetaTags from 'react-meta-tags';

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