import React, { useState, useEffect } from 'react'

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