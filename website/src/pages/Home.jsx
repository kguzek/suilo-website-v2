import React, { useState, useEffect } from 'react'
import Blob from '../media/blob'

const Home = ({ setPage }) => {

    useEffect(() => {
        setPage("home")
    }, [])

    return (
        <div>
            <p>Home</p>

        </div>
    );
}


export default Home