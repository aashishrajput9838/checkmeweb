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

async function seedStudents() {
  const students = [
    { email: 'aashish.kumar@ug.sharda.ac.in', name: 'Aashish Kumar', room: 'B-201' },
    { email: 'rahul.dev@ug.sharda.ac.in', name: 'Rahul Dev', room: 'B-202' },
    { email: 'priya.sharma@ug.sharda.ac.in', name: 'Priya Sharma', room: 'C-101' },
    { email: 'zoya.khan@ug.sharda.ac.in', name: 'Zoya Khan', room: 'C-102' }
  ];

  for (const s of students) {
    await setDoc(doc(db, 'users', s.email), {
      ...s,
      role: 'student',
      enrolledAt: new Date().toISOString()
    });
  }
  
  console.log("Students seeded successfully!");
}

seedStudents().catch(console.error);
