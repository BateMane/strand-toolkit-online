// public/firebase-init.js
// On utilise les liens WEB car ce fichier ne passe pas par la "moulinette" de compilation
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, addDoc, onSnapshot, deleteDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDm4_2p786nh3mccpk8sl-8EDsKQKi94Po",
    authDomain: "strand-toolkit.firebaseapp.com",
    projectId: "strand-toolkit",
    storageBucket: "strand-toolkit.firebasestorage.app",
    messagingSenderId: "156174949614",
    appId: "1:156174949614:web:c141965287eb5ea35b27ff",
    measurementId: "G-JL88VY5Z5Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, query, orderBy, limit };