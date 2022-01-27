import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./styles/app.css";
import News from "./pages/News";
import Home from "./pages/Home";
import Edit from "./pages/Edit";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import Post from "./pages/Post";
import NavBar from "./components/NavBar";
import LoginScreen from "./components/LoginScreen";
import Footer from "./components/Footer";
import ShortLinkRedirect from "./pages/ShortLinkRedirect";
import { getResults, logOut, AuthProvider } from "./firebase";
import ScrollToTop, { scrollToTop } from "./components/ScrollToTop";
import CookiesAlert from "./components/CookiesAlert";
import { useCookies } from "react-cookie";

function App() {
  const [page, setPage] = useState(null);
  const [logged, setLogged] = useState(false); // to integrate with actual login state, can be swapped to parent/outside variable passed into this child
  const [startLogging, setLogging] = useState(false);
  const [tokenAPI, setTokenAPI] = useState(); // this should be the working access token for the api, not yet tested
  const [UserEmail, setEmail] = useState(); // user's email
  const [cookies, setCookies, removeCookies] = useCookies();
  useEffect(() => {
    getResults(callback);
    // console.log("Cookies:", cookies);
  }, []);

  //---debug code---//
  useEffect(() => {
    if (page !== null) {
      // console.log(page);
      scrollToTop();
    }
    return;
  }, [page]);

  const callback = (apiToken, email) => {
    if (apiToken !== null && email !== null) {
      setTokenAPI(apiToken);
      setEmail(email);
      if (email.endsWith("@lo1.gliwice.pl")) {
        setLogged(true);
      } else {
        logOut();
      }
    } else {
      setLogged(false);
    }
  };

  const loginAction = () => {
    // console.log("zalogowoano!")
    // setLogged(true)
    // CALL LOG SCREEN
    setLogging(true);
  };

  const logoutAction = () => {
    logOut();
    // console.log("wylogowano!")
    //setLogged(false)
    // LOGOUT (to integrate with backend) !!!!!! -------------------------- !!!!
  };

  return (
    <AuthProvider callback={callback}>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              page={page}
              logged={logged}
              loginAction={loginAction}
              logoutAction={logoutAction}
              setLogging={setLogging}
              startLogging={startLogging}
              setLogged={setLogged}
              showCookies={!cookies.cookie}
            />
          }
        >
          <Route index element={<Home setPage={setPage} />} />
          <Route path="aktualnosci" element={<News setPage={setPage} />}>
            <Route path="post" element={<Post setPage={setPage} />}>
              <Route path=":postID" element={<Post setPage={setPage} />} />
            </Route>
          </Route>
          <Route path="wydarzenia" element={<Events setPage={setPage} />} />
          <Route path="kontakt" element={<Contact setPage={setPage} />} />
          <Route
            path="edycja"
            element={
              <Edit
                setPage={setPage}
                logged={logged}
                loginAction={loginAction}
              />
            }
          />
          <Route path="*" element={<ShortLinkRedirect setPage={setPage} />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

const Layout = ({
  page,
  logged,
  loginAction,
  logoutAction,
  startLogging,
  setLogging,
  setLogged,
  showCookies,
}) => {
  return (
    <main>
      <div
        style={{
          top: "-3vh",
          left: "0",
          width: "30em",
          height: "100vh",
          background: "linear-gradient(-150deg,#FF9900,#FFC300)",
          position: "absolute",
          zIndex: -99999,
          transformOrigin: "top left",
          transform: "scale(.65)",
          clipPath:
            "path('M-254.73708-719.90154c101.2235-39.31238,245.38935,6.30359,353.14951,93.87061,108.439,88.27,181.105,217.8829,239.28706,362.83841,57.55027,145.56758,99.30695,306.38681,30.68232,379.45324C299.0773,188.62426,118.75881,173.843-27.84143,242.02288c-227.45885,105.78438-227.49889,198.49679-388.40643,233.736-207.39228,45.42249-521.8526-67.31778-592.75068-312.25552-57.279-197.88783,63.84638-414.93994,203.92341-509.51865,108.751-73.42822,164.462-29.50921,294.71133-120.23791,154.41672-107.5614,139.04581-208.376,255.62672-253.64832')",
        }}
      />
      <div
        style={{
          top: "-35vh",
          right: "0",
          width: "32.5em",
          height: "170vh",
          background: "linear-gradient(-140deg,#FF9900,#FFC300)",
          position: "absolute",
          zIndex: -99999,
          transformOrigin: "top right",
          transform: "scale(1)",
          clipPath:
            "path('M3.06834,441.14016C-4.9308,332.85221,80.8371,208.33,196.07717,130.88529,312.18791,52.99694,457.37432,21.40331,612.99757,8.14541,769.0214-4.3294,935.01226,2.75728,984.8191,89.74084c48.93589,87.42814-17.91579,255.53594,4.42167,415.65489,34.65721,248.4337,123.30154,275.577,109.95678,439.74689-17.19719,211.598-216.93908,479.33975-471.88772,475.5269-205.9757-3.0806-378.11958-182.363-427.608-343.962-38.42159-125.46014,19.86327-165.89369-28.81671-316.96933C113.17431,580.63135,12.27678,565.856,3.06834,441.14016')",
        }}
      />
      <NavBar
        page={page}
        logged={logged}
        loginAction={loginAction}
        logoutAction={logoutAction}
      />
      <ScrollToTop />
      <Outlet />
      <CookiesAlert showCookies={showCookies} />
      <LoginScreen
        setLogging={setLogging}
        setLogged={setLogged}
        startLogging={startLogging}
      />
      <Footer />
    </main>
  );
};

export default App;
