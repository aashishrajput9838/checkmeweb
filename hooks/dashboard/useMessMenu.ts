import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { onSnapshot, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { messService } from '@/lib/services/messService';

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function useMessMenu() {
    const { toast } = useToast();
    const [todaysMenu, setTodaysMenu] = useState({ breakfast: [], lunch: [], snacks: [], dinner: [] });
    const [weeklyMenu, setWeeklyMenu] = useState<any>(null);
    const [timings, setTimings] = useState<any>(null);
    const [loadingMenu, setLoadingMenu] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        const todayName = daysOfWeek[new Date().getDay()];

        // Fetch local fallback
        fetch('/api/mess/data')
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setTimings(data.timing);
                    setWeeklyMenu((prev: any) => prev || data.menu);
                    setTodaysMenu(data.menu[todayName] || { breakfast: [], lunch: [], snacks: [] });
                }
            })
            .catch(console.error);

        // Firebase listeners
        const unsubMenu = onSnapshot(doc(db, 'mess_menu', 'weekly'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data && Object.keys(data).length > 2) {
                    setWeeklyMenu(data);
                    if (data[todayName]) setTodaysMenu(data[todayName]);
                }
            }
            setLoadingMenu(false);
        });

        const unsubscribePdf = onSnapshot(doc(db, 'mess_menu', 'pdfContent'), (docSnap) => {
            if (docSnap.exists() && docSnap.data().url) setPdfUrl(docSnap.data().url);
        });

        const todayDate = new Date().toISOString().split('T')[0];
        const unsubOverride = onSnapshot(doc(db, 'daily_overrides', todayDate), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setTodaysMenu({
                    breakfast: data.breakfast ? data.breakfast.split(',').map((i:any)=>i.trim()) : [],
                    lunch: data.lunch ? data.lunch.split(',').map((i:any)=>i.trim()) : [],
                    snacks: data.snacks ? data.snacks.split(',').map((i:any)=>i.trim()) : [],
                    dinner: data.dinner ? data.dinner.split(',').map((i:any)=>i.trim()) : [],
                });
            }
        });

        return () => {
            unsubMenu();
            unsubscribePdf();
            unsubOverride();
        };
    }, []);

    const getActiveMeal = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 10) return { meal: 'breakfast', status: 'Live Breakfast', items: todaysMenu.breakfast };
        if (hour >= 12 && hour < 15) return { meal: 'lunch', status: 'Live Lunch', items: todaysMenu.lunch };
        if (hour >= 17 && hour < 19) return { meal: 'snacks', status: 'Evening Snacks', items: todaysMenu.snacks };
        if (hour >= 19 && hour < 22) return { meal: 'dinner', status: 'Live Dinner', items: todaysMenu.dinner };
        return null;
    };

    return { todaysMenu, weeklyMenu, timings, loadingMenu, pdfUrl, activeMealInfo: getActiveMeal() };
}
