import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use

const firebaseConfig = {
  apiKey: "AIzaSyBdjDO8MD0MUYBHD0XM5GJkqzF04eZwtjk",
  authDomain: "embracespectrum.firebaseapp.com",
  projectId: "embracespectrum",
  storageBucket: "embracespectrum.firebasestorage.app",
  messagingSenderId: "751219307677",
  appId: "1:751219307677:web:7b1e75f0379d6470f39074",
  measurementId: "G-XR7NJMLGTP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth=getAuth(app);
export {app,auth};