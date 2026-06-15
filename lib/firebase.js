import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDcTyu4A7jDpQDUbixSaiKYCulWALi_axo",
  authDomain: "connect-chat-c9cf1.firebaseapp.com",
  projectId: "connect-chat-c9cf1",
  storageBucket: "connect-chat-c9cf1.firebasestorage.app",
  messagingSenderId: "1030066151336",
  appId: "1:1030066151336:web:39a7a35a9c550302cb479d"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();