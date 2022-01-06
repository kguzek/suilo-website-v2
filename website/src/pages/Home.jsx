import React, { useState, useEffect } from 'react'
import Blob from '../media/blob'
import { Link } from 'react-router-dom'

const Home = ({ setPage }) => {
    const [luckyNumbers, setLuckyNumbers] = useState([0, 0])
    const [forDate, setForDate] = useState("10 sty 2022")

    useEffect(() => {
        setPage("home")
        // fetch("URLSCZESLIWYCHNUMERKOW").then((res)=>{
        //     setLuckyNumbers([String(res.xxxxx), String(res.xxxxx)])
        //     setForDate(String(res.xxxxx))
        // });
        //
        // TUTAJ WYŻEJ ZINTEGROWAĆ LUCKY NUMBERS API
    }, [])

    return (
        <div className="home-1">
            <div className="CTA">
                <h1>Samorząd Uczniowski</h1>
                <h4>I Liceum Ogólnokształcącego w Gliwicach</h4>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginTop: ".2em" }}>
                    <Link to="/aktualnosci" className="CTA-primary">
                        Nasze działania
                    </Link>
                    <Link to="/kontakt" className="CTA-secondary" style={{ marginLeft: "1.5em" }}>
                        Kontakt
                    </Link>
                </div>
            </div>
            <div className="LN" title={`szczęśliwe numerki na dziś to: ${luckyNumbers[0]} i ${luckyNumbers[1]} `}>
                <h5>lucky numbers:</h5>
                <div className="LN-box">
                    <div className="LN-container">
                        <p className="LN-txt">
                            {luckyNumbers[0]}
                        </p>
                    </div>
                    <div className="LN-container">
                        <p className="LN-txt">
                            {luckyNumbers[1]}
                        </p>
                    </div>
                </div>
                <h5 style={{ paddingTop: ".4em", fontSize: "1.25em", opacity: ".9" }}>{forDate}</h5>
            </div>
            <div className="more">
                <div className="more1" />
                <div className="more2">
                    więcej
                </div>
            </div>

        </div >
    );
}


export default Home