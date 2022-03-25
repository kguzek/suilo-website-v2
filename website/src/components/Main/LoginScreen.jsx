import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { getMobileSignInResult, signInWithGoogle } from "../../firebase";

function LoginScreen({ screenWidth }) {
  // startLogging opens login window :boolean
  const [errorMessage, setErrorMessage] = useState(null);
  const [display, setDisplay] = useState("none");
  const [opacity, setOpacity] = useState(0);
  const [yPos, setYPos] = useState("10vh");
  const [isSafeToChange, setSafety] = useState(true);
  const [cookies, setCookies, removeCookies] = useCookies(["loginStage"]);

  function signInCallback(error) {
    if (error) {
      setErrorMessage(error);
      setCookies("loginStage", "error", { sameSite: "lax" });
    } else {
      removeCookies("loginStage");
    }
  }

  useEffect(() => {
    if (isSafeToChange) {
      if (cookies.loginStage) {
        fadeInDom();
      } else {
        fadeOutDom();
      }
    }
    setSafety(false);
  }, [isSafeToChange]);

  useEffect(() => {
    if (cookies.loginStage === "redirectGoogleMobile") {
      getMobileSignInResult(signInCallback);
    }
  }, []);

  const fadeInDom = () => {
    setDisplay("flex");
    setTimeout(() => {
      setOpacity(1);
      setYPos(0);
      setSafety(true);
    }, 10);
  };

  const fadeOutDom = () => {
    setOpacity(0);
    setYPos("-10vh");
    setTimeout(() => {
      setDisplay("none");
      setYPos("10vh");
      setSafety(true);
    }, 310);
  };

  function _handleLogin(usePopup) {
    setErrorMessage();
    const loginStage = `redirectGoogle${usePopup ? "Desktop" : "Mobile"}`;
    setCookies("loginStage", loginStage, { sameSite: "lax" });
    signInWithGoogle(usePopup, signInCallback);
  }

  function _handleRegister(e) {
    e && e.preventDefault();
    // TODO: HANDLE NEW USER :INTEGRATE:
    setErrorMessage("Rejestracja nowych kont jest niedostępna");
  }

  if (screenWidth > 800) {
    return (
      <div
        className="login-container"
        style={{ display: display, opacity: opacity, zIndex: 9999999 }}
      >
        <div className="login-bg" onClick={() => removeCookies("loginStage")} />
        <div className="login-box" style={{ transform: `translateY(${yPos})` }}>
          <img
            alt="Login screen image"
            className="login-left"
            src={`https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`}
          />

          <div className="login-right">
            <div />
            <div className="login-center">
              <p className="text-text1 font-extrabold text-[2rem]">
                Zaloguj się
              </p>
              <div className="login-disabled">
                <p className="disabled-p">
                  Logowanie się z kont pozaszkolnych jest na chwilę obecną
                  niemożliwe. Przepraszamy.
                </p>
              </div>
              <p className="text-text4 font-normal text-sm text-center p-2">
                lub
              </p>
              <div
                className="login-google-btn "
                style={{
                  cursor: cookies.loginStage?.startsWith("redirectGoogle")
                    ? "progress"
                    : "pointer",
                }}
                onClick={() => _handleLogin(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ionicon"
                  height="1.75em"
                  width="1.75em"
                  style={{ marginRight: ".5em" }}
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="#fff"
                    d="M473.16 221.48l-2.26-9.59H262.46v88.22H387c-12.93 61.4-72.93 93.72-121.94 93.72-35.66 0-73.25-15-98.13-39.11a140.08 140.08 0 01-41.8-98.88c0-37.16 16.7-74.33 41-98.78s61-38.13 97.49-38.13c41.79 0 71.74 22.19 82.94 32.31l62.69-62.36C390.86 72.72 340.34 32 261.6 32c-60.75 0-119 23.27-161.58 65.71C58 139.5 36.25 199.93 36.25 256s20.58 113.48 61.3 155.6c43.51 44.92 105.13 68.4 168.58 68.4 57.73 0 112.45-22.62 151.45-63.66 38.34-40.4 58.17-96.3 58.17-154.9 0-24.67-2.48-39.32-2.59-39.96z"
                  />
                </svg>
                <p className="login-google-p">
                  {cookies.loginStage?.startsWith("redirectGoogle")
                    ? "Logowanie..."
                    : "Zaloguj sie przez Google"}
                </p>
              </div>
              {errorMessage && <p className="login-error">{errorMessage}</p>}
              <p className="login-info">
                Logowanie się poprzez Google możliwe jest tylko z domeny
                @lo1.gliwice.pl (maila szkolnego)
              </p>
            </div>
            <p className="register-p">
              Nie masz konta?{" "}
              <a
                href="rejestracja"
                onClick={_handleRegister}
                className="register-a"
              >
                Zarejestruj się!
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="login-container"
      style={{ display: display, opacity: opacity }}
    >
      <div className="login-bg" onClick={() => removeCookies("loginStage")} />
      <div
        className="login-box"
        style={{
          width: "87%",
          maxWidth: "auto",
          minWidth: "auto",
          borderRadius: "20px",
          position: "relative",
          transform: `translateY(${yPos})`,
        }}
      >
        <div
          className="login-right"
          style={{
            width: "100%",
            paddingBottom: "5px",
            position: "relative",
          }}
        >
          <div />
          <div
            style={{
              position: "absolute",
              top: "0px",
              left: "0",
              right: "0",
              height: "20px",
              backgroundColor: "#FFA900",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
            }}
          />
          <div className="login-center">
            <p className="login-header">Zaloguj się</p>
            <div className="login-disabled">
              <p className="disabled-p">
                Logowanie się z kont pozaszkolnych jest na chwilę obecną
                niemożliwe. Przepraszamy.
              </p>
            </div>
            <p className="disabled-p" style={{ padding: "7px" }}>
              lub
            </p>
            <div
              className="login-google-btn"
              onClick={() => _handleLogin(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ionicon"
                height="26px"
                width="26px"
                style={{ marginRight: "6px" }}
                viewBox="0 0 512 512"
              >
                <title>Logo Google</title>
                <path
                  fill="#fff"
                  d="M473.16 221.48l-2.26-9.59H262.46v88.22H387c-12.93 61.4-72.93 93.72-121.94 93.72-35.66 0-73.25-15-98.13-39.11a140.08 140.08 0 01-41.8-98.88c0-37.16 16.7-74.33 41-98.78s61-38.13 97.49-38.13c41.79 0 71.74 22.19 82.94 32.31l62.69-62.36C390.86 72.72 340.34 32 261.6 32c-60.75 0-119 23.27-161.58 65.71C58 139.5 36.25 199.93 36.25 256s20.58 113.48 61.3 155.6c43.51 44.92 105.13 68.4 168.58 68.4 57.73 0 112.45-22.62 151.45-63.66 38.34-40.4 58.17-96.3 58.17-154.9 0-24.67-2.48-39.32-2.59-39.96z"
                />
              </svg>
              <p className="login-google-p">
                {cookies.loginStage?.startsWith("redirectGoogle")
                  ? "Logowanie..."
                  : "Zaloguj sie przez Google"}
              </p>
            </div>
            {errorMessage && <p className="login-error">{errorMessage}</p>}
            <p className="login-info">
              Logowanie się poprzez Google możliwe jest tylko z domeny
              @lo1.gliwice.pl (maila szkolnego)
            </p>
          </div>
          <p className="register-p">
            Nie masz konta?{" "}
            <a
              href="rejestracja"
              onClick={_handleRegister}
              className="register-a"
            >
              Zarejestruj się!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
