// This is a mock implementation replacing Firebase auth
// Store user in localStorage for persistence
const MOCK_AUTH_USER = 'mockAuthUser';

// Mock authentication functions
export const registerUser = async (email, password) => {
  try {
    const user = { uid: 'mock-uid-' + Date.now(), email, displayName: email.split('@')[0] };
    localStorage.setItem(MOCK_AUTH_USER, JSON.stringify(user));
    return user;
  } catch (error) {
    throw new Error('Registration failed');
  }
};

export const loginUser = async (email, password) => {
  try {
    // For simplicity, we'll just create a user if they don't exist
    const user = { uid: 'mock-uid-' + Date.now(), email, displayName: email.split('@')[0] };
    localStorage.setItem(MOCK_AUTH_USER, JSON.stringify(user));
    return user;
  } catch (error) {
    throw new Error('Login failed');
  }
};

export const signInWithGoogle = async () => {
  try {
    const user = { 
      uid: 'google-mock-uid-' + Date.now(), 
      email: 'google-user@example.com', 
      displayName: 'Google User' 
    };
    localStorage.setItem(MOCK_AUTH_USER, JSON.stringify(user));
    return user;
  } catch (error) {
    throw new Error('Google sign-in failed');
  }
};

export const logoutUser = async () => {
  try {
    localStorage.removeItem(MOCK_AUTH_USER);
  } catch (error) {
    throw new Error('Logout failed');
  }
};

export const resetPassword = async (email) => {
  try {
    console.log(`Password reset email sent to ${email}`);
    // In a real implementation, this would send an email
    return true;
  } catch (error) {
    throw new Error('Password reset failed');
  }
};

export const onAuthStateChange = (callback) => {
  // Initial call with current state
  const currentUser = getCurrentUser();
  setTimeout(() => callback(currentUser), 0);
  
  // This would normally add a listener, but for our mock we'll just return a no-op function
  return () => {};
};

// Helper function to get current user
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(MOCK_AUTH_USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};