import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, where } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { userService } from '@/lib/services/userService';

export function useStudentData(user: User | null) {
    const [attendanceData, setAttendanceData] = useState<{ date: string; status: 'Present' | 'Absent' }[]>([]);
    const [latestNotice, setLatestNotice] = useState<any>(null);
    const [isRep, setIsRep] = useState(false);

    useEffect(() => {
        if (!user) return;

        // 1. Auto-Register
        userService.registerStudent(user);

        // 2. Representative Check
        userService.checkIsRepresentative(user.email!).then(setIsRep);

        // 3. Notice Listener
        const unsubNotice = onSnapshot(doc(db, 'notices', 'latest'), (snap) => {
            if (snap.exists()) setLatestNotice(snap.data());
        });

        // 4. Attendance Listener
        const q = query(
            collection(db, 'users', user.email!, 'attendance_history'),
            orderBy('date', 'desc'),
            limit(10)
        );
        const unsubAttendance = onSnapshot(q, (snap) => {
            const records = snap.docs.map(d => ({
                date: d.data().date,
                status: d.data().status
            } as { date: string; status: 'Present' | 'Absent' }));
            setAttendanceData(records);
        });

        return () => {
            unsubNotice();
            unsubAttendance();
        };
    }, [user]);

    return { attendanceData, latestNotice, isRep };
}
