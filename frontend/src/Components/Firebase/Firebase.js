

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBdjDO8MD0MUYBHD0XM5GJkqzF04eZwtjk",
  authDomain: "embracespectrum.firebaseapp.com",
  projectId: "embracespectrum",
  storageBucket: "embracespectrum.firebasestorage.app",
  messagingSenderId: "751219307677",
  appId: "1:751219307677:web:7b1e75f0379d6470f39074",
  measurementId: "G-XR7NJMLGTP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth=getAuth(app);
export {app,auth};