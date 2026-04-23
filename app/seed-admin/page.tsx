'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SeedAdminPage() {
  const [status, setStatus] = useState('Idle');

  const createAdmin = async () => {
    setStatus('Creating admin account...');
    try {
      await createUserWithEmailAndPassword(auth, 'admin@checkme.com', '123456');
      setStatus('Successfully created admin@checkme.com account!');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
          setStatus('Admin account already exists in Firebase!');
      } else {
          setStatus(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Register Admin</h1>
      <p className="mb-4 text-zinc-600">This script creates the admin@checkme.com user in Firebase Authentication.</p>
      <button 
        onClick={createAdmin}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mb-4"
      >
        Create Admin Account
      </button>
      <div className="mt-4 p-4 border rounded bg-zinc-50">
        <p className="font-semibold">Status: <span className="font-normal text-blue-600">{status}</span></p>
      </div>
    </div>
  );
}
