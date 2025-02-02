import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA_8rcq0TKrVCHIkNTUmCrxBdSSIN9iHmo",
  authDomain: "greensync-585d3.firebaseapp.com",
  projectId: "greensync-585d3",
  storageBucket: "greensync-585d3.firebasestorage.app",
  messagingSenderId: "33117405198",
  appId: "1:33117405198:web:fd87816b87bd1e5d62fc5f",
  measurementId: "G-QVWLGCMN4G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Authentication functions
export const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);

// Function to check if a user is authenticated
export const checkAuthStatus = (callback) => {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
