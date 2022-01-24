import React, { useState, useEffect } from 'react'
import Blob from '../media/blob'
import { Link } from 'react-router-dom'
import SuPhoto from '../media/su-photo.jpg'
import SecondaryPostCard from '../components/SecondaryPostCard'
import { ArrowRight, Youtube, Instagram, Facebook } from 'react-feather'

const dummyData = [
    {
        id: `ijsdfb32tew`,
        title: `Adam Sarkowicz: "uczymy do ostatniego żywego ucznia" `,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://www.sportslaski.pl/static/thumbnail/article/med/13452.jpg`,
        views: `2137`
    },
    {
        id: `sdf89ub8743`,
        title: `SpeedDating edycja 2022 - informacje`,
        text: `Nowa edycja SpeedDating'u już przednami, w tym poście znajdziecie wszystkie przydatne informacje dotyczące tegorocznej edycji wydarzenia.`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1544911845-1f34a3eb46b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `4326`
    },
    {
        id: `534879bjifsd`,
        title: `PiS znowu atakuje polską edukację `,
        text: `Co tu dużo mówić, w końcu żyjemy w Polsce.. Niemniej tutaj mamy dla was krótkie podsumownie aktualnych informacji dotyczących LexCzarnek i idiotyzmów polskiego obozu rządzącego. `,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `42069`
    },
    {
        id: `432fsdsdffd`,
        title: `Fotorelacja z wycieczki do babiogórskiego parku narodowego`,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
        views: `2137`
    },
    {
        id: `5349769fgdgfd`,
        title: `Teorie spiskowe odnośnie p. Dziedzica [ZOBACZ ZDJĘCIA]`,
        text: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
        date: new Date(),
        photo: `https://images.unsplash.com/photo-1470145318698-cb03732f5ddf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80`,
        views: `2137`
    }
]

const Home = ({ setPage }) => {
    const [luckyNumbers, setLuckyNumbers] = useState([13, 14])
    const [forDate, setForDate] = useState("10 sty 2022")
    const [newsData, setNewsData] = useState([{}])

    useEffect(() => {
        setPage("home")
        document.title = "Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach";

        // fetch("URLSCZESLIWYCHNUMERKOW").then((res)=>{
        //     setLuckyNumbers([String(res.xxxxx), String(res.xxxxx)])
        //     setForDate(String(res.xxxxx))
        // });
        //
        // INTEGRATE LUCKY NUMBERS API
        //
        // 
        // fetch("URL").then((res)=>{
        //      setNewsData(res)  
        // })
        //
        //  INTEGRATE DOWNLOADING FIRST 5 NEWS PREVIEW DATA FROM API
    }, [])

    const _generateNewsPreview = (data) => {
        return data.map((el, i) => <SecondaryPostCard key={`${el.id}${i}`} postData={el} />)
    }

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
                        <img src={SuPhoto} alt="Zdjęcie przewodniczących wchodzących w główny skład Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach" />
                    </div>
                    <div className="info-part" title="Kim jest Samorząd Uczniowski 1 Liceum Ogólnokształcącego w Gliwicach">
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
                    <src className="person-avatar" alt="Zdjęcie Szymona Wróbla - marszałka Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach" />
                    <div className="person-description" title="Marszałek Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach">
                        <p className="person-name">Szymon Wróbel</p>
                        <p className="person-role">Marszałek</p>
                    </div>
                </div>
                <div className="person-container">
                    <p className="person-class">3Ap</p>
                    <src className="person-avatar" alt="Zdjęcie Adama Kurzaka - sekretarza Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach" />
                    <div className="person-description" title="Sekretarz Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach">
                        <p className="person-name" >Adam Kurzak</p>
                        <p className="person-role">Sekretarz</p>
                    </div>
                </div>
                <div className="person-container">
                    <p className="person-class">3Bg</p>
                    <src className="person-avatar" alt="Zdjęcie Mikołaja Mrózka - skarbnika i konsultanta Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach" />
                    <div className="person-description" title="Skarbnik i Konsultant Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach">
                        <p className="person-name">Mikołaj Mrózek</p>
                        <p className="person-role">Skarbink; Konsultant</p>
                    </div>
                </div>
                <div className="person-container">
                    <src className="person-avatar" alt="Zdjęcie Barbary Białowąs - opiekunki Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach" />
                    <div className="person-description" title="Opiekun Samorządu Uczniowskiego 1 Liceum Ogólnokształcącego w Gliwicach">
                        <p className="person-name">Barbara Białowąs</p>
                        <p className="person-role">Opiekun</p>
                    </div>
                </div>
            </div>
            <div className="home-section-header">
                <h2>Aktualności</h2>
                <Link to="/aktualnosci" className="link-more" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <p>zobacz wszystko</p>
                    <ArrowRight size={22} strokeWidth={"2px"} style={{ marginBottom: "-0em" }} color="#FFA900" />
                </Link>
            </div>
            <div className="home-3">
                {_generateNewsPreview(dummyData)}
            </div>
            <div className="home-4">
                <a className="social-media-btn" href="https://www.facebook.com/SUILOGliwice" target="_blank">
                    <Facebook size={44} strokeWidth={1.35} color="#858585" />
                    <p>/SUILOGliwice</p>
                </a>
                <a className="social-media-btn" href="https://www.instagram.com/suilo_gliwice/" target="_blank">
                    <Instagram size={44} strokeWidth={1.35} color="#858585" style={{ marginRight: ".4em" }} />
                    <p>/suilo_gliwice</p>
                </a>
                <a className="social-media-btn" href="https://www.youtube.com/channel/UCOHtZM1JWEVaWs8pZATmZ_g" target="_blank">
                    <Youtube size={44} strokeWidth={1.35} color="#858585" style={{ marginRight: ".4em" }} />
                    <p>/SUILOGliwice</p>
                </a>
                <a className="social-media-btn" href="https://www.instagram.com/jedynkatv/" target="_blank">
                    <Instagram size={44} strokeWidth={1.35} color="#858585" style={{ marginRight: ".4em" }} />
                    <p>/jedynkatv</p>
                </a>
                <a className="social-media-btn" href="https://www.youtube.com/channel/UC48_30_99lSOq_ZyuTe9yOA" target="_blank">
                    <Youtube size={44} strokeWidth={1.35} color="#858585" style={{ marginRight: ".4em" }} />
                    <p>/JedynkaTV</p>
                </a>
            </div>
        </div>


    );
}


export default Home