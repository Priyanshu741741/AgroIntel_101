// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getMessaging } from 'firebase/messaging';
import { getPerformance } from 'firebase/performance';
import { getRemoteConfig } from 'firebase/remote-config';

// Firebase configuration - Simplified version without real API keys
// This configuration uses a completely mocked Firebase implementation

// Create mock implementations
const createMockFirebase = () => {
  console.log("Using mock Firebase implementation");
  
  // Mock auth
  const auth = { 
    onAuthStateChanged: (callback) => {
      // Simulate no user being logged in
      setTimeout(() => callback(null), 100);
      return () => {};
    },
    signInWithEmailAndPassword: () => Promise.resolve({ user: { uid: 'mock-user-id' } }),
    createUserWithEmailAndPassword: () => Promise.resolve({ user: { uid: 'mock-user-id' } }),
    signOut: () => Promise.resolve()
  };
  
  // Mock firestore
  const db = { 
    collection: () => ({
      addDoc: () => Promise.resolve({ id: 'mock-doc-id' }),
      getDocs: () => Promise.resolve({ docs: [] }),
      doc: (id) => ({
        get: () => Promise.resolve({ exists: false, data: () => null }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve()
      })
    })
  };
  
  // Mock storage
  const storage = {
    ref: () => ({
      put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('https://mock-url.com/file.jpg') } }),
      getDownloadURL: () => Promise.resolve('https://mock-url.com/file.jpg')
    })
  };
  
  // Mock database
  const database = {
    ref: () => ({
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      remove: () => Promise.resolve(),
      once: () => Promise.resolve({ val: () => null })
    })
  };
  
  // Other Firebase services
  const functions = {
    httpsCallable: () => () => Promise.resolve({ data: {} })
  };
  
  const analytics = {
    logEvent: () => {}
  };
  
  const messaging = {
    getToken: () => Promise.resolve('mock-token'),
    onMessage: () => {}
  };
  
  const performance = {
    trace: () => ({
      start: () => {},
      stop: () => {}
    })
  };
  
  const remoteConfig = {
    fetchAndActivate: () => Promise.resolve(true),
    getValue: () => ({ asString: () => '' })
  };

  // Mock app
  const app = { 
    name: 'mock-app',
    options: {
      apiKey: "mock-api-key",
      authDomain: "mock-project.firebaseapp.com",
      projectId: "mock-project",
      storageBucket: "mock-project.appspot.com"
    }
  };
  
  return {
    app, 
    auth, 
    db, 
    storage, 
    database, 
    functions, 
    analytics, 
    messaging, 
    performance, 
    remoteConfig
  };
};

// Create and export Firebase instances
const {
  app, 
  auth, 
  db, 
  storage, 
  database, 
  functions, 
  analytics, 
  messaging, 
  performance, 
  remoteConfig
} = createMockFirebase();

export { 
  app, 
  auth, 
  db, 
  storage, 
  database, 
  functions, 
  analytics, 
  messaging, 
  performance, 
  remoteConfig 
}; 