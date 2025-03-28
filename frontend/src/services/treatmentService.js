// This is a local storage implementation replacing Firebase
const TREATMENTS_STORAGE_KEY = 'treatments';

// Helper functions for local storage
const getTreatmentsFromStorage = () => {
  try {
    const treatments = localStorage.getItem(TREATMENTS_STORAGE_KEY);
    return treatments ? JSON.parse(treatments) : [];
  } catch (error) {
    console.error('Error reading treatments from localStorage', error);
    return [];
  }
};

const saveTreatmentsToStorage = (treatments) => {
  try {
    localStorage.setItem(TREATMENTS_STORAGE_KEY, JSON.stringify(treatments));
  } catch (error) {
    console.error('Error saving treatments to localStorage', error);
  }
};

export const saveTreatmentPlan = async (diseaseData, treatments) => {
  try {
    const allTreatments = getTreatmentsFromStorage();
    
    const treatmentPlan = {
      id: 'treatment-' + Date.now(),
      diseaseType: diseaseData.type,
      createdAt: new Date().toISOString(),
      treatments: treatments.map((treatment, index) => ({
        ...treatment,
        id: `treatment-item-${Date.now()}-${index}`,
        status: 'pending',
        completedAt: null
      }))
    };

    allTreatments.push(treatmentPlan);
    saveTreatmentsToStorage(allTreatments);
    return treatmentPlan.id;
  } catch (error) {
    console.error('Error saving treatment plan:', error);
    throw new Error('Failed to save treatment plan');
  }
};

export const updateTreatmentStatus = async (planId, treatmentId, status) => {
  try {
    const plans = getTreatmentsFromStorage();
    const planIndex = plans.findIndex(plan => plan.id === planId);
    
    if (planIndex !== -1) {
      const plan = plans[planIndex];
      const completedAt = status === 'completed' ? new Date().toISOString() : null;
      
      const updatedTreatments = plan.treatments.map(t => 
        t.id === treatmentId 
          ? { ...t, status, completedAt }
          : t
      );
      
      plans[planIndex] = {
        ...plan,
        treatments: updatedTreatments
      };
      
      saveTreatmentsToStorage(plans);
    }
  } catch (error) {
    console.error('Error updating treatment status:', error);
    throw new Error('Failed to update treatment status');
  }
};

export const getTreatmentPlans = async () => {
  try {
    return getTreatmentsFromStorage();
  } catch (error) {
    console.error('Error fetching treatment plans:', error);
    throw new Error('Failed to fetch treatment plans');
  }
};