'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const weeklyMenu = {
  monday: {
    breakfast: ['Corn Flakes', 'Milk', 'Bread Butter/Jam', 'Fruit', 'Tea'],
    lunch: ['Kali Masoor Dal', 'Aloo Bhujiya', 'Roti', 'Rice', 'Boondi Raita', 'Salad', 'Achar'],
    snacks: ['Chowmein', 'Sauce', 'Tea'],
    dinner: ['Chana Dal', 'Louki Chana (Dry)', 'Ghee Roti', 'Jeera Rice', 'Boondi Ladoo (2 Pcs)', 'Salad', 'Achar']
  },
  tuesday: {
    breakfast: ['Aloo Pyaz Paratha', 'Dahi', 'Sauce', 'Fruit', 'Tea'],
    lunch: ['Rajmah', 'Shimla Aloo', 'Roti', 'Rice', 'Veg Raita', 'Salad', 'Achar'],
    snacks: ['Mix Pakora', 'Sauce', 'Coffee'],
    dinner: ['Dhaba Dal', 'Kala Chana Aloo', 'Ghee Roti', 'Rice', 'Suji Halwa', 'Salad', 'Achar']
  },
  wednesday: {
    breakfast: ['Milk Dalia', 'Poha', 'Fruit', 'Tea'],
    lunch: ['Chana Dal', 'Besan Gutta', 'Roti', 'Rice', 'Salad', 'Achar', 'Jeera Raita'],
    snacks: ['Aloo Tikki Chat (2 Pcs)', 'Tea'],
    dinner: ['Jeera Rice', 'Chhole', 'Aloo Gobhi', 'Puri/Roti', 'Kheer', 'Salad', 'Achar']
  },
  thursday: {
    breakfast: ['Puri', 'Jalebi', 'Aloo Tamatar', 'Milk', 'Fruit', 'Tea'],
    lunch: ['Kadi Pakoda', 'Aloo Matar/Jeera Aloo', 'Rice', 'Roti', 'Salad', 'Achar'],
    snacks: ['Burger (1Pcs)', 'Sauce', 'Tea'],
    dinner: ['Paneer Do Pyaza', 'Moong Dal', 'Rice', 'Ghee Roti', 'Salad', 'Achar']
  },
  friday: {
    breakfast: ['Bread', 'Boiled Egg (2 Pcs) / Bread Butter Jam', 'Elalaichi Milk', 'Fruit', 'Tea'],
    lunch: ['Lal Masoor Dal', 'Aloo Hari Payaz', 'Rice', 'Roti', 'Boondi Raita', 'Salad', 'Achar'],
    snacks: ['Samosa (2Pcs.)', 'Sauce', 'Tea'],
    dinner: ['Mix Veg', 'Mix Dal', 'Jeera Rice', 'Ghee Roti', 'Sewai', 'Salad', 'Achar']
  },
  saturday: {
    breakfast: ['Mix Paratha', 'Dahi', 'Sauce', 'Achar', 'Fruit', 'Tea'],
    lunch: ['Khichdi', 'Aloo Matar', 'Roti', 'Veg Raita', 'Fryums/Papad', 'Achar'],
    snacks: ['Poha', 'Sauce', 'Tea'],
    dinner: ['Mix Dal', 'Veg Kofta', 'Ghee Roti', 'Rice', 'Gajar Halwa / Moong Dal Halwa', 'Salad', 'Achar']
  },
  sunday: {
    breakfast: ['Chhole Bhature', 'Fruit', 'Dahi', 'Tea', 'Salad', 'Achar'],
    lunch: ['Veg. Biryani', 'Tamatar Chatni', 'Salad', 'Achar'],
    snacks: ['Aloo Sandwich', 'Sauce', 'Coffee'],
    dinner: ['Kadhai Paneer / Egg Kari', 'Chana Daal', 'Rice', 'Ghee Roti', 'Gulab Jamun(2 Pcs)', 'Salad', 'Achar']
  }
};

export default function SeedPage() {
  const [status, setStatus] = useState('Idle');

  const seedDatabase = async () => {
    setStatus('Seeding...');
    try {
      await setDoc(doc(db, 'menus', 'weekly'), weeklyMenu);
      setStatus('Successfully seeded database!');
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Seed Database</h1>
      <button 
        onClick={seedDatabase}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Seed Weekly Menu
      </button>
      <p>Status: {status}</p>
    </div>
  );
}
