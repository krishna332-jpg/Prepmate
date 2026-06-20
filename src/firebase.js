import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsYFxJ4dJM07mFtX4PEQKSB3otVnj-vhw",
  authDomain: "prepmate-d7109.firebaseapp.com",
  projectId: "prepmate-d7109",
  storageBucket: "prepmate-d7109.firebasestorage.app",
  messagingSenderId: "508877586212",
  appId: "1:508877586212:web:80106a759a1aa3c4e4fdb1",
  measurementId: "G-KWXQXW36M8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);
