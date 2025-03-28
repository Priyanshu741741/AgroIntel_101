// Firebase fallback/compatibility script
// This script provides mock implementations if Firebase fails to load

(function() {
  // Check if Firebase is already loaded
  if (window.firebase) return;

  console.warn('Firebase SDK not loaded - using mock implementation');

  // Create a mock Firebase implementation for fallback
  window.firebase = {
    apps: [],
    initializeApp: function() {
      console.log('Mock Firebase initializeApp called');
      return {};
    },
    auth: function() {
      return {
        onAuthStateChanged: function(callback) {
          console.log('Mock onAuthStateChanged called');
          callback(null);
          return function() {};
        },
        signInWithEmailAndPassword: function() {
          console.log('Mock signInWithEmailAndPassword called');
          return Promise.resolve({});
        },
        createUserWithEmailAndPassword: function() {
          console.log('Mock createUserWithEmailAndPassword called');
          return Promise.resolve({});
        }
      };
    },
    firestore: function() {
      return {
        collection: function() {
          return {
            add: function() {
              return Promise.resolve({
                id: 'mock-id-' + Math.random().toString(36).substring(2, 9)
              });
            },
            get: function() {
              return Promise.resolve({
                docs: []
              });
            }
          };
        }
      };
    }
  };
  
  console.log('Firebase compatibility layer loaded');
})(); 