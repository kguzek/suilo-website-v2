import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import React, { useEffect } from 'react';

/** Enables various logger statements. */
export const DEBUG_MODE = false;

/** Determines the API URL. */
const USE_EMULATOR_API = false;

/** The root URL for the Firebase backend API. */
export const API_URL = USE_EMULATOR_API
  ? 'http://localhost:5001/suilo-page/europe-west1/app/api' // Temporary emulator API URL assignment
  : 'https://europe-west1-suilo-page.cloudfunctions.net/app/api'; // Production cloud function

/** If true, logs the logged in user's API token in the console whenever a request to the API is made. */
const DISPLAY_TOKEN_ON_REQUEST = false;

// CONFIDENTIAL DATA
const firebaseConfig = {
  apiKey: 'AIzaSyAhY-V5DxLWPmn0kaaAYvk4xrn5iWxbL74',
  authDomain: 'suilo-page.firebaseapp.com',
  projectId: 'suilo-page',
  storageBucket: 'suilo-page.appspot.com',
  messagingSenderId: '1034278542267',
  appId: '1:1034278542267:web:7ec35972c9202d0e2b429e',
  measurementId: 'G-ZGW5B626SY',
};

// setup Google Auth provider
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
auth.useDeviceLanguage();
provider.setCustomParameters({ prompt: 'select_account' });

const AuthContext = React.createContext();

// initialise container for API requests to be made when the user token is determined
const _fetchStack = [];
let userLoaded = false;

/** Iterates through the fetch stack backwards and executes each callback function, removing it from the array. */
function _executeFetchStack(token) {
  while (_fetchStack.length > 0) {
    // the pop method returns the deleted function object so we can call it once it's removed from the array
    _fetchStack.pop()(token);
  }
}

/** Performs a 'fetch' with the auth header set to the user's API token. */
export function fetchWithToken(relativeURL, method = 'GET', params, body) {
  // Ensure the relative URL starts with a leading forward slash
  if (!relativeURL.startsWith('/')) {
    relativeURL = '/' + relativeURL;
  }
  function then(resolve, reject) {
    /** Performs the fetch request with the provided success and failure handlers. */
    function _fetch(token) {
      DISPLAY_TOKEN_ON_REQUEST && console.info(token);
      let url = API_URL + relativeURL;
      const searchParams = new URLSearchParams(params).toString();
      // Append the URL search parameters
      if (searchParams) {
        url += '?' + searchParams;
      }
      const args = {
        method,
        headers: new Headers({
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        }),
      };
      if (body) {
        args.body = JSON.stringify(body);
        DEBUG_MODE && console.debug('Request body:', body);
      }
      console.info(`Sending ${method} request to '/api${relativeURL}'.`);
      fetch(url, args).then(resolve, reject);
    }
    if (userLoaded) {
      if (auth.currentUser) {
        auth.currentUser.getIdToken().then(_fetch);
      } else {
        _fetch();
      }
    } else {
      // add the request to the stack to be called once the user token is determined
      DEBUG_MODE && console.debug(`Adding request to '/api${relativeURL}' to the fetch stack...`);
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
          DEBUG_MODE &&
            console.debug(`Executing the fetch stack as ${user.displayName} <${user.email}>.`);
          user.getIdToken().then(_executeFetchStack);
        } else {
          DEBUG_MODE && console.debug('Executing the fetch stack anonymously.');
          _executeFetchStack();
        }
      } else {
        // The user is from outside the LO1 organisation.
        logOut();
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser: auth.currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function signInWithGoogle(usePopup, callback) {
  userLoaded = false;
  if (usePopup) {
    getResults(signInWithPopup(auth, provider), callback);
  } else {
    signInWithRedirect(auth, provider);
  }
}

export function getMobileSignInResult(callback) {
  getResults(getRedirectResult(auth), callback);
}

/** Gets the most recent login redirect results and finally calls the callback function.
 * If the login was unsuccessful, calls the callback with an additional error message.
 */
function getResults(getResult, processLoginCallback) {
  getResult
    .then((result) => {
      if (!result) {
        // no result from redirection -- user cancelled operation or other error
        return processLoginCallback('Przerwano proces logowania');
      }
      const user = result.user;
      if (!user.email.endsWith('lo1.gliwice.pl')) {
        return processLoginCallback(
          `Konto z adresem '${user.email}' nie należy do domeny @lo1.gliwice.pl`
        );
      }
      // call the callback with no error message
      processLoginCallback();
    })
    .catch((error) => {
      // an error can be thrown when the login session has expired; user has to log in again.
      console.error('An error occured while retrieving login results.', error);
      return processLoginCallback('Nastąpił błąd przy logowaniu');
    });
}

export function logOut() {
  signOut(auth)
    .then(() => {
      DEBUG_MODE && console.debug('Successfully signed out from Google provider.');
    })
    .catch((error) => {
      // no error handling as possible errors are currently unknown
      console.error('An error occured while logging out.', error);
    });
}
