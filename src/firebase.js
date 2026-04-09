import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMiY9dNt-EcpVwuPgsinpl4b5gPXDuQkY",
  authDomain: "tribunal-gaming-jose-9f530.firebaseapp.com",
  projectId: "tribunal-gaming-jose-9f530",
  storageBucket: "tribunal-gaming-jose-9f530.firebasestorage.app",
  messagingSenderId: "814515741828",
  appId: "1:814515741828:web:52ba2516fd192f59868ed1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
