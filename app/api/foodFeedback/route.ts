import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { dishName, type, userId } = await request.json(); // type: 'like' | 'dislike'
    
    if (!dishName || !type || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const dishId = dishName.toLowerCase().replace(/\s+/g, '_');
    const dishRef = doc(db, 'food_analytics', dishId);
    
    // Track unique feedback per user per day to prevent spam
    const today = new Date().toISOString().split('T')[0];
    const feedbackTrackRef = doc(db, 'feedback_tracking', `${userId}_${dishId}_${today}`);
    const trackSnap = await getDoc(feedbackTrackRef);

    if (trackSnap.exists()) {
        return NextResponse.json({ error: 'Already submitted feedback for this today' }, { status: 400 });
    }

    const dishSnap = await getDoc(dishRef);
    if (!dishSnap.exists()) {
        await setDoc(dishRef, {
            dish: dishName,
            likes: type === 'like' ? 1 : 0,
            dislikes: type === 'dislike' ? 1 : 0,
            updatedAt: new Date().toISOString()
        });
    } else {
        await updateDoc(dishRef, {
            [type === 'like' ? 'likes' : 'dislikes']: increment(1),
            updatedAt: new Date().toISOString()
        });
    }

    // Record tracking
    await setDoc(feedbackTrackRef, {
        userId,
        timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
