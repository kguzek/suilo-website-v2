import React, { useState, useEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { useCookies } from "react-cookie";

import "./styles/app.css";
import Home from "./pages/Home";
import News from "./pages/News";
import Post from "./pages/Post";
import Edit from "./pages/Edit";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import NumbersArchive from "./pages/NumbersArchive";
import ShortLinkRedirect from "./components/Main/ShortLinkRedirect";
import NavBar from "./components/Main/NavBar";
import Footer from "./components/Main/Footer";
import LoginScreen from "./components/Main/LoginScreen";
import CookiesAlert from "./components/Main/CookiesAlert";
import ScrollToTop, { scrollToTop } from "./components/Main/ScrollToTop";
import {
  logOut,
  AuthProvider,
  fetchWithToken,
  auth,
  DEBUG_MODE,
} from "./firebase";

export default function App() {
  const [page, setPage] = useState(null);
  const [userEmail, setUserEmail] = useState(undefined);
  const [footerVisible, setFooterVisible] = useState(true);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [collectionInfo, setCollectionInfo] = useState({});
  const [cookies, setCookies, removeCookies] = useCookies([
    "loginStage",
    "userPerms",
  ]);
  const [userPerms, setUserPerms] = useState(cookies.userPerms);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const handleResize = () => setScreenWidth(window.innerWidth);

  useEffect(() => {
    // This function could also be called in the below useEffect hook,
    // however that would result in the API being called each time the user
    // switches page (which could be very often).
    // Currently it is only called when the page is first loaded (i.e. on each refresh).
    checkForUpdates();

    // Window width event listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (page === "edit") {
      setFooterVisible(false);
    } else {
      setFooterVisible(true);
    }
    page && scrollToTop();
  }, [page]);

  /** Pings the server to check when the last database update was made for each individual collection.
   *  Compares the creation date of each client-side cache with the server-side modification date.
   *  If the corresponding server-side date is higher than the cache's date, it is removed, and the
   *  `shouldRefresh` state variable is set to `true`.
   */
  function checkForUpdates() {
    setShouldRefresh(false);
    DEBUG_MODE && console.info("Checking for server updates...");
    fetchWithToken("/collectionInfo/").then((res) => {
      res.json().then((collections) => {
        setCollectionInfo(collections);
        let shouldRefresh = false;
        for (const cacheName in localStorage) {
          const endpoint = cacheName.split("_").shift();
          const collection = collections[endpoint];
          // The cache does not start with a collection name
          if (!collection) continue;
          const collectionUpdated = new Date(collection.lastUpdated);
          try {
            const cache = JSON.parse(localStorage.getItem(cacheName));
            if (new Date(cache?.date) > collectionUpdated) {
              // Cache is newer than the date it was updated
              continue;
            }
          } catch (parseError) {
            // Data is not serialised JSON
          }

          // Check if the cache name is a valid endpoint
          if (collectionUpdated.toString() !== "Invalid Date") {
            // The cache is too old
            console.debug("Removing cache", cacheName, "(server-side update)");
            localStorage.removeItem(cacheName);
            if (cacheName === "users") {
              // Re-evaluate user permissions if the users were modified
              setUserEmail(undefined);
              setUserPermissions(auth.currentUser, true);
            }
            shouldRefresh = true;
          }
        }
        // Only update the state when all caches have been processed
        shouldRefresh
          ? setShouldRefresh(true)
          : DEBUG_MODE && console.info("Everything is up-to-date");
      });
    });
  }

  /** Callback to be executed whenever the state of the currently signed in user is changed.
   * Returns true if the user is a valid option (i.e. actual user from @lo1.gliwice.pl or no user at all).
   * Returns false if the user is from outside of the LO1 organisation.
   */
  function setUserPermissions(user, force = false) {
    if (!user) {
      DEBUG_MODE && console.info("No user. Logging out.");
      setUserEmail(null);
      // This means that the next time someone logs in the API will have to verify if they are an editor
      setUserPerms(undefined);
      removeCookies("userPerms");
      return true;
    }
    if (!user.email.endsWith("@lo1.gliwice.pl")) {
      DEBUG_MODE && console.info("Invalid email. Logging out.");
      setUserEmail(null);
      setUserPerms(undefined);
      removeCookies("userPerms");
      return false;
    }
    setUserEmail(user.email);
    if (userPerms?.email === user.email && !force) {
      return true;
    }
    // Refresh the user authentication level each time if debug mode is enabled

    // Check if the user has edit permissions by performing a dummy PUT request to the API
    DEBUG_MODE && console.info("Checking user permissions...");

    /** Update the cookie with the proper user pemissions. */
    function setUserEditPermissions(permsInfo) {
      const perms = {
        email: user.email,
        isAdmin: permsInfo?.isAdmin ?? false,
        canEdit: permsInfo?.canEdit ?? [],
      };
      // Determine if the user is permitted to edit any pages
      DEBUG_MODE &&
        (perms.isAdmin || perms.canEdit.length > 0) &&
        console.info(`Enabled edit screen for ${user.email}.`);
      // Update the user cookie
      setUserPerms(perms);
      setCookies("userPerms", perms, { sameSite: "lax" });
    }

    fetchWithToken("/").then(
      (res) => {
        // Log user permissions
        res.json().then((data) => {
          DEBUG_MODE && console.debug(data);
          setUserEditPermissions(data.userInfo); // userInfo can be undefined
        });
      },
      (error) => {
        console.error("Error setting user permissions!", error);
        setUserEditPermissions();
      }
    );

    return true;
  }

  function loginAction() {
    // CALL LOG SCREEN
    setCookies("loginStage", "started", { sameSite: "lax" });
  }
  function logoutAction() {
    logOut();
  }

  return (
    <AuthProvider setUserCallback={setUserPermissions}>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              page={page}
              loginAction={loginAction}
              logoutAction={logoutAction}
              userInfo={userPerms}
              footerVisible={footerVisible}
              screenWidth={screenWidth}
            />
          }
        >
          <Route
            index
            element={
              <Home
                setPage={setPage}
                reload={shouldRefresh}
                setReload={setShouldRefresh}
                screenWidth={screenWidth}
              />
            }
          />
          <Route
            path="aktualnosci"
            element={
              <News
                setPage={setPage}
                reload={shouldRefresh}
                setReload={setShouldRefresh}
                collectionInfo={collectionInfo.news ?? { numDocs: 0 }}
              />
            }
          >
            <Route
              path="post"
              element={
                <Post
                  user={userEmail}
                  setPage={setPage}
                  reload={shouldRefresh}
                  setReload={setShouldRefresh}
                />
              }
            >
              <Route
                path=":postID"
                element={
                  <Post
                    setPage={setPage}
                    reload={shouldRefresh}
                    setReload={setShouldRefresh}
                  />
                }
              />
            </Route>
          </Route>
          <Route
            path="wydarzenia"
            element={
              <Events
                setPage={setPage}
                reload={shouldRefresh}
                setReload={setShouldRefresh}
                loginAction={loginAction}
              />
            }
          />
          <Route path="kontakt" element={<Contact setPage={setPage} />} />
          <Route
            path="edycja"
            element={
              <Edit
                setPage={setPage}
                user={userEmail}
                userPerms={userPerms}
                loginAction={loginAction}
                reload={shouldRefresh}
                setReload={setShouldRefresh}
              />
            }
          />
          <Route
            path="archiwum-numerkow"
            element={
              <NumbersArchive
                setPage={setPage}
                reload={shouldRefresh}
                setReload={setShouldRefresh}
                collectionInfo={collectionInfo.luckyNumbers ?? { numDocs: 0 }}
              />
            }
          />
          <Route path="*" element={<ShortLinkRedirect setPage={setPage} />} />
          {/* <Route path="*" element={<NotFound setPage={setPage} />} /> */}
        </Route>
      </Routes>
    </AuthProvider>
  );
}

