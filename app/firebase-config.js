import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4Nm8b2k8SABu5j0bAl1bMe-zQDSgqfKY",
  authDomain: "cleannami-ceenami.firebaseapp.com",
  projectId: "cleannami-ceenami",
  storageBucket: "cleannami-ceenami.firebasestorage.app",
  messagingSenderId: "275480982890",
  appId: "1:275480982890:web:5039475e4b373f169f2113",
  measurementId: "G-07ZL0P26WT",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
