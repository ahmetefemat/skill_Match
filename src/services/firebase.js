import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";          
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyD3RKbcXdOvTOUHLOHvhk6NIgvZ0J7MrYc",
  authDomain: "skill-match-a711a.firebaseapp.com",
  projectId: "skill-match-a711a",
  storageBucket: "skill-match-a711a.firebasestorage.app",
  messagingSenderId: "522981493364",
  appId: "1:522981493364:web:a0f9bc45fd685d154cdf21",
  measurementId: "G-WS316FZFM5"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);