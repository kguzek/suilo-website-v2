import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Hamburger from "hamburger-react";
import LogoSU from "../media/LogoSU";
// import Blob from "../media/blob";

const NavBar = ({ page, userInfo, loginAction, logoutAction }) => {
  const { width } = useWindowDimensions();
  const [isOpen, setOpen] = useState(false);
  const [display, setDisplay] = useState("none");
  const [opacity, setOpacity] = useState(0);
  const [bgColor, setBgColor] = useState("transparent");
  const [yHeight, setYHeight] = useState("40px");

  const [isSafeToChange, setSafety] = useState(true);

  // Determine if the current user is permitted to edit any pages
  const userIsEditor =
    userInfo?.isAdmin || (userInfo?.canEdit ?? []).length > 0;

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
    if (userInfo) {
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
        if (key === "edit" && !userIsEditor) {
          break;
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
        if (key === "edit" && !userIsEditor) {
          break;
        }
        return transforms[key];
      }
    }
    return transforms.default;
  }

  if (width > 800) {
    return (
      <div className="nav-bar">
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
            {userIsEditor ? (
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
          {userInfo ? "Wyloguj się" : "Zaloguj się"}
        </button>
      </div>
    );
  } else {
    return (
      <div className="flex flex-row justify-between align-middle w-11/12 m-auto relative pt-4">
        <LogoSU width={40} height={40} />
        <div className="relative w-3/4">
          <div
            className={`
              ${isOpen ? "bg-white" : "bg-transparent"}
              ${isOpen ? "drop-shadow-2xl" : "drop-shadow-none"}
              ${isOpen ? "h-fit" : "h-11"}
              absolute right-0 -top-2
              transition-all
              w-full
              z-50
              duration-200
            `}
          >
            <div className="flex justify-between">
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
              className={`
                ${isOpen ? "flex" : "hidden"}
                ${isOpen ? "opacity-100" : "opacity-0"}
                flex-col
                relative
                justify-center
                align-top
                transition-all
                duration-200
              `}
            >
              <Link
                onClick={() => setOpen(false)}
                to="/"
                className={`
                  ${isOpen ? "flex" : "hidden"}
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${page === "home" ? "text-text1" : "text-text4"}
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
              >
                Główna
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="aktualnosci"
                className={`
                  ${isOpen ? "flex" : "hidden"}
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${page === "news" ? "text-text1" : "text-text4"}
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
              >
                Aktualności
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="wydarzenia"
                className={`
                  ${isOpen ? "flex" : "hidden"}
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${page === "events" ? "text-text1" : "text-text4"}
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
              >
                Wydarzenia
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="kontakt"
                className={`
                  ${isOpen ? "flex" : "hidden"}
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${page === "contact" ? "text-text1" : "text-text4"}
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
              >
                Kontakt
              </Link>
              {userInfo ? (
                <Link
                  onClick={() => setOpen(false)}
                  to="edycja"
                  className={`
                  ${isOpen ? "flex" : "hidden"}
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  ${page === "edit" ? "text-text1" : "text-text4"}
                  w-fit
                  text-xl
                  px-6
                  py-2
                  my-2
                  m-auto
                  transition-all
                  duration-200
                `}
                >
                  {" "}
                  Edycja
                </Link>
              ) : null}
              <div
                className={`
                  ${isOpen ? "opacity-100" : "opacity-0"}
                  bg-primary
                  m-auto
                  w-fit
                  inline-flex
                  justify-center
                  mt-6
                  py-3
                  px-6 
                  mb-7 
                  drop-shadow-md
                  cursor-pointer
                  transition-all
                  duration-200
                  rounded-lg
                `}
                onClick={() => {
                  _handleLogin();
                  setOpen(false);
                }}
              >
                <p className="text-white text-md font-medium">
                  {userInfo ? "Wyloguj się" : "Zaloguj się"}
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
  return { width: window.innerWidth, height: window.innerHeight };
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
