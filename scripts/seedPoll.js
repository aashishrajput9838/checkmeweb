const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyBRVgI34DVch-YyFho6kJHsQxOW-EsaE04",
    authDomain: "checkme-28877.firebaseapp.com",
    projectId: "checkme-28877",
    storageBucket: "checkme-28877.firebasestorage.app",
    messagingSenderId: "37260546974",
    appId: "1:37260546974:web:5434d9da8ca13e554fbc8f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  const polls = [
    {
      id: 'sunday_brunch',
      question: "Sunday Brunch Special (10:00 AM - 12:00 PM)",
      options: [
        { name: "Alu Paratha & Chole", votes: 0 },
        { name: "South Indian Platter (Idli/Dosa)", votes: 0 },
        { name: "Cheese Sandwiches & Cold Coffee", votes: 0 }
      ]
    },
    {
      id: 'sunday_snacks',
      question: "Sunday Evening Snacks (4:00 PM - 5:00 PM)",
      options: [
        { name: "Samosa & Jalebi", votes: 0 },
        { name: "Vada Pav & Chai", votes: 0 },
        { name: "Spring Rolls & Soup", votes: 0 }
      ]
    },
    {
      id: 'sunday_dinner',
      question: "Sunday Grand Dinner (8:00 PM - 10:00 PM)",
      options: [
        { name: "Butter Chicken / Shahi Paneer", votes: 0 },
        { name: "Mutton Biryani / Veg Biryani", votes: 0 },
        { name: "Gajar ka Halwa & Puri Sabzi", votes: 0 }
      ]
    }
  ];

  for (const poll of polls) {
    await setDoc(doc(db, 'food_polls', poll.id), {
      ...poll,
      voters: [],
      createdAt: new Date().toISOString()
    });
  }
  
  console.log("Sunday Poll Timings corrected to match official mess timing sheet!");
}

seed().catch(console.error);
