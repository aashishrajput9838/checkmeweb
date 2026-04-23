import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

export const surveyController = {
  async getActiveSurvey() {
    const surveyRef = query(collection(db, 'monthly_surveys'), where('status', '==', 'active'));
    const snap = await getDocs(surveyRef);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  async createSurvey(monthId: string, monthName: string, slots: any) {
    const surveyRef = doc(db, 'monthly_surveys', monthId);
    await setDoc(surveyRef, {
      monthId,
      monthName,
      status: 'active',
      slots,
      createdAt: serverTimestamp()
    });
    return { success: true, id: monthId };
  },

  async castVote(monthId: string, userId: string, selections: any) {
    const voteRef = doc(db, 'monthly_surveys', monthId, 'votes', userId);
    
    // Check if already voted
    const existing = await getDoc(voteRef);
    if (existing.exists()) {
      throw new Error('You have already submitted your monthy vote.');
    }

    await setDoc(voteRef, {
      userId,
      selections,
      timestamp: serverTimestamp()
    });

    return { success: true };
  },

  async generateMenuFromResults(monthId: string) {
    const surveyRef = doc(db, 'monthly_surveys', monthId);
    const surveySnap = await getDoc(surveyRef);
    if (!surveySnap.exists()) throw new Error('Survey not found');
    
    const surveyData = surveySnap.data();
    const votesRef = collection(db, 'monthly_surveys', monthId, 'votes');
    const votesSnap = await getDocs(votesRef);

    if (votesSnap.empty) {
        console.error("Menu Gen Error: No votes found for survey", monthId);
        throw new Error('No votes found to generate menu');
    }

    console.log(`Processing ${votesSnap.size} votes for survey: ${monthId}`);

    // Tally selections
    const tallies: any = {}; // { "monday-breakfast": { "Option A": 10, "Option B": 5 } }

    votesSnap.forEach(voteDoc => {
      const selections = voteDoc.data().selections;
      Object.entries(selections).forEach(([slotId, choice]) => {
        if (!tallies[slotId]) tallies[slotId] = {};
        const choiceStr = choice as string;
        tallies[slotId][choiceStr] = (tallies[slotId][choiceStr] || 0) + 1;
      });
    });

    // Determine winners for each day and meal
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const finalMenu: any = {};

    days.forEach(day => {
      finalMenu[day] = {};
      meals.forEach(meal => {
        const slotId = `${day}-${meal}`;
        const slotTallies = tallies[slotId] || {};
        
        // Find option with max votes
        let winner = '';
        let maxVotes = -1;
        
        // Use the defined options from the survey as baseline
        const options = surveyData.slots?.[day]?.[meal] || [];
        options.forEach((opt: string) => {
          const v = slotTallies[opt] || 0;
          if (v > maxVotes) {
            maxVotes = v;
            winner = opt;
          }
        });

        // Fallback to first option if no votes
        finalMenu[day][meal] = winner ? [winner] : (options[0] ? [options[0]] : []);
      });
    });

    // Archive in History
    const historyRef = doc(db, 'menu_history', monthId);
    await setDoc(historyRef, {
      ...finalMenu,
      monthId,
      generatedAt: serverTimestamp(),
      type: 'monthly_generation'
    });

    // Update the main weekly menu (Use setDoc to ensure it works even if doc doesn't exist)
    const menuRef = doc(db, 'mess_menu', 'weekly');
    await setDoc(menuRef, {
      ...finalMenu,
      lastGeneratedFrom: monthId,
      updatedAt: serverTimestamp(),
      isLatest: true
    });

    // Update survey status
    await updateDoc(surveyRef, { status: 'generated', generatedAt: serverTimestamp() });

    console.log("Menu successfully generated and published!");
    return { success: true, finalMenu };
  }
};
