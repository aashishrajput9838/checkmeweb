import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

async function seed() {
  const pollRef = doc(db, 'food_polls', 'current_poll');
  await setDoc(pollRef, {
    question: "Vote for Sunday Special",
    options: [
      { name: "Biryani", votes: 0 },
      { name: "Fried Rice", votes: 0 },
      { name: "Pasta", votes: 0 }
    ],
    voters: [],
    createdAt: new Date().toISOString()
  });
  console.log("Poll seeded successfully!");
}

seed().catch(console.error);
