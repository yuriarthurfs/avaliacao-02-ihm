import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAo-U0txzHBgFoMsrqxfz0kcPiXxPesVVY",
  authDomain: "ihm-lovisi.firebaseapp.com",
  projectId: "ihm-lovisi",
  storageBucket: "ihm-lovisi.firebasestorage.app",
  messagingSenderId: "538160665538",
  appId: "1:538160665538:web:a7cae91c2b5a5b5960fc5b",
};

//VITE_FIREBASE_API_KEY="AIzaSyAo-U0txzHBgFoMsrqxfz0kcPiXxPesVVY"
//VITE_FIREBASE_AUTH_DOMAIN="ihm-lovisi.firebaseapp.com"
//VITE_FIREBASE_PROJECT_ID="ihm-lovisi"
//VITE_FIREBASE_STORAGE_BUCKET="ihm-lovisi.firebasestorage.app"
//VITE_FIREBASE_MESSAGING_SENDER_ID="538160665538"
//VITE_FIREBASE_APP_ID="1:538160665538:web:a7cae91c2b5a5b5960fc5b"

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;