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

async function seedInventory() {
  const items = [
    { name: 'Rice', stock: 5, threshold: 5, unit: 'KG' },
    { name: 'Chicken', stock: 12, threshold: 5, unit: 'KG' },
    { name: 'Vegetables', stock: 8, threshold: 5, unit: 'KG' },
    { name: 'Milk', stock: 3, threshold: 5, unit: 'Ltr' },
    { name: 'Bread', stock: 2, threshold: 5, unit: 'Pkts' }
  ];

  for (const item of items) {
    await setDoc(doc(db, 'inventory', item.name.toLowerCase()), {
      ...item,
      updatedAt: new Date().toISOString()
    });
  }
  
  console.log("Cloud Inventory with UNITS seeded successfully!");
}

seedInventory().catch(console.error);
