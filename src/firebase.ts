// FICHIER: src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDm4_2p786nh3mccpk8sl-8EDsKQKi94Po",
  authDomain: "strand-toolkit.firebaseapp.com",
  projectId: "strand-toolkit",
  storageBucket: "strand-toolkit.firebasestorage.app",
  messagingSenderId: "156174949614",
  appId: "1:156174949614:web:c141965287eb5ea35b27ff",
  measurementId: "G-JL88VY5Z5Z"
};

// 1. On initialise l'application
const app = initializeApp(firebaseConfig);

// 2. On initialise Firestore
// IMPORTANT : C'est cet export que App.tsx attend !
export const db = getFirestore(app);