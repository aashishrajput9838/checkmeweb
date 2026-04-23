import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

export const pollController = {
  async getCurrentPoll() {
    const pollRef = doc(db, 'food_polls', 'current_poll');
    const pollSnap = await getDoc(pollRef);
    if (!pollSnap.exists()) return null;
    return { id: pollSnap.id, ...pollSnap.data() };
  },

  async castVote(userId: string, optionName: string) {
    const pollRef = doc(db, 'food_polls', 'current_poll');
    const pollSnap = await getDoc(pollRef);

    if (!pollSnap.exists()) throw new Error('Poll not found');
    const pollData = pollSnap.data();

    if (pollData.voters?.includes(userId)) {
      throw new Error('You have already voted');
    }

    const updatedOptions = pollData.options.map((opt: any) => {
      if (opt.name === optionName) {
        return { ...opt, votes: (opt.votes || 0) + 1 };
      }
      return opt;
    });

    await updateDoc(pollRef, {
      options: updatedOptions,
      voters: arrayUnion(userId)
    });

    return { success: true };
  }
};
