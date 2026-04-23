import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User } from "firebase/auth";

export const userService = {
    async registerStudent(user: User) {
        if (!user.email || !user.email.endsWith('@ug.sharda.ac.in')) return;

        const userRef = doc(db, 'users', user.email);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                role: 'student',
                room: 'Not Assigned',
                enrolledAt: new Date().toISOString()
            });
            console.log("Auto-registered new student:", user.email);
        }
    },

    async checkIsRepresentative(email: string): Promise<boolean> {
        const userDoc = await getDoc(doc(db, 'users', email));
        return userDoc.exists() && userDoc.data()?.role === 'representative';
    }
};
