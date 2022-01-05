import {getAuth,signInWithPopup, signInWithRedirect,getRedirectResult,GoogleAuthProvider,signOut,onAuthStateChanged} from "firebase/auth";
import { initializeApp } from 'firebase/app';
import React, { useEffect, useState } from "react";



export const AuthContext = React.createContext();

export const AuthProvider = ({ children, callback }) => {
    const [currentUser, setCurrentUser] = useState();
    useEffect(() => { //this trigers every time the logging state triggers
        onAuthStateChanged(auth, user => {
            if(user !== null){ // user is set to null if no account was logged in
                callback(user.accessToken,user.email); 
            }
            else {
                callback(null,null);
            }
            setCurrentUser(user);
        })
    }, []);
    return (
        <AuthContext.Provider value={{ currentUser }}>
            {children}
        </AuthContext.Provider>
    )
}
//this data is confidencial
const firebaseConfig = {
    apiKey: "AIzaSyAhY-V5DxLWPmn0kaaAYvk4xrn5iWxbL74",
    authDomain: "suilo-page.firebaseapp.com",
    projectId: "suilo-page",
    storageBucket: "suilo-page.appspot.com",
    messagingSenderId: "1034278542267",
    appId: "1:1034278542267:web:7ec35972c9202d0e2b429e",
    measurementId: "G-ZGW5B626SY"
  };
//setup google auth provider
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); 
provider.setCustomParameters({ prompt: 'select_account' });
export const signInWithGoogle = (callback) => {
    signInWithRedirect(auth, provider)
    
};
export const getResults = (callback)=>{
    getRedirectResult(auth)
  .then((result) => {
      //no need to check the results here since the onAuthStateChanged will get it 
    }).catch((error) => {
        console.log("an error acured Getting results:") // there is no error handeling since I dont yet know what erros can occur
        console.log(error);   
  });     
};
export const logOut = async (succes)=>{
    signOut(auth).then(() => {
      }).catch((error) => {
        console.log("an error acured logging out:") // there is no error handeling since I dont yet know what erros can occur
        console.log(error);  
       
      });


}