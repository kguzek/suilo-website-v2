import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import React, { useEffect } from "react";

export const API_URL = // "http://localhost:5001/suilo-page/europe-west1/app/api"; // Temporary emulator API URL assignment
  "https://europe-west1-suilo-page.cloudfunctions.net/app/api";

// CONFIDENTIAL DATA
const firebaseConfig = {
  apiKey: "AIzaSyAhY-V5DxLWPmn0kaaAYvk4xrn5iWxbL74",
  authDomain: "suilo-page.firebaseapp.com",
  projectId: "suilo-page",
  storageBucket: "suilo-page.appspot.com",
  messagingSenderId: "1034278542267",
  appId: "1:1034278542267:web:7ec35972c9202d0e2b429e",
  measurementId: "G-ZGW5B626SY",
};

// setup Google Auth provider
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
auth.useDeviceLanguage();
provider.setCustomParameters({ prompt: "select_account" });

export const AuthContext = React.createContext();

// initialise container for API requests to be made when the user token is determined
const _fetchStack = [];
let userLoaded = false;

/** Iterates through the fetch stack backwards and executes each callback function, removing it from the array. */
function _executeFetchStack(token) {
  for (let i = _fetchStack.length; i > 0; i--) {
    // console.log(`Executing fetch stack item ${i}.`);

    // remove last item -- we don't need the item index for this
    // the pop method returns the deleted object so we can call it once it's removed from the array
    _fetchStack.pop()(token);
  }
}

/** Performs a 'fetch' with the auth header set to the user's API token. */
export function fetchWithToken(relativeURL, method = "get") {
  function then(resolve, reject) {
    /** Performs the fetch request with the provided success and failure handlers. */
    function _fetch(token) {
      // console.log(`Fetching '/api${relativeURL}'...`);
      fetch(API_URL + relativeURL, {
        method,
        headers: new Headers({
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        }),
      }).then(resolve, reject);
    }
    if (userLoaded) {
      if (auth.currentUser) {
        auth.currentUser.getIdToken().then(_fetch);
      } else {
        _fetch();
      }
      console.log(`Sending request to '/api${relativeURL}'.`);
    } else {
      // add the request to the stack to be called once the user token is determined
      console.log(
        `Adding request to '/api${relativeURL}' to the fetch stack...`
      );
      _fetchStack.push(_fetch);
    }
  }
  return { then };
}

export function AuthProvider({ children, setUserCallback }) {
  useEffect(() => {
    // wait until the auth state has updated to assign the user token
    userLoaded = false;

    // this triggers every time the logging state triggers
    onAuthStateChanged(auth, (user) => {
      userLoaded = true;
      // setUserCallback returns a boolean indicating if the user is from our school or not.
      if (setUserCallback(user)) {
        // execute any requests in the stack that were attempted before we got the user reference
        if (_fetchStack.length === 0) {
          // Skip if there are no pending fetches in the stack
          return;
        }
        if (user) {
          console.log(
            `Executing the fetch stack as ${user.displayName} <${user.email}>.`
          );
          user.getIdToken().then(_executeFetchStack);
        } else {
          console.log("Executing the fetch stack anonymously.");
          _executeFetchStack();
        }
      } else {
        // The user is from outside the LO1 organisation.
        logOut().then();
      }
    });
  }, []);
  return (
    <AuthContext.Provider value={{ currentUser: auth.currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function signInWithGoogle() {
  userLoaded = false;
  signInWithRedirect(auth, provider);
  // TODO: Possibly implement popup sign in for desktop users instead?
  // signInWithPopup(auth, provider);
}

/** Gets the most recent login redirect results and finally calls the callback function.
 * If the login was unsuccessful, calls the callback with an additional error message.
 */
export function getResults(processLoginCallback) {
  getRedirectResult(auth)
    .then((result) => {
      if (!result) {
        // no result from redirection -- user cancelled operation or other error
        return processLoginCallback("Przerwano proces logowania");
      }
      const user = result.user;
      if (!user.email.endsWith("lo1.gliwice.pl")) {
        return processLoginCallback(
          `Konto z adresem '${user.email}' nie należy do domeny @lo1.gliwice.pl`
        );
      }
      // call the callback with no error message
      processLoginCallback();
    })
    .catch((error) => {
      // an error can be thrown when the login session has expired; user has to log in again.
      console.log("An error occured while retrieving login results.", error);
      return processLoginCallback("Nastąpił błąd przy logowaniu");
    });
}

export async function logOut() {
  signOut(auth)
    .then(() => {
      console.log("Successfully signed out from Google provider.");
    })
    .catch((error) => {
      // no error handling as possible errors are currently unknown
      console.log("An error occured while logging out.", error);
    });
}
