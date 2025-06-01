// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSl8hnjXH1QBS4xesSExHapeMEjjsXwk8",
  authDomain: "auth-af656.firebaseapp.com",
  projectId: "auth-af656",
  storageBucket: "auth-af656.firebasestorage.app",
  messagingSenderId: "899717429919",
  appId: "1:899717429919:web:37d67ddf9e70a8c9e400aa",
  measurementId: "G-TBLYXSDHQX"
};




// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Initialize the Google Auth Provider
const provider = new GoogleAuthProvider();


export {signInWithPopup, auth, provider, signOut};
