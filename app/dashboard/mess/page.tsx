'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { setDoc, deleteDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Utensils, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsChart } from '@/components/modules/AnalyticsChart';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { InventoryCard } from '@/components/modules/InventoryCard';
import { FoodPoll } from '@/components/modules/FoodPoll';
import { Vote, FileSpreadsheet } from 'lucide-react';
import { utils, writeFile } from 'xlsx';

const inventoryIcons: any = {
  rice: '🍚',
  chicken: '🍗',
  vegetables: '🥦',
  milk: '🥛',
  bread: '🍞'
};


const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function MessDashboard() {
  const { user } = useAuth();
  const { toast: notify } = useToast();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [loading, setLoading] = useState(true);
  const [formMenu, setFormMenu] = useState({
    breakfast: '',
    lunch: '',
    snacks: '',
    dinner: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [expectedDiners, setExpectedDiners] = useState<number | null>(null);
  const [foodAnalyticsData, setFoodAnalyticsData] = useState<any[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<any>(null);
  const [surveyStats, setSurveyStats] = useState<any[]>([]);
  const [isSurveyProcessing, setIsSurveyProcessing] = useState(false);
  const [surveyForm, setSurveyForm] = useState<any>({
    monthId: `${new Date().toISOString().slice(0, 7)}-${Date.now()}`,
    monthName: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    slots: {} 
  });
  const todayName = daysOfWeek[new Date().getDay()];

  const surveyDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const surveyMeals = ['breakfast', 'lunch', 'snacks', 'dinner'];

  // Initialize surveyForm slots
  useEffect(() => {
    const initialSlots: any = {};
    surveyDays.forEach(day => {
      initialSlots[day] = {};
      surveyMeals.forEach(meal => {
        initialSlots[day][meal] = ['', '']; // Two empty options
      });
    });
    setSurveyForm((prev: any) => ({ ...prev, slots: initialSlots }));
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let unsubs: any[] = [];

    const setupSubscriptions = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.email!));
            const role = userDoc.exists() ? userDoc.data()?.role : 'student';

            if (role === 'staff' || role === 'admin') {
                const unsubscribeMenu = onSnapshot(doc(db, 'mess_menu', 'weekly'), (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data && data[todayName]) {
                            const todays = data[todayName];
                            setFormMenu({
                                breakfast: todays.breakfast ? todays.breakfast.join(', ') : '',
                                lunch: todays.lunch ? todays.lunch.join(', ') : '',
                                snacks: todays.snacks ? todays.snacks.join(', ') : '',
                                dinner: todays.dinner ? todays.dinner.join(', ') : '',
                            });
                        }
                    }
                    
                    // Override with today's specific emergency menu if it exists
                    unsubs.push(onSnapshot(doc(db, 'daily_overrides', todayDate), (overrideSnap) => {
                        if (overrideSnap.exists()) {
                            const data = overrideSnap.data();
                            setFormMenu({
                                breakfast: data.breakfast || '',
                                lunch: data.lunch || '',
                                snacks: data.snacks || '',
                                dinner: data.dinner || '',
                            });
                        }
                    }));
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching menu:", error);
                    setLoading(false);
                });
                unsubs.push(unsubscribeMenu);

                unsubs.push(onSnapshot(doc(db, 'mess_menu', 'pdfContent'), (docSnap) => {
                    if (docSnap.exists() && docSnap.data().url) setPdfUrl(docSnap.data().url);
                }));

                unsubs.push(onSnapshot(query(collection(db, 'inventory')), (snap) => {
                    setInventoryList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }));

                unsubs.push(onSnapshot(query(collection(db, 'food_analytics')), (snap) => {
                    setFoodAnalyticsData(snap.docs.map(doc => ({
                        name: doc.id,
                        liked: doc.data().liked || 0,
                        disliked: doc.data().disliked || 0
                    })));
                }));

                unsubs.push(onSnapshot(query(collection(db, 'monthly_surveys'), where('status', 'in', ['active', 'ended'])), (snap) => {
                    if (!snap.empty) {
                        const survey = { id: snap.docs[0].id, ...snap.docs[0].data() };
                        setActiveSurvey(survey);
                        const votesRef = collection(db, 'monthly_surveys', survey.id, 'votes');
                        unsubs.push(onSnapshot(query(votesRef), (vSnap) => {
                            const tallies: any = {};
                            vSnap.forEach(doc => {
                                Object.entries(doc.data().selections).forEach(([slot, choice]) => {
                                    if (!tallies[slot]) tallies[slot] = {};
                                    tallies[slot][choice as string] = (tallies[slot][choice as string] || 0) + 1;
                                });
                            });
                            setSurveyStats(Object.entries(tallies).map(([slot, choices]: any) => {
                                const options = Object.keys(choices);
                                return {
                                    name: slot.split('-')[0].charAt(0).toUpperCase() + slot.split('-')[1].charAt(0),
                                    [options[0] || 'A']: choices[options[0]] || 0,
                                    [options[1] || 'B']: choices[options[1]] || 0,
                                };
                            }).slice(0, 7));
                        }));
                    } else {
                        setActiveSurvey(null);
                        setSurveyStats([]);
                    }
                }));
            }
        } catch (e) {
            console.error("Auth gate error:", e);
        }
    };

    setupSubscriptions();
    return () => unsubs.forEach(unsub => unsub());
  }, [user, todayName]);

  const handleSurveyOptionChange = (day: string, meal: string, index: number, value: string) => {
    setSurveyForm((prev: any) => {
        const newSlots = { ...prev.slots };
        newSlots[day][meal][index] = value;
        return { ...prev, slots: newSlots };
    });
  };

  const handleCreateSurvey = async () => {
    setIsSurveyProcessing(true);
    try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/survey', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(surveyForm)
        });
        if (!res.ok) throw new Error('Failed to create survey');
        notify({ title: 'Survey Launched!', description: 'Students can now vote for the next month.' });
    } catch (error: any) {
        notify({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
        setIsSurveyProcessing(false);
    }
  };

  const handleAutoFillSurvey = () => {
    const samples: any = {
      breakfast: [["Poha & Jalebi", "Idli Sambhar"], ["Sandwiches", "Alu Paratha"], ["Chole Bhature", "Bread Omelette"], ["Pancake", "Masala Dosa"], ["Upma", "Vada Pav"], ["Paneer Paratha", "Veg Cutlets"], ["Oats & Fruit", "Puri Bhaji"]],
      lunch: [["Rajma Chawal", "Kadhi Pakora"], ["Paneer Masala", "Mix Veg"], ["Dal Tadka", "Aloo Gobi"], ["Chicken Curry", "Veg Biryani"], ["Chole Kulche", "Veg Pulao"], ["Lobhia", "Arhar Dal"], ["Bhindi Masala", "White Chana"]],
      snacks: [["Samosa & Tea", "Spring Rolls"], ["Vada Pav", "Biscuits & Milk"], ["Kachori", "Pasta"], ["Maggi", "Veg Sandwich"], ["Dhokla", "Bhelpuri"], ["Pakora", "Muffins"], ["Corn Chat", "French Fries"]],
      dinner: [["Dal Makhani", "Shahi Paneer"], ["Chicken Butter", "Soya Chap"], ["Veg Kofta", "Kadhai Paneer"], ["Mix Dal", "Aloo Matar"], ["Butter Chicken", "Mushroom Masala"], ["Tinda Masala", "Yellow Dal"], ["Special Veg", "Egg Curry"]]
    };

    setSurveyForm((prev: any) => {
        const newSlots = { ...prev.slots };
        surveyDays.forEach((day, dayIdx) => {
            surveyMeals.forEach((meal) => {
                newSlots[day][meal] = samples[meal][dayIdx % 7];
            });
        });
        return { ...prev, slots: newSlots };
    });
    notify({ title: 'Magic Fill Complete!', description: 'The form has been populated with balanced options.' });
  };

  const handleGenerateFinalMenu = async () => {
    if (!activeSurvey) return;
    setIsSurveyProcessing(true);
    try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/survey/generate', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ monthId: activeSurvey.id })
        });
        if (!res.ok) throw new Error('Menu generation failed');
        notify({ title: 'Menu Generated!', description: 'The weekly schedule has been updated with winners.' });
    } catch (error: any) {
        notify({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
        setIsSurveyProcessing(false);
    }
  };

  const handleMenuUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      
      await setDoc(doc(db, 'daily_overrides', todayDate), {
        ...formMenu,
        isEmergency: true,
        updatedAt: new Date().toISOString()
      });
      
      notify({
        title: "Today's Menu Updated!",
        description: `Emergency override active for ${todayDate}. This will only affect today.`,
      });
    } catch (error) {
      console.error("Error updating menu:", error);
      notify({
        title: 'Error',
        description: 'Failed to update the menu. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to delete today\'s emergency menu and revert to the regular weekly menu?')) {
        return;
    }

    setIsUpdating(true);
    try {
        const todayDate = new Date().toISOString().split('T')[0];
        await deleteDoc(doc(db, 'daily_overrides', todayDate));
        
        notify({
            title: 'Menu Reset!',
            description: 'Today\'s emergency override has been removed. Reverting to weekly menu.',
        });
    } catch (error) {
        console.error("Error resetting menu:", error);
        notify({
            title: 'Reset Failed',
            description: 'Could not revert to weekly menu.',
            variant: 'destructive'
        });
    } finally {
        setIsUpdating(false);
    }
  };

  // Integrated Data: Fetch Attendance for Today to calculate expected diners
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const unsubStudents = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), (studentSnap) => {
        const totalStudents = studentSnap.size;
        
        const unsubAttendance = onSnapshot(doc(db, 'attendance', today), (attSnap) => {
            if (attSnap.exists()) {
                const records = attSnap.data().records || {};
                const absentCount = Object.values(records).filter(status => status === 'Absent').length;
                // If many aren't marked yet, we assume they are coming, but we subtract known absents.
                setExpectedDiners(totalStudents - absentCount);
            } else {
                setExpectedDiners(totalStudents);
            }
        });

        return () => unsubAttendance();
    });

    return () => unsubStudents();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormMenu(prev => ({ ...prev, [field]: value }));
  };

  const lowStockItems = inventoryList.filter(item => item.stock <= (item.threshold || 5));

  return (
    <ProtectedRoute allowedRoles={['staff', 'admin']}>
        <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mess Staff Dashboard</h1>
          <p className="text-muted-foreground">Manage menu and track food analytics</p>
        </div>

        {/* Inventory Alert */}
        {lowStockItems.length > 0 && (
          <div className="mb-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>Low Stock Alert:</strong> {lowStockItems.map(item => item.name).join(', ')} need restocking.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Official PDF Menu Notice */}
        {pdfUrl && (
          <div className="mb-6">
            <Alert className="border-blue-200 bg-blue-50 flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-700 font-medium">
                  An official PDF menu has been uploaded by the Mess Representative.
                </AlertDescription>
              </div>
              <Button 
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-100"
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                View PDF
              </Button>
            </Alert>
          </div>
        )}

        {/* Integrated Overview Metrics - Only show in Overview */}
        {currentTab === 'overview' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card className="border-2 border-zinc-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Inventory Health</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-black text-zinc-900">{inventoryList.length}</p>
                            <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Cloud-Synced Items</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-zinc-100 shadow-sm relative overflow-hidden bg-zinc-900 text-white">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-400"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Expected Diners (Live)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-black text-white">
                                {expectedDiners !== null ? expectedDiners : '--'}
                            </p>
                            <p className="text-[10px] text-green-400 mt-1 uppercase font-bold">Calculating vs Warden Absents</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-zinc-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sentiment Hub</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-black text-zinc-900">7.2 <span className="text-sm font-normal text-zinc-400">/ 10</span></p>
                            <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Real-time Student Feedback</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-6">
                    <Card className="p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle>Performance Analytics</CardTitle>
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest">Likes vs Dislikes</p>
                        </CardHeader>
                        <CardContent className="px-0">
                            <AnalyticsChart data={foodAnalyticsData} className="h-[500px]" />
                        </CardContent>
                    </Card>
                </div>
            </>
        )}

        {currentTab === 'menu' && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-2 border-yellow-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400"></div>
                    <CardHeader className="pt-8">
                        <div className="flex items-center gap-2">
                            <Utensils className="h-6 w-6 text-yellow-600" />
                            <CardTitle className="text-2xl font-black">Daily Menu Overwrite</CardTitle>
                        </div>
                        <p className="text-sm text-red-500 font-bold uppercase tracking-tight">⚠️ Affects today only: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <p className="text-yellow-600 animate-pulse">Loading menu...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleMenuUpdate}>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-zinc-500">Breakfast</label>
                                            <Textarea value={formMenu.breakfast} onChange={(e)=>handleInputChange('breakfast', e.target.value)} rows={3} className="border-zinc-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-zinc-500">Lunch</label>
                                            <Textarea value={formMenu.lunch} onChange={(e)=>handleInputChange('lunch', e.target.value)} rows={3} className="border-zinc-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-zinc-500">Snacks</label>
                                            <Textarea value={formMenu.snacks} onChange={(e)=>handleInputChange('snacks', e.target.value)} rows={3} className="border-zinc-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-zinc-500">Dinner</label>
                                            <Textarea value={formMenu.dinner} onChange={(e)=>handleInputChange('dinner', e.target.value)} rows={3} className="border-zinc-200" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 pt-4">
                                        <Button type="submit" disabled={isUpdating} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-12 rounded-xl">
                                            {isUpdating ? 'Publishing Changes...' : 'Push Live Menu Update'}
                                        </Button>
                                        <Button type="button" variant="ghost" onClick={handleReset} className="text-zinc-400 hover:text-red-500">
                                            Clear All Overrides & Use Weekly Menu
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        )}

        {currentTab === 'inventory' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-zinc-50 border-zinc-200">
                    <CardHeader className="pb-8 border-b bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-3xl font-black tracking-tight">Real-time Stock Management</CardTitle>
                                <p className="text-sm text-muted-foreground italic">Manage inventory levels instantly (Cloud Synced)</p>
                            </div>
                            <div className="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                                Live
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {inventoryList.length > 0 ? (
                                inventoryList.map((item) => (
                                    <InventoryCard key={item.id} item={{ ...item, icon: inventoryIcons[item.name.toLowerCase()] || '📦' }} />
                                ))
                            ) : (
                                <div className="col-span-full p-20 text-center text-zinc-400 border-2 border-dashed rounded-3xl">
                                    Syncing cloud inventory...
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}

        {currentTab === 'survey' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                {activeSurvey ? (
                    <Card className="border-none shadow-xl bg-zinc-900 text-white rounded-3xl overflow-hidden mb-8">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">{activeSurvey.monthName} Survey</h2>
                                    <p className="text-zinc-400 font-medium">Status: <span className="text-green-400 capitalize">{activeSurvey.status}</span></p>
                                </div>
                                <Button 
                                    onClick={handleGenerateFinalMenu}
                                    disabled={isSurveyProcessing}
                                    className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-6 py-6 rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                                >
                                    {isSurveyProcessing && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                                    Final Tally & Update Menu
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="bg-white/5 border-white/10 text-white p-4">
                                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Total Slots</p>
                                    <p className="text-2xl font-black">21 <span className="text-xs font-normal text-zinc-500">Meals</span></p>
                                </Card>
                                <Card className="bg-white/5 border-white/10 text-white p-4">
                                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Options per Slot</p>
                                    <p className="text-2xl font-black">2 <span className="text-xs font-normal text-zinc-500">Choices</span></p>
                                </Card>
                                <Card className="bg-white/5 border-white/10 text-white p-4">
                                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Vote Strategy</p>
                                    <p className="text-lg font-bold">Plurality Winner</p>
                                </Card>
                                <Card className="bg-white/5 border-white/10 text-white p-4">
                                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Auto-Publish</p>
                                    <p className="text-lg font-bold text-green-400">ENABLED</p>
                                </Card>
                            </div>

                            {surveyStats.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-6">Vote Distribution (Top Trending Slots)</h3>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={surveyStats}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                                                    itemStyle={{ color: '#fff', fontSize: '11px' }}
                                                />
                                                <Bar dataKey={Object.keys(surveyStats[0]).find(k => k !== 'name') || 'A'} fill="#eab308" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey={Object.keys(surveyStats[0]).filter(k => k !== 'name')[1] || 'B'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-yellow-500/10 p-4 border-t border-white/5 text-center">
                            <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest">
                                💡 Tip: Generation will search all student votes and pick the top favorite for each specific day/meal.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
                        <div className="bg-zinc-900 p-8 text-white flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Vote className="h-6 w-6 text-yellow-500" />
                                    <h3 className="text-2xl font-black tracking-tight">Create Monthly Food Survey</h3>
                                </div>
                                <p className="text-zinc-400 text-sm">Design the ballot for next month's menu selections.</p>
                            </div>
                            <Button 
                                onClick={handleAutoFillSurvey}
                                variant="outline"
                                className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black font-black uppercase text-[10px] tracking-[0.2em] px-6 h-10 rounded-xl transition-all"
                            >
                                ✨ Magic Auto-Fill
                            </Button>
                        </div>
                        
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-zinc-400 tracking-widest">Survey Month (ID)</label>
                                    <Input 
                                        placeholder="e.g., 2026-05" 
                                        value={surveyForm.monthId}
                                        onChange={(e)=>setSurveyForm({...surveyForm, monthId: e.target.value})}
                                        className="h-12 border-zinc-200 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-zinc-400 tracking-widest">Display Title</label>
                                    <Input 
                                        placeholder="e.g., May 2026 Special Menu Build" 
                                        value={surveyForm.monthName}
                                        onChange={(e)=>setSurveyForm({...surveyForm, monthName: e.target.value})}
                                        className="h-12 border-zinc-200 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-12">
                                {surveyDays.map(day => (
                                    <div key={day} className="border-b border-zinc-100 pb-10 last:border-0">
                                        <h4 className="text-xl font-black capitalize mb-6 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs">{day[0].toUpperCase()}</span>
                                            {day} Schedule
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                            {surveyMeals.map(meal => (
                                                <div key={meal} className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                                        <Utensils className="h-3 w-3" /> {meal}
                                                    </label>
                                                    <div className="space-y-2">
                                                        <Input 
                                                            placeholder="Choice A" 
                                                            className="text-xs border-zinc-200 h-9 bg-zinc-50 focus:bg-white transition-all shadow-sm"
                                                            value={surveyForm.slots[day]?.[meal]?.[0] || ''}
                                                            onChange={(e) => handleSurveyOptionChange(day, meal, 0, e.target.value)}
                                                        />
                                                        <Input 
                                                            placeholder="Choice B" 
                                                            className="text-xs border-zinc-200 h-9 bg-zinc-50 focus:bg-white transition-all shadow-sm"
                                                            value={surveyForm.slots[day]?.[meal]?.[1] || ''}
                                                            onChange={(e) => handleSurveyOptionChange(day, meal, 1, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-end gap-4 border-t pt-8">
                                <Button variant="ghost" className="h-14 px-8 font-bold text-zinc-500">Discard Draft</Button>
                                <Button 
                                    onClick={handleCreateSurvey}
                                    disabled={isSurveyProcessing}
                                    className="h-14 px-12 bg-zinc-900 text-white hover:bg-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSurveyProcessing ? 'Launching...' : 'Activate Monthly Survey'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}