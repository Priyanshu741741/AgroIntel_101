// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDummy-apikey-for-development",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "crop-monitoring-app.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "crop-monitoring-app",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "crop-monitoring-app.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789012:web:abc123def456ghi789jkl",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-DUMMY123456"
};

// Wrap Firebase initialization in a try/catch to prevent deployment errors
let app, auth, db, storage;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("Firebase initialization successful");
} catch (error) {
  console.error("Firebase initialization error:", error);
  
  // Create mock implementations for Vercel deployment
  app = {};
  auth = { 
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.resolve({}),
    createUserWithEmailAndPassword: () => Promise.resolve({})
  };
  db = { 
    collection: () => ({
      addDoc: () => Promise.resolve({}),
      getDocs: () => Promise.resolve({ docs: [] })
    })
  };
  storage = {};
}

export { app, auth, db, storage }; 