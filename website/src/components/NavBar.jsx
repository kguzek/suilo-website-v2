import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import { Menu, X } from 'react-feather'
import Hamburger from 'hamburger-react'
import LogoSU from '../media/LogoSU'

const NavBar = ({ page, logged, loginAction, logoutAction }) => {
    const { height, width } = useWindowDimensions();
    const [isOpen, setOpen] = useState(false)

    const _handleLogin = () => {
        // console.log("sprawdzam logowanie")
        if (logged) {
            logoutAction();
        } else {
            loginAction();
        }
    }


    if (width > 800) {
        return (
            <div className="nav-bar">
                <LogoSU width={50} height={50} />
                <div className="nav-box">
                    <div id="indicator"
                        style={{
                            width: page === "home" ? "35px" :
                                page === "news" ? "55px" :
                                    page === "events" ? "52px" :
                                        page === "contact" ? "37px" :
                                            page === "edit" && logged ? "32px" :
                                                "35px",
                            transform:
                                page === "home" ? "translateX(37px)" :
                                    page === "news" ? "translateX(150px)" :
                                        page === "events" ? "translateX(288px)" :
                                            page === "contact" ? "translateX(418px)" :
                                                page === "edit" && logged ? "translateX(525px)" :
                                                    "translateX(37px)"
                        }}
                    />
                    <nav className="nav-desktop">
                        <Link to="/" className="link-box" style={{ color: page === "home" ? "#111111" : "#5B5B5B" }}>Główna</Link>
                        <Link to="aktualnosci" className="link-box" style={{ color: page === "news" ? "#111111" : "#5B5B5B" }}>Aktualności</Link>
                        <Link to="wydarzenia" className="link-box" style={{ color: page === "events" ? "#111111" : "#5B5B5B" }}>Wydarzenia</Link>
                        <Link to="kontakt" className="link-box" style={{ color: page === "contact" ? "#111111" : "#5B5B5B" }}>Kontakt</Link>
                        {logged ? <Link to="edycja" className="link-box" style={{ color: page === "edit" ? "#111111" : "#5B5B5B" }}>Edycja</Link> : null}
                    </nav>
                </div>
                <div className="login-btn" onClick={() => _handleLogin()} >
                    <p>
                        {!logged ? "Zaloguj się" : "Wyloguj się"}
                    </p>
                </div>
            </div>
        );
    } else {
        return (
            <div className="nav-bar" style={{ paddingLeft: "6px" }}>
                <LogoSU width={38} height={38} />
                <div style={{ position: "relative" }}>
                    <div className="mobile-top" style={{ backgroundColor: isOpen ? '#fff' : "transparent", boxShadow: isOpen ? "0 5px 25px rgba(60, 50, 0, .1)" : "0 7px 40px rgba(60, 50, 0, 0)" }}>
                        <div style={{ marginLeft: "120px" }}>
                            <Hamburger toggled={isOpen} toggle={setOpen} duration={0.3} distance="md" color={isOpen ? "#FFA900" : "#fff"} rounded size={26} />
                        </div>
                        <nav className="nav-mobile" style={{ display: isOpen ? "flex" : "none" }}>
                            <Link to="/" className="link-box-mobile" style={{ color: page === "home" ? "#111111" : "#5B5B5B", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "all" : "none" }}>Główna</Link>
                            <Link to="aktualnosci" className="link-box-mobile" style={{ color: page === "news" ? "#111111" : "#5B5B5B", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "all" : "none" }}>Aktualności</Link>
                            <Link to="wydarzenia" className="link-box-mobile" style={{ color: page === "events" ? "#111111" : "#5B5B5B", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "all" : "none" }}>Wydarzenia</Link>
                            <Link to="kontakt" className="link-box-mobile" style={{ color: page === "contact" ? "#111111" : "#5B5B5B", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "all" : "none" }}>Kontakt</Link>
                            {logged ? <Link to="edycja" className="link-box-mobile" style={{ color: page === "edit" ? "#111111" : "#5B5B5B", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "all" : "none" }} > Edycja</Link> : null}
                            <div className="login-btn" onClick={() => _handleLogin()} style={{ backgroundColor: "#FFA900", width: "77px", margin: "auto", display: "flex", justifyContent: "center", marginTop: "30px", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "all" : "none", transition: "all 200ms ease-in-out" }} >
                                <p style={{ color: "#fff" }}>
                                    {!logged ? "Zaloguj się" : "Wyloguj się"}
                                </p>
                            </div>
                        </nav>
                    </div>
                </div>

            </div >
        );
    }
}


function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}
function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}

export default NavBar