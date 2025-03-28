// This is a local storage implementation replacing Firebase
// Local storage keys
const CROPS_STORAGE_KEY = 'crops';
const USERS_STORAGE_KEY = 'users';

// Helper functions for local storage
const getItemsFromStorage = (key) => {
  try {
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return [];
  }
};

const saveItemsToStorage = (key, items) => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
  }
};

// Add a new crop entry
export const addCrop = async (cropData) => {
  try {
    const crops = getItemsFromStorage(CROPS_STORAGE_KEY);
    const newCrop = {
      id: 'crop-' + Date.now(),
      ...cropData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    crops.push(newCrop);
    saveItemsToStorage(CROPS_STORAGE_KEY, crops);
    return newCrop.id;
  } catch (error) {
    throw new Error('Failed to add crop');
  }
};

// Get a specific crop by ID
export const getCrop = async (cropId) => {
  try {
    const crops = getItemsFromStorage(CROPS_STORAGE_KEY);
    return crops.find(crop => crop.id === cropId) || null;
  } catch (error) {
    throw new Error('Failed to get crop');
  }
};

// Get all crops for a specific user
export const getUserCrops = async (userId) => {
  try {
    const crops = getItemsFromStorage(CROPS_STORAGE_KEY);
    return crops.filter(crop => crop.userId === userId);
  } catch (error) {
    throw new Error('Failed to get user crops');
  }
};

// Update a crop entry
export const updateCrop = async (cropId, updateData) => {
  try {
    const crops = getItemsFromStorage(CROPS_STORAGE_KEY);
    const index = crops.findIndex(crop => crop.id === cropId);
    
    if (index !== -1) {
      crops[index] = {
        ...crops[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      saveItemsToStorage(CROPS_STORAGE_KEY, crops);
    }
  } catch (error) {
    throw new Error('Failed to update crop');
  }
};

// Delete a crop entry
export const deleteCrop = async (cropId) => {
  try {
    const crops = getItemsFromStorage(CROPS_STORAGE_KEY);
    const updatedCrops = crops.filter(crop => crop.id !== cropId);
    saveItemsToStorage(CROPS_STORAGE_KEY, updatedCrops);
  } catch (error) {
    throw new Error('Failed to delete crop');
  }
};

// Save user profile data
export const saveUserProfile = async (userId, profileData) => {
  try {
    const users = getItemsFromStorage(USERS_STORAGE_KEY);
    const index = users.findIndex(user => user.id === userId);
    
    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...profileData,
        updatedAt: new Date().toISOString()
      };
    } else {
      users.push({
        id: userId,
        ...profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    saveItemsToStorage(USERS_STORAGE_KEY, users);
  } catch (error) {
    throw new Error('Failed to save user profile');
  }
};

// Get user profile data
export const getUserProfile = async (userId) => {
  try {
    const users = getItemsFromStorage(USERS_STORAGE_KEY);
    return users.find(user => user.id === userId) || null;
  } catch (error) {
    throw new Error('Failed to get user profile');
  }
};