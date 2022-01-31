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
import React, { useEffect, useState } from "react";

export const AuthContext = React.createContext();

export function AuthProvider({ children, callback }) {
  const [currentUser, setCurrentUser] = useState();
  useEffect(() => {
    // this trigers every time the logging state triggers
    onAuthStateChanged(auth, (user) => {
      if (user !== null) {
        // user is set to null if no account was logged in
        callback(user.accessToken, user.email);
      } else {
        callback(null, null);
      }
      setCurrentUser(user);
    });
  }, []);
  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

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
provider.setCustomParameters({ prompt: "select_account" });

export function signInWithGoogle(callback) {
  // signInWithRedirect(auth, provider);
  signInWithPopup(auth, provider);
}

export function getResults(callback) {
  getRedirectResult(auth)
    .then((result) => {
      // no need to check the results here since the onAuthStateChanged will get it
    })
    .catch((error) => {
      console.log("An error occured while getting results:"); // there is no error handling since I don't yet know what errors can occur
      console.log(error);
    });
}

export async function logOut(success) {
  signOut(auth)
    .then(() => {})
    .catch((error) => {
      console.log("An error occured while logging out:"); // there is no error handling since I don't yet know what errors can occur
      console.log(error);
    });
}
