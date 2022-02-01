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

// setup google auth provider
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
auth.useDeviceLanguage();
provider.setCustomParameters({ prompt: "select_account" });

export const AuthContext = React.createContext();

export function AuthProvider({ children, setUserCallback }) {
  useEffect(() => {
    // this triggers every time the logging state triggers
    onAuthStateChanged(auth, setUserCallback);
  }, []);
  return (
    <AuthContext.Provider value={{ currentUser: auth.currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function signInWithGoogle(callback) {
  signInWithRedirect(auth, provider);
  // signInWithPopup(auth, provider);
}

/** Gets the most recent login redirect results.
 * If the login was successful, calls the callback with the user's API token and the number of seconds it will expire in.
 * Otherwise, calls the callback with a null token and an error message.
 */
export function getResults(processLoginCallback) {
  getRedirectResult(auth)
    .then((result) => {
      if (!result) {
        // no result from redirection -- user cancelled operation or other error
        return processLoginCallback(null, "Przerwano proces logowania");
      }
      const user = result.user;
      if (!user.email.endsWith("lo1.gliwice.pl")) {
        return processLoginCallback(
          null,
          `Konto z adresem '${user.email}' nie należy do domeny @lo1.gliwice.pl`
        );
      }
      // METHOD 1 (not recommended, found this out myself but it uses dodgy properties)
      // const tokenResponse = result._tokenResponse;
      // const token = tokenResponse.oauthIdToken;
      // const expiresIn = tokenResponse.oauthExpireIn;

      // METHOD 2 (recommended by Google, found in official documentation - gets the same token as method 1)
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential.idToken;

      const expiresIn = 3600; // seconds
      processLoginCallback(idToken, expiresIn);

      // METHOD 3 (testing/in development - gets a slightly different token so it doesn't authorise in backend atm)
      // auth.currentUser.getIdToken().then((token) => {
      //   console.log("Token on login A:", idToken);
      //   console.log("Token on login B:", token);
      //   processLoginCallback(token, expiresIn);
      // });
    })
    .catch((error) => {
      // an error can be thrown when the login session has expired; user has to log in again.
      console.log("An error occured while retrieving login results.", error);
      return processLoginCallback(null, "Nastąpił błąd przy logowaniu");
    });
}

export async function logOut(success) {
  signOut(auth)
    .then(() => {})
    .catch((error) => {
      console.log("An error occured while logging out.", error); // there is no error handling since I don't yet know what errors can occur
    });
}
