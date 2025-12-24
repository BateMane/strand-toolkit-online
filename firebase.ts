// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, addDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDm4_2p786nh3mccpk8sl-8EDsKQKi94Po",
    authDomain: "strand-toolkit.firebaseapp.com",
    projectId: "strand-toolkit",
    storageBucket: "strand-toolkit.firebasestorage.app",
    messagingSenderId: "156174949614",
    appId: "1:156174949614:web:c141965287eb5ea35b27ff",
    measurementId: "G-JL88VY5Z5Z"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// On exporte les outils pour les utiliser ailleurs
export { db, collection, doc, setDoc, addDoc, onSnapshot, query, orderBy, limit };