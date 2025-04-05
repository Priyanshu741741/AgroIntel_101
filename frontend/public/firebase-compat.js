// Firebase compatibility script
// This script provides mock implementations without requiring the real Firebase SDK

(() => {
  // Add a flag to indicate this is the compatibility layer
  window._usingMockFirebase = true;
  
  // Mock Firebase for sites that expect the global Firebase object
  window.firebase = {
    _isCompat: true,
    apps: [],
    // Mock methods
    initializeApp: () => {
      console.log('Mock Firebase initializeApp called');
      return {};
    },
    // Auth service
    auth: () => ({
      onAuthStateChanged: (callback) => {
        console.log('Mock onAuthStateChanged called');
        callback(null);
        return () => {};
      },
      signInWithEmailAndPassword: () => {
        console.log('Mock signInWithEmailAndPassword called');
        return Promise.resolve({});
      },
      createUserWithEmailAndPassword: () => {
        console.log('Mock createUserWithEmailAndPassword called');
        return Promise.resolve({});
      }
    }),
    // Firestore service
    firestore: () => ({
      collection: () => ({
        add: () => Promise.resolve({ id: `mock-id-${Math.random().toString(36).slice(2, 9)}` }),
        get: () => Promise.resolve({ docs: [] })
      })
    }),
    // Database service
    database: () => ({
      ref: () => ({
        set: () => Promise.resolve(),
        update: () => Promise.resolve(),
        remove: () => Promise.resolve(),
        once: () => Promise.resolve({ val: () => null })
      })
    }),
    // Storage service
    storage: () => ({
      ref: () => ({
        put: () => Promise.resolve({
          ref: { getDownloadURL: () => Promise.resolve('https://mock-url.com/file.jpg') }
        })
      })
    }),
    // Other services
    functions: () => ({ httpsCallable: () => () => Promise.resolve({ data: {} }) }),
    messaging: () => ({ getToken: () => Promise.resolve('mock-token'), onMessage: () => {} }),
    analytics: () => ({ logEvent: () => {} }),
    performance: () => ({ trace: () => ({ start: () => {}, stop: () => {} }) }),
    remoteConfig: () => ({ fetchAndActivate: () => Promise.resolve(true), getValue: () => ({ asString: () => '' }) })
  };
  
  console.log('Firebase compatibility layer loaded (mock implementation)');
})(); 