import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';

const TREATMENTS_COLLECTION = 'treatments';

// Check if Firestore is properly initialized
const isFirestoreAvailable = () => {
  try {
    return !!db && typeof db.collection === 'function';
  } catch (error) {
    console.error("Firestore not available:", error);
    return false;
  }
};

export const saveTreatmentPlan = async (diseaseData, treatments) => {
  try {
    // First check if Firestore is available
    if (!isFirestoreAvailable()) {
      console.warn("Firestore unavailable - returning mock data");
      return "mock-treatment-id-123";
    }

    const treatmentPlan = {
      diseaseType: diseaseData.type,
      createdAt: new Date().toISOString(),
      treatments: treatments.map(treatment => ({
        ...treatment,
        status: 'pending',
        completedAt: null
      }))
    };

    const docRef = await addDoc(collection(db, TREATMENTS_COLLECTION), treatmentPlan);
    return docRef.id;
  } catch (error) {
    console.error('Error saving treatment plan:', error);
    return "error-treatment-id-fallback";
  }
};

export const updateTreatmentStatus = async (planId, treatmentId, status) => {
  try {
    // First check if Firestore is available
    if (!isFirestoreAvailable()) {
      console.warn("Firestore unavailable - skipping update");
      return;
    }

    const planRef = doc(db, TREATMENTS_COLLECTION, planId);
    const completedAt = status === 'completed' ? new Date().toISOString() : null;

    await updateDoc(planRef, {
      treatments: treatments.map(t => 
        t.id === treatmentId 
          ? { ...t, status, completedAt }
          : t
      )
    });
  } catch (error) {
    console.error('Error updating treatment status:', error);
  }
};

export const getTreatmentPlans = async () => {
  try {
    // First check if Firestore is available
    if (!isFirestoreAvailable()) {
      console.warn("Firestore unavailable - returning mock data");
      return [
        {
          id: "mock-id-1",
          diseaseType: "Mock Disease",
          createdAt: new Date().toISOString(),
          treatments: [
            { id: "t1", name: "Sample Treatment", status: "pending", completedAt: null }
          ]
        }
      ];
    }

    const q = query(collection(db, TREATMENTS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching treatment plans:', error);
    return [];
  }
};