'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { AnalyticsChart } from '@/components/modules/AnalyticsChart';
import { FoodPoll } from '@/components/modules/FoodPoll';
import { AttendanceMarker } from '@/components/modules/AttendanceMarker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ChartBar, Vote, CalendarCheck, Megaphone, Send, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { setDoc, doc } from 'firebase/firestore';

export default function WardenDashboard() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'attendance';
  const [loading, setLoading] = useState(true);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [foodAnalyticsData, setFoodAnalyticsData] = useState<any[]>([]);
  const [notice, setNotice] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const { toast } = useToast();

  const postNotice = async () => {
    if (!notice.trim()) return;
    setIsBroadcasting(true);
    try {
        await setDoc(doc(db, 'notices', 'latest'), {
            message: notice,
            postedBy: 'Warden',
            timestamp: new Date().toISOString(),
            scope: 'global'
        });
        toast({ title: 'Notice Broadcasted!', description: 'All students will see this on their dashboard.' });
        setNotice('');
    } catch (error) {
        toast({ title: 'Broadcast Failed', variant: 'destructive' });
    } finally {
        setIsBroadcasting(false);
    }
  };

  useEffect(() => {
    // Analytics Listener
    const unsubscribeAnalytics = onSnapshot(query(collection(db, 'food_analytics')), (snap) => {
        const stats = snap.docs.map(doc => ({
            dish: doc.data().dish,
            likes: doc.data().likes || 0,
            dislikes: doc.data().dislikes || 0
        }));
        setFoodAnalyticsData(stats);
        setLoading(false);
    });

    return () => unsubscribeAnalytics();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['warden', 'admin']}>
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-2xl text-white">
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase">Warden Control Panel</h1>
                <p className="text-zinc-400 text-sm italic">Monitoring student welfare and mess performance</p>
            </div>
            <div className="flex gap-3">
                <div className="bg-blue-600/20 border border-blue-500/30 px-4 py-2 rounded-xl text-center">
                    <p className="text-[10px] uppercase font-bold text-blue-400">Status</p>
                    <p className="text-sm font-black">ACTIVE</p>
                </div>
            </div>
        </div>

        {currentTab === 'attendance' && (
            <Card className="border-zinc-200 overflow-hidden shadow-sm">
                <CardHeader className="bg-zinc-50 border-b pb-4">
                    <div className="flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg font-bold uppercase tracking-tight">Daily Attendance Manager</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <AttendanceMarker />
                </CardContent>
            </Card>
        )}

        {currentTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="lg:col-span-2">
                    <Card className="h-full border-zinc-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-zinc-50 border-b pb-4">
                            <div className="flex items-center gap-2">
                                <ChartBar className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg font-bold uppercase tracking-tight">Food Quality Metrics</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <AnalyticsChart data={foodAnalyticsData} className="h-[450px]" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-600 rounded-lg text-white">
                                <ChartBar className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-blue-900 uppercase">Insights Guide</h3>
                        </div>
                        <p className="text-sm text-blue-800 leading-relaxed space-y-4">
                            <span>• This chart shows the real-time student satisfaction for the meals served today.</span><br/><br/>
                            <span>• Use these metrics to discuss food quality improvements with the mess committee.</span><br/><br/>
                            <span className="font-bold block mt-4 text-xs italic">NOTE: Data is anonymized to encourage honest student feedback.</span>
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* Integrated Notice Board Section */}
        <div className="mt-8 pt-8 border-t border-zinc-200">
            <div className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-600 rounded-xl">
                            <Megaphone className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Hostel Notice Board</h2>
                            <p className="text-zinc-400 text-sm italic">Direct broadcast to all student dashboards</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 max-w-2xl">
                        <Textarea 
                            placeholder="Type an important announcement (e.g., Water supply update, Mess timing change...)"
                            className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-blue-500 h-32 rounded-2xl"
                            value={notice}
                            onChange={(e) => setNotice(e.target.value)}
                        />
                        <Button 
                            onClick={postNotice}
                            disabled={isBroadcasting}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20"
                        >
                            {isBroadcasting ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                            {isBroadcasting ? 'Broadcasting...' : 'Broadcast to All Students'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </ProtectedRoute>
  );
}