import React, { useState, useEffect } from "react";

const CookiesAlert = () => {
  const [yPos, setY] = useState("-140px");
  const [display, setDisplay] = useState("none");
  const { height, width } = useWindowDimensions();
  // user agreed to cookies policy
  const _cookieAgree = () => {
    //action
    localStorage.setItem("cookiesEnabled", "true");
    _fadeOut();
  };

  // user disagreed with cookies policy
  const _cookieDisagree = () => {
    //action
    localStorage.setItem("cookiesEnabled", "false");
    _fadeOut();
  };

  // animation on enter
  useEffect(() => {
    if (!localStorage.getItem("cookiesEnabled")) {
      setDisplay("flex");
      setTimeout(() => {
        setY("0");
      }, 100);
    }
  }, []);

  // animation on exit
  const _fadeOut = () => {
    setY("-140px");
    setTimeout(() => {
      setDisplay("none");
    }, 500);
  };

  if (width > 850) {
    return (
      <div className="cookies-box" style={{ display: display, bottom: yPos }}>
        <div className="cookies-info">
          <p className="cookies-header">
            Strona używa plików cookies i wymaga zgody na poprawne jej
            funkcjonowanie.
          </p>
          <p className="cookies-description">
            psst... przechowujemy tylko informacje o sesji logowania
          </p>
        </div>
        <div className="cookies-buttons">
          <div className="cookies-agree" onClick={() => _cookieAgree()}>
            <p>Wyrażam zgodę</p>
          </div>
          <div className="cookies-disagree" onClick={() => _cookieDisagree()}>
            <p>Nie wyrażam zgody</p>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="cookies-box" style={{ display: display, bottom: yPos }}>
        <div className="cookies-info">
          <p className="cookies-header">
            Strona używa plików cookies i wymaga zgody na poprawne jej
            funkcjonowanie.
          </p>
          <p className="cookies-description">
            psst... przechowujemy tylko informacje o sesji logowania
          </p>
        </div>
        <div className="cookies-buttons">
          <div className="cookies-agree" onClick={() => _cookieAgree()}>
            <p>Wyrażam zgodę</p>
          </div>
          <div className="cookies-disagree" onClick={() => _cookieDisagree()}>
            <p>Nie wyrażam zgody</p>
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

export default CookiesAlert;
