import React, { useState, useEffect } from 'react'
import Blob from '../media/blob'

const Home = ({ setPage }) => {

    useEffect(() => {
        setPage("home")
    }, [])

    return (
        <div style={{ minHeight: "89vh" }}>
            <p>Home</p>

        </div>
    );
}


export default Home