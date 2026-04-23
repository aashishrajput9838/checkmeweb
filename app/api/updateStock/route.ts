import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { name, change } = await request.json();
    
    if (!name || typeof change !== 'number') {
      return NextResponse.json({ error: 'Missing name or change amount' }, { status: 400 });
    }

    const itemRef = doc(db, 'inventory', name.toLowerCase());
    const docSnap = await getDoc(itemRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const currentStock = docSnap.data().stock || 0;
    
    // Prevent stock below 0
    if (currentStock + change < 0) {
        return NextResponse.json({ error: 'Stock cannot be less than 0' }, { status: 400 });
    }

    await updateDoc(itemRef, {
      stock: increment(change),
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await getDoc(itemRef);
    return NextResponse.json(updatedDoc.data());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
