import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDklPnZ6xjLuYrtORPPGVXlNeccS0Fz8nI",
  authDomain: "connect-chat-16853.firebaseapp.com",
  projectId: "connect-chat-16853",
  storageBucket: "connect-chat-16853.appspot.com",
  messagingSenderId: "43921106187",
  appId: "1:43921106187:web:480922c44efb5b22dbae0e"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();