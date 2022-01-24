import React, { useState, useEffect } from 'react'
import MetaTags from 'react-meta-tags';

const Contact = ({ setPage }) => {

    useEffect(() => {
        setPage("contact")
    }, [])

    return (
        <div style={{ minHeight: "89vh" }}>
            <MetaTags>
                <title>Kontakt | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach</title>
                <meta name="description" content="Można się z nami skontaktować online poprzez Facebooka, Instagrama, Discorda, oraz E-mail, jak i również fizycznie w szkole. Więcej informacji na stronie. " />
                <meta property="og:title" content="Kontakt | SUILO Gliwice" />
                <meta property="og:image" content="" /> {/* IMAGE TO BE ADDED */}
            </MetaTags>
            <p>Contact</p>
        </div>
    );
}


export default Contact