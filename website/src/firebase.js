import {getAuth,signInWithPopup, signInWithRedirect,getRedirectResult,GoogleAuthProvider,signOut} from "firebase/auth";
import { initializeApp } from 'firebase/app';
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
    const credential = GoogleAuthProvider.credentialFromResult(result);
    //return user information and token
    callback(credential, result.user);
    }).catch((error) => {
    
        callback(undefined,undefined);
        console.log(error);   
  });     
};
//I have totaly no idea why this returns an error but I don't think it matters atm
export const logOut = async (succes)=>{
    signOut(auth).then(()=>{
        return true
    }).catch((error)=>{
        console.log(error);
        return false;
    })


}