const Layout = ({
  page,
  userInfo,
  loginAction,
  logoutAction,
  footerVisible,
  screenWidth,
}) => (
  <main className="min-h-screen">
    <div
      className="-z-50 -left-12  -top-0 scale-[.4] md:scale-[.5] lg:scale-[.575] xl:scale-[.65] xl:-left-0 xl:-top-[1rem] origin-top-left absolute"
      style={{
        width: "30em",
        height: "100vh",
        background: "linear-gradient(-150deg,#FF9900,#FFC300)",
        clipPath:
          "path('M-254.73708-719.90154c101.2235-39.31238,245.38935,6.30359,353.14951,93.87061,108.439,88.27,181.105,217.8829,239.28706,362.83841,57.55027,145.56758,99.30695,306.38681,30.68232,379.45324C299.0773,188.62426,118.75881,173.843-27.84143,242.02288c-227.45885,105.78438-227.49889,198.49679-388.40643,233.736-207.39228,45.42249-521.8526-67.31778-592.75068-312.25552-57.279-197.88783,63.84638-414.93994,203.92341-509.51865,108.751-73.42822,164.462-29.50921,294.71133-120.23791,154.41672-107.5614,139.04581-208.376,255.62672-253.64832')",
      }}
    />
    <div
      className={`
  -z-50 right-0 
  ${page === "contact" ? "md:max-h-[100vh] " : "md:max-h-[100vh]"} 
  ${
    page === "home"
      ? "-top-[16.5rem] scale-[.275]"
      : "-top-[16.5rem] scale-[.275]"
  } 
  ${
    page === "home"
      ? "max-h-[100rem] md:max-h-[175vh] md:scale-[.475]"
      : "md:scale-[.7] md:-top-[18rem] md:-rotate-[30deg]"
  } 
  ${
    page === "home"
      ? "lg:scale-[.8] lg:max-h-[175vh] lg:rotate-[2.45deg] lg:-top-[11rem] lg:-right-12"
      : "lg:scale-[.8] lg:-rotate-[30deg] lg:-top-[24rem] lg:right-16 lg:max-h-[70rem] "
  }
  ${
    page === "home"
      ? "xl:-rotate xl:max-h-[175vh] -[1.5deg] xl:-top-[17.5rem] xl:-right-16 xl:scale-[1.05]"
      : "xl:-rotate-[30deg] xl:-top-[42rem] xl:scale-[1.1] xl:right-32 lg:max-h-[70rem] "
  }  
  origin-top-right absolute
`}
      style={{
        width: "33em",
        height: "175vh",
        background: "linear-gradient(-140deg,#FF9900,#FFC300)",
        clipPath:
          "path('M3.06834,441.14016C-4.9308,332.85221,80.8371,208.33,196.07717,130.88529,312.18791,52.99694,457.37432,21.40331,612.99757,8.14541,769.0214-4.3294,935.01226,2.75728,984.8191,89.74084c48.93589,87.42814-17.91579,255.53594,4.42167,415.65489,34.65721,248.4337,123.30154,275.577,109.95678,439.74689-17.19719,211.598-216.93908,479.33975-471.88772,475.5269-205.9757-3.0806-378.11958-182.363-427.608-343.962-38.42159-125.46014,19.86327-165.89369-28.81671-316.96933C113.17431,580.63135,12.27678,565.856,3.06834,441.14016')",
      }}
    />
    <CookiesAlert />
    <NavBar
      page={page}
      userInfo={userInfo}
      loginAction={loginAction}
      logoutAction={logoutAction}
      screenWidth={screenWidth}
    />
    <div className="h-14 md:h-[4.5rem]" />
    <Outlet />
    <ScrollToTop />
    <LoginScreen screenWidth={screenWidth} />
    <Footer isVisible={footerVisible} />
  </main>
);
