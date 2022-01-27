import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Hamburger from "hamburger-react";
import LogoSU from "../media/LogoSU";
import Blob from "../media/blob";

const NavBar = ({ page, logged, loginAction, logoutAction }) => {
  const { height, width } = useWindowDimensions();
  const [isOpen, setOpen] = useState(false);
  const [display, setDisplay] = useState("none");
  const [opacity, setOpacity] = useState(0);
  const [bgColor, setBgColor] = useState("transparent");
  const [yHeight, setYHeight] = useState("40px");

  const [isSafeToChange, setSafety] = useState(true);

  useEffect(() => {
    setSafety(false);
    if (isOpen) {
      // on navbar open
      fadeInDom();
    } else {
      // on navbar close
      fadeOutDom();
    }
  }, [isOpen]);

  const fadeInDom = () => {
    setDisplay("flex"); // change display
    setTimeout(() => {
      setYHeight("87em"); // change height
      setTimeout(() => {
        setOpacity(1); // change opacity
        setBgColor("white"); // change bg color
        setSafety(true);
      }, 110);
    }, 10);
  };

  const fadeOutDom = () => {
    setOpacity(0); // change opacity
    setTimeout(() => {
      setYHeight("10em"); // change height
      setTimeout(() => {
        setBgColor("transparent"); // change bg color
        setTimeout(() => {
          setDisplay("none");
          setSafety(true);
        }, 210);
      }, 110);
    }, 40);
  };

  const _handleLogin = () => {
    if (logged) {
      logoutAction();
    } else {
      loginAction();
    }
  };

  function getIndicatorWidth() {
    const widths = {
      home: 2.5,
      news: 4.2,
      events: 4,
      contact: 3.1,
      edit: 2.65,
      default: 2.5,
    };
    if (page) {
      for (const key in widths) {
        if (!page.startsWith(key)) {
          continue;
        }
        if (key === "edit" && !logged) {
          continue;
        }
        return widths[key];
      }
    }
    return widths.default;
  }

  function getIndicatorTransform() {
    const transforms = {
      home: 2,
      news: 8.65,
      events: 17.15,
      contact: 25.35,
      edit: 31.9,
      default: 2,
    };
    if (page) {
      for (const key in transforms) {
        if (!page.startsWith(key)) {
          continue;
        }
        if (key === "edit" && !logged) {
          continue;
        }
        return transforms[key];
      }
    }
    return transforms.default;
  }

  if (width > 800) {
    return (
      <div className="nav-bar">
        {/* <div className="blob" style={{ top: "-580px", left: "-830px", transform: "rotate(97deg)" }}>
                    <Blob width="1000px" height="900px" />
                </div>
                <div className="blob" style={{ top: "-300px", right: "-750px", transform: "rotate(12deg)" }}>
                    <Blob width="1200px" height="1400px" />
                </div> */}
        <Link to="/" style={{ padding: 0, margin: 0, margionBottom: "-1vh" }}>
          <LogoSU width="3.5em" height="3.5em" />
        </Link>
        <div className="nav-box">
          <div
            id="indicator"
            style={{
              width: `${getIndicatorWidth()}em`,
              transform: `translateX(${getIndicatorTransform()}em)`,
            }}
          />
          <nav className="nav-desktop">
            <Link
              to="/"
              className="link-box"
              style={{ color: page === "home" ? "#111111" : "#5B5B5B" }}
            >
              Główna
            </Link>
            <Link
              to="aktualnosci"
              className="link-box"
              style={{ color: page === "news" ? "#111111" : "#5B5B5B" }}
            >
              Aktualności
            </Link>
            <Link
              to="wydarzenia"
              className="link-box"
              style={{ color: page === "events" ? "#111111" : "#5B5B5B" }}
            >
              Wydarzenia
            </Link>
            <Link
              to="kontakt"
              className="link-box"
              style={{ color: page === "contact" ? "#111111" : "#5B5B5B" }}
            >
              Kontakt
            </Link>
            {logged ? (
              <Link
                to="edycja"
                className="link-box"
                style={{ color: page === "edit" ? "#111111" : "#5B5B5B" }}
              >
                Edycja
              </Link>
            ) : null}
          </nav>
        </div>
        <button className="login-btn" onClick={() => _handleLogin()}>
          {logged ? "Wyloguj się" : "Zaloguj się"}
        </button>
      </div>
    );
  } else {
    return (
      <div className="nav-bar" style={{ paddingLeft: "3em" }}>
        <LogoSU width={38} height={38} />
        <div style={{ position: "relative" }}>
          <div
            className="mobile-top"
            style={{
              backgroundColor: bgColor,
              boxShadow: isOpen
                ? "0 5px 25px rgba(60, 50, 0, .1)"
                : "0 7px 40px rgba(60, 50, 0, 0)",
              height: yHeight,
              maxHeight: yHeight,
              minHeight: yHeight,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div />
              <Hamburger
                toggled={isOpen}
                toggle={isSafeToChange ? setOpen : null}
                duration={0.3}
                distance="md"
                color={isOpen ? "#FFA900" : "#fff"}
                rounded
                size={26}
              />
            </div>
            <nav
              className="nav-mobile"
              style={{ display: display, opacity: opacity }}
            >
              <Link
                onClick={() => setOpen(false)}
                to="/"
                className="link-box-mobile"
                style={{
                  color: page === "home" ? "#111111" : "#5B5B5B",
                  opacity: isOpen | 0,
                  pointerEvents: isOpen ? "all" : "none",
                }}
              >
                Główna
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="aktualnosci"
                className="link-box-mobile"
                style={{
                  color: page === "news" ? "#111111" : "#5B5B5B",
                  opacity: isOpen | 0,
                  pointerEvents: isOpen ? "all" : "none",
                }}
              >
                Aktualności
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="wydarzenia"
                className="link-box-mobile"
                style={{
                  color: page === "events" ? "#111111" : "#5B5B5B",
                  opacity: isOpen | 0,
                  pointerEvents: isOpen ? "all" : "none",
                }}
              >
                Wydarzenia
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="kontakt"
                className="link-box-mobile"
                style={{
                  color: page === "contact" ? "#111111" : "#5B5B5B",
                  opacity: isOpen | 0,
                  pointerEvents: isOpen ? "all" : "none",
                }}
              >
                Kontakt
              </Link>
              {logged ? (
                <Link
                  onClick={() => setOpen(false)}
                  to="edycja"
                  className="link-box-mobile"
                  style={{
                    color: page === "edit" ? "#111111" : "#5B5B5B",
                    opacity: isOpen | 0,
                    pointerEvents: isOpen ? "all" : "none",
                  }}
                >
                  {" "}
                  Edycja
                </Link>
              ) : null}
              <div
                className="login-btn-mobile"
                onClick={() => {
                  _handleLogin();
                  setOpen(false);
                }}
                style={{
                  backgroundColor: "#FFA900",
                  width: "25em",
                  margin: "auto",
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "7em",
                  opacity: isOpen | 0,
                  pointerEvents: isOpen ? "all" : "none",
                  transition: "all 200ms ease-in-out",
                }}
              >
                <p style={{ color: "#fff" }}>
                  {logged ? "Wyloguj się" : "Zaloguj się"}
                </p>
              </div>
            </nav>
          </div>
        </div>
      </div>
    );
  }
};

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}
function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export default NavBar;
