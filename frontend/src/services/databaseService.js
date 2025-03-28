import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

// Collection names
const CROPS_COLLECTION = 'crops';
const USERS_COLLECTION = 'users';

// Add a new crop entry
export const addCrop = async (cropData) => {
  try {
    const docRef = await addDoc(collection(db, CROPS_COLLECTION), {
      ...cropData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Get a specific crop by ID
export const getCrop = async (cropId) => {
  try {
    const docRef = doc(db, CROPS_COLLECTION, cropId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Get all crops for a specific user
export const getUserCrops = async (userId) => {
  try {
    const q = query(collection(db, CROPS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Update a crop entry
export const updateCrop = async (cropId, updateData) => {
  try {
    const docRef = doc(db, CROPS_COLLECTION, cropId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    throw error;
  }
};

// Delete a crop entry
export const deleteCrop = async (cropId) => {
  try {
    const docRef = doc(db, CROPS_COLLECTION, cropId);
    await deleteDoc(docRef);
  } catch (error) {
    throw error;
  }
};

// Save user profile data
export const saveUserProfile = async (userId, profileData) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      ...profileData,
      updatedAt: new Date()
    });
  } catch (error) {
    throw error;
  }
};

// Get user profile data
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};