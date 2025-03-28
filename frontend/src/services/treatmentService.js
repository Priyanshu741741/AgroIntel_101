import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';

const TREATMENTS_COLLECTION = 'treatments';

export const saveTreatmentPlan = async (diseaseData, treatments) => {
  try {
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
    throw error;
  }
};

export const updateTreatmentStatus = async (planId, treatmentId, status) => {
  try {
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
    throw error;
  }
};

export const getTreatmentPlans = async () => {
  try {
    const q = query(collection(db, TREATMENTS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching treatment plans:', error);
    throw error;
  }
};