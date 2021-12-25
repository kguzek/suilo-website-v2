import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";
import { Menu, X } from 'react-feather'
import LogoSU from '../media/LogoSU'

const NavBar = ({ page }) => {
    const { height, width } = useWindowDimensions();
    const [logged, setLogged] = useState(false)

    if (width > 700) {
        return (
            <div className="nav-bar">
                <LogoSU width={50} height={50} />
                <div className="nav-box">
                    <div id="indicator" />
                    <nav>
                        <Link to="/" className="link-box" style={{ color: page === "home" ? "#111111" : "#5B5B5B" }}>Główna</Link>
                        <Link to="aktualnosci" className="link-box" style={{ color: page === "news" ? "#111111" : "#5B5B5B" }}>Aktualności</Link>
                        <Link to="wydarzenia" className="link-box" style={{ color: page === "events" ? "#111111" : "#5B5B5B" }}>Wydarzenia</Link>
                        <Link to="kontakt" className="link-box" style={{ color: page === "contact" ? "#111111" : "#5B5B5B" }}>Kontakt</Link>
                        {/* <Link to="edycja" className="link-box" style={{color: page==="edit"?"#111111":"#5B5B5B"}}>Edycja</Link> */}
                    </nav>
                </div>
                <div className="login-btn">
                    <p>
                        {!logged ? "Zaloguj się" : "Wyloguj się"}
                    </p>
                </div>
            </div>
        );
    } else {
        return (
            <div>

            </div>
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