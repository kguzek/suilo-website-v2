import React, { useState, useEffect } from 'react'
import MetaTags from 'react-meta-tags';

const Events = ({ setPage }) => {

    useEffect(() => {
        setPage("events")
    }, [])

    return (
        <div style={{ minHeight: "89vh" }}>
            <MetaTags>
                <title>Wydarzenia | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach</title>
                <meta name="description" content="Następne wydarzenie to:" /> {/* EVENT TO BE ADDED */}
                <meta property="og:title" content="Kalendarz i wydarzenia | SUILO Gliwice" />
                <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
            </MetaTags>
            <p>Events</p>
        </div>
    );
}


export default Events