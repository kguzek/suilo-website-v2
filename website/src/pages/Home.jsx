import React, { useState, useEffect } from 'react'
import Blob from '../media/blob'
import { Link } from 'react-router-dom'
import SuPhoto from '../media/su-photo.jpg'

const Home = ({ setPage }) => {
    const [luckyNumbers, setLuckyNumbers] = useState([13, 14])
    const [forDate, setForDate] = useState("10 sty 2022")

    useEffect(() => {
        setPage("home")
        document.title = "Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach";

        // fetch("URLSCZESLIWYCHNUMERKOW").then((res)=>{
        //     setLuckyNumbers([String(res.xxxxx), String(res.xxxxx)])
        //     setForDate(String(res.xxxxx))
        // });
        //
        // TUTAJ WYŻEJ ZINTEGROWAĆ LUCKY NUMBERS API
    }, [])

    const _scrollDown = () => {
        window.scrollTo({ top: 900, behavior: 'smooth' });
    }

    return (
        <div className="page-main">
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
                    <h5 style={{ paddingTop: ".45em", fontSize: "1.4em", opacity: ".9", paddingBottom: "2vh" }}>{forDate}</h5>
                </div>
                <div className="more" onClick={() => _scrollDown()}>
                    <div className="more1" />
                    <div className="more2">
                        więcej
                    </div>
                </div>
            </div>
            <div className="home-2">
                <div className="top-description">
                    <div className="description-image">
                        <img src={SuPhoto} />
                    </div>
                    <div className="info-part">
                        <h2 className="description-header" title="informacje o Samorządzie">
                            Nasza drużyna
                        </h2>
                        <p className="description-p">
                            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
                        </p>
                    </div>
                </div>
            </div>
            <div className="main-roles">
                <div className="person-container">
                    <p className="person-class">2C</p>
                    <div className="person-avatar" />
                    <div className="person-description">
                        <p className="person-name">Szymon Wróbel</p>
                        <p className="person-role">Marszałek</p>
                    </div>
                </div>
                <div className="person-container">
                    <p className="person-class">3Ap</p>
                    <div className="person-avatar" />
                    <div className="person-description">
                        <p className="person-name">Adam Kurzak</p>
                        <p className="person-role">Sekretarz</p>
                    </div>
                </div>
                <div className="person-container">
                    <p className="person-class">3Bg</p>
                    <div className="person-avatar" />
                    <div className="person-description">
                        <p className="person-name">Mikołaj Mrózek</p>
                        <p className="person-role">Skarbink; Konsultant</p>
                    </div>
                </div>
                <div className="person-container">

                    <div className="person-avatar" />
                    <div className="person-description">
                        <p className="person-name">Barbara Białowąs</p>
                        <p className="person-role">Opiekun</p>
                    </div>
                </div>
            </div>

        </div>


    );
}


export default Home