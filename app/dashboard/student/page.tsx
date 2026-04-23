'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserAvatar } from '@/components/user-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarDays, Utensils, Vote, CheckCircle2, FileSpreadsheet, Download, Clock, Megaphone, LayoutDashboard } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { MenuCard } from '@/components/modules/MenuCard';
import { AttendanceTable } from '@/components/modules/AttendanceTable';
import { FoodPoll } from '@/components/modules/FoodPoll';
import { db, storage } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc, setDoc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const foodPollOptions = [
  { id: 'biryani', label: 'Biryani', votes: 42 },
  { id: 'friedrice', label: 'Fried Rice', votes: 28 },
  { id: 'pasta', label: 'Pasta', votes: 35 }
];

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function StudentDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [attendanceData, setAttendanceData] = useState<{ date: string; status: 'Present' | 'Absent' }[]>([]);
  const [latestNotice, setLatestNotice] = useState<any>(null);

  useEffect(() => {
    const unsubNotice = onSnapshot(doc(db, 'notices', 'latest'), (snap) => {
        if (snap.exists()) {
            setLatestNotice(snap.data());
        }
    });
    return () => unsubNotice();
  }, []);
  const [todaysMenu, setTodaysMenu] = useState({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: []
  });
  const [weeklyMenu, setWeeklyMenu] = useState<any>(null);
  const [timings, setTimings] = useState<any>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [isRep, setIsRep] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [parsedMenu, setParsedMenu] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingParsed, setIsSavingParsed] = useState(false);

  const [activeSurvey, setActiveSurvey] = useState<any>(null);
  const [currentUserVote, setCurrentUserVote] = useState<any>(null);
  const [surveySelections, setSurveySelections] = useState<any>({});
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [menuHistory, setMenuHistory] = useState<any[]>([]);

  const surveyDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const surveyMeals = ['breakfast', 'lunch', 'snacks', 'dinner'];

  // Auto-Register Student on First Login
  useEffect(() => {
    const registerStudent = async () => {
        if (user?.email?.endsWith('@ug.sharda.ac.in')) {
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
        }
    };
    registerStudent();
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    
    const q = query(
        collection(db, 'users', user.email, 'attendance_history'),
        orderBy('date', 'desc'),
        limit(10)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
        const records = snap.docs.map(d => ({
            date: d.data().date,
            status: d.data().status
        } as { date: string; status: 'Present' | 'Absent' }));
        setAttendanceData(records);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch Active Survey & Current User Vote Status
  useEffect(() => {
    if (!user?.email) return;

    const unsubSurvey = onSnapshot(query(collection(db, 'monthly_surveys'), where('status', '==', 'active')), (snap) => {
        if (!snap.empty) {
            const survey = { id: snap.docs[0].id, ...snap.docs[0].data() };
            setActiveSurvey(survey);

            // Listen for user's specific vote
            const unsubVote = onSnapshot(doc(db, 'monthly_surveys', survey.id, 'votes', user.email), (vSnap) => {
                if (vSnap.exists()) {
                    setCurrentUserVote(vSnap.data());
                } else {
                    setCurrentUserVote(null);
                }
            });
            return () => unsubVote();
        } else {
            setActiveSurvey(null);
            setCurrentUserVote(null);
        }
    });

    return () => unsubSurvey();
  }, [user]);

  // Fetch Menu History for Archive
  useEffect(() => {
    const unsubHistory = onSnapshot(query(collection(db, 'menu_history'), orderBy('generatedAt', 'desc'), limit(5)), (snap) => {
        const items = snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
        setMenuHistory(items);
    });
    return () => unsubHistory();
  }, []);

  const handleDownloadBallotExcel = () => {
    if (!currentUserVote) return;
    
    // Prepare data for Excel
    const data = Object.entries(currentUserVote.selections).map(([slot, choice]) => {
        const [day, meal] = slot.split('-');
        return {
            'Day': day.toUpperCase(),
            'Meal': meal.toUpperCase(),
            'My Selection': choice,
            'Voted At': new Date(currentUserVote.timestamp?.toDate?.() || currentUserVote.timestamp).toLocaleString()
        };
    });

    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "My Monthly Ballot");

    // Fix column widths
    worksheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 25 }];

    writeFile(workbook, `Mess_Ballot_${user?.name?.replace(' ', '_') || 'Student'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSurveySelect = (slotId: string, choice: string) => {
    setSurveySelections(prev => ({ ...prev, [slotId]: choice }));
  };

  const handleSubmitMonthlyVote = async () => {
    if (!activeSurvey || !user?.email) return;

    // Validate all slots are filled (optional but professional)
    const requiredTotal = 21; // 7 days * 3 meals (snacks omitted usually but prompt says all slots)
    // Actually our slots are 4 per day (breakfast, lunch, snacks, dinner) -> 28
    // The previous implementation used 4 meals. Let's stick to 4. 28 total.
    
    setIsSubmittingVote(true);
    try {
        const res = await fetch('/api/survey/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                monthId: activeSurvey.id,
                userId: user.email,
                selections: surveySelections
            })
        });
        if (!res.ok) throw new Error('Vote submission failed');
        toast({ title: 'Vote Confirmed!', description: 'Your preferences for next month have been recorded.' });
    } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
        setIsSubmittingVote(false);
    }
  };

  useEffect(() => {
    // 1. Fetch local fallback data (xlsx)
    const today = new Date().getDay();
    const dayName = daysOfWeek[today]; // 0 is sunday, 1 is monday, etc.

    let localMenu: any = null;

    fetch('/api/mess/data')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
           setTimings(data.timing);
           localMenu = data.menu;
           // Initialize if weeklyMenu is currently null
           setWeeklyMenu((prev: any) => {
             if (!prev) {
               setTodaysMenu(data.menu[dayName] || { breakfast: [], lunch: [], snacks: [], dinner: [] });
               return data.menu;
             }
             return prev;
           });
           setLoadingMenu(false);
        }
      })
      .catch(console.error);

    // 2. Fetch current day's text menu from Firebase (Overrides local if exists)
    const unsubscribeMenu = onSnapshot(doc(db, 'mess_menu', 'weekly'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Object.keys(data).length > 2) {
          setWeeklyMenu(data);
          if (data[dayName]) {
            setTodaysMenu(data[dayName]);
          }
        }
      } else if (localMenu) {
         setWeeklyMenu(localMenu);
          setTodaysMenu(localMenu[dayName] || { breakfast: [], lunch: [], snacks: [], dinner: [] });
      }

      // Check for TODAY'S EMERGENCY OVERRIDE
      const todayDate = new Date().toISOString().split('T')[0];
      onSnapshot(doc(db, 'daily_overrides', todayDate), (overrideSnap) => {
        if (overrideSnap.exists()) {
          const data = overrideSnap.data();
          const overrideMenu = {
              breakfast: data.breakfast ? data.breakfast.split(',').map((i:any)=>i.trim()) : [],
              lunch: data.lunch ? data.lunch.split(',').map((i:any)=>i.trim()) : [],
              snacks: data.snacks ? data.snacks.split(',').map((i:any)=>i.trim()) : [],
              dinner: data.dinner ? data.dinner.split(',').map((i:any)=>i.trim()) : [],
          };
          setTodaysMenu(overrideMenu);
          toast({
            title: "Menu Alert",
            description: "A special menu has been set for today by Mess Staff.",
          });
        }
      });

      setLoadingMenu(false);
    }, (error) => {
      console.error("Error fetching menu:", error);
      setLoadingMenu(false);
    });

    // 3. Listen to PDF URL
    const unsubscribePdf = onSnapshot(doc(db, 'mess_menu', 'pdfContent'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().url) {
        setPdfUrl(docSnap.data().url);
      }
    });

    return () => {
        unsubscribeMenu();
        unsubscribePdf();
    };
  }, []);

  // 3. Setup user role once `user` exists
  useEffect(() => {
    if (!user?.email) return;

    const checkRole = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.email!));
        if (userDoc.exists() && userDoc.data()?.role === 'representative') {
            setIsRep(true);
        }
    }
    checkRole();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type !== 'application/pdf' && 
        !selectedFile.type.startsWith('image/') &&
        selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        !selectedFile.name.endsWith('.xlsx')
      ) {
        toast({ title: 'Invalid File', description: 'Please select a PDF, Image, or Excel (.xlsx) file.', variant: 'destructive' });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleProcessMenu = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/mess/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.parsedData) {
        setParsedMenu(data.parsedData);
        setIsReviewing(true);
        
        if (data.warning) {
            toast({ title: '⚠️ Image-based PDF Detected', description: 'Tesseract OCR cannot read scanned PDFs automatically yet. We have opened Manual Mode for you, or please upload the raw .jpg instead!', variant: 'destructive', duration: 10000 });
        } else {
            toast({ title: 'Menu Processed!', description: 'Please review and confirm the extracted data.' });
        }
      } else {
        toast({ title: 'Processing Failed', description: data.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({ title: 'Processing Failed', description: 'Could not connect to parsing service.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveParsedMenu = async () => {
    setIsSavingParsed(true);
    try {
        // 1. Save JSON to Firebase mess_menu/weekly
        const payload = {
            ...parsedMenu,
            uploadedBy: user?.email || 'Unknown Admin',
            createdAt: new Date().toISOString(),
            weekStartDate: new Date().toISOString()
        };
        await setDoc(doc(db, 'mess_menu', 'weekly'), payload, { merge: true });

        // 2. Upload file to Storage for the downloadable PDF
        if (file) {
           const storageRef = ref(storage, 'menus/official-menu.pdf');
           await uploadBytes(storageRef, file);
           const downloadUrl = await getDownloadURL(storageRef);

           await setDoc(doc(db, 'mess_menu', 'pdfContent'), {
               url: downloadUrl,
               updatedAt: new Date().toISOString(),
               updatedBy: user?.email || 'Unknown Admin'
           });
        }
        
        toast({ title: 'Menu Saved!', description: 'The live menu has been updated globally.' });
        setIsReviewing(false);
        setParsedMenu(null);
        setFile(null); // Clear selection
    } catch (error) {
        console.error('Error saving:', error);
        toast({ title: 'Save Failed', description: 'Could not save the menu.', variant: 'destructive' });
    } finally {
        setIsSavingParsed(false);
    }
  };

  const handleManualEntry = () => {
    const emptyMenu: any = {};
    daysOfWeek.forEach(day => {
        emptyMenu[day] = { breakfast: ["Not Available"], lunch: ["Not Available"], snacks: ["Not Available"], dinner: ["Not Available"] };
    });
    setParsedMenu(emptyMenu);
    setFile(null);
    setIsReviewing(true);
  };

  const handleEditActiveMenu = () => {
    if (weeklyMenu) {
        const { uploadedBy, createdAt, weekStartDate, ...cleanMenu } = weeklyMenu;
        setParsedMenu(cleanMenu);
        setFile(null);
        setIsReviewing(true);
    } else {
        toast({ title: 'No Menu Found', description: 'There is no active menu to edit. Start from scratch.', variant: 'destructive' });
    }
  };

  const handleVote = (optionId: string) => {
    toast({
      title: 'Vote Cast!',
      description: `Your vote for ${foodPollOptions.find(opt => opt.id === optionId)?.label} has been recorded.`,
    });
  };

  const getActiveMeal = () => {
    if (!timings) return null;
    
    // Simple parser for "8:00 PM to 10:00 PM"
    const parseTime = (timeStr: string) => {
        if (!timeStr) return null;
        const [start, end] = timeStr.split(' to ');
        const parseSingle = (s: string) => {
            const match = s.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) return 0;
            let [_, h, m, p] = match;
            let hour = parseInt(h);
            if (p.toUpperCase() === 'PM' && hour !== 12) hour += 12;
            if (p.toUpperCase() === 'AM' && hour === 12) hour = 0;
            return hour * 60 + parseInt(m);
        };
        return { start: parseSingle(start), end: parseSingle(end) };
    };

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const order = ['breakfast', 'lunch', 'snacks', 'dinner'] as const;
    
    // 1. Check if we are currently inside a meal window
    for (const meal of order) {
        const time = parseTime(timings[meal]);
        if (!time) continue;
        if (currentMins >= time.start && currentMins <= time.end) {
            return { meal, status: 'LIVE NOW', items: todaysMenu[meal] || [] };
        }
    }

    // 2. Otherwise find the NEXT upcoming meal
    for (const meal of order) {
        const time = parseTime(timings[meal]);
        if (!time) continue;
        if (currentMins < time.start) {
            return { meal, status: 'UPCOMING', items: todaysMenu[meal] || [] };
        }
    }

    // 3. If after dinner, show tomorrow's breakfast (from weekly) or just say finished
    return { meal: 'breakfast', status: 'TOMORROW', items: todaysMenu['breakfast'] || [] };
  };

  const activeMealInfo = getActiveMeal();

  return (
      <div className="min-h-screen bg-background p-4 md:p-6 relative">
        <UserAvatar />
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Manage your hostel life efficiently</p>
        </div>

        {/* Integrated Notice Board - Only show on Overview/Hub */}
        {latestNotice && (currentTab === 'overview' || currentTab === 'hub') && (
            <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
                <Alert className="bg-zinc-900 border-zinc-800 text-white p-6 rounded-2xl shadow-xl border-l-4 border-l-blue-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <Megaphone className="h-5 w-5 text-blue-400" />
                    <div className="ml-2">
                        <AlertTitle className="text-blue-400 font-black uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                            Official Warden Notice
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping"></span>
                        </AlertTitle>
                        <AlertDescription className="text-xl font-medium tracking-tight leading-relaxed">
                            "{latestNotice.message}"
                        </AlertDescription>
                        <p className="mt-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                            Posted {new Date(latestNotice.timestamp).toLocaleString()}
                        </p>
                    </div>
                </Alert>
            </div>
        )}

        {/* Tab-based Routing */}
        <div className="w-full">
          {/* Overview / Student Hub */}
          {currentTab === 'overview' && (
              <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-zinc-900 text-white border-none p-8 rounded-3xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                          <div className="relative z-10">
                              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500 mb-6">Student Profile</h2>
                              <div className="flex items-center gap-6 mb-8">
                                  {user?.photoURL ? (
                                      <img 
                                          src={user.photoURL} 
                                          alt="Profile" 
                                          className="h-20 w-20 rounded-2xl object-cover border-2 border-yellow-500/50 shadow-lg"
                                          referrerPolicy="no-referrer"
                                      />
                                  ) : (
                                      <div className="h-20 w-20 bg-yellow-500 rounded-2xl flex items-center justify-center text-black text-3xl font-black">
                                          {user?.email?.charAt(0).toUpperCase()}
                                      </div>
                                  )}
                                  <div>
                                      <p className="text-3xl font-black tracking-tight">{user?.email?.split('@')[0]}</p>
                                      <p className="text-zinc-400 text-sm">{user?.email}</p>
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                                  <div>
                                      <p className="text-[10px] uppercase font-bold text-zinc-500">Hostel Role</p>
                                      <p className="text-sm font-bold">Resident Student</p>
                                  </div>
                                  <div>
                                      <p className="text-[10px] uppercase font-bold text-zinc-500">Room Info</p>
                                      <p className="text-sm font-bold uppercase">Syncing with Warden Hub</p>
                                  </div>
                              </div>
                          </div>
                      </Card>

                      <Card className="bg-blue-600 text-white border-none p-8 rounded-3xl flex flex-col justify-between">
                          <div>
                              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-200 mb-6">Quick Stats</h2>
                              <div className="space-y-4">
                                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10">
                                      <span className="text-xs">Meal Feedback Given</span>
                                      <span className="font-bold">12 Total</span>
                                  </div>
                                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10">
                                      <span className="text-xs">Attendance Marked</span>
                                      <span className="font-bold">{attendanceData.length} Days</span>
                                  </div>
                              </div>
                          </div>
                          <p className="text-[10px] uppercase font-bold text-blue-200 mt-8 tracking-widest">Verification Status: Verified</p>
                      </Card>
                  </div>

                  <div className="mt-8 p-6 bg-zinc-50 rounded-2xl border border-zinc-200">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-zinc-900 rounded-lg text-white">
                              <LayoutDashboard className="h-4 w-4" />
                          </div>
                          <h3 className="font-bold text-zinc-900 uppercase">Hub Explorer</h3>
                      </div>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                          Welcome to your central hub. Use the sidebar to check the live menu, cast your votes for Sunday specials, or verify your attendance history.
                      </p>
                  </div>
              </div>
          )}

          {/* Live Menu Board */}
          {currentTab === 'menu' && (
            <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500" id="live-menu">
                {/* Active/Upcoming Meal Highlight */}
                {activeMealInfo && (currentTab === 'overview' || currentTab === 'menu') && (
                    <div className="bg-zinc-900 rounded-xl p-5 text-white shadow-xl border-t-4 border-yellow-500 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Utensils className="h-24 w-24" />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-ping"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">{activeMealInfo.status}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black capitalize tracking-tight mb-1">{activeMealInfo.meal}</h2>
                                <p className="text-zinc-400 text-sm italic">
                                    {timings?.[activeMealInfo.meal as keyof typeof timings] || 'Schedule pending'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                             {activeMealInfo.items.length > 0 ? (
                                activeMealInfo.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 p-2.5 rounded-lg backdrop-blur-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                                        <span className="text-sm font-medium">{item}</span>
                                    </div>
                                ))
                             ) : (
                                <p className="text-zinc-500 text-[10px] italic">No official PDF uploaded yet.</p>
                             )}
                        </div>
                    </div>
                )}



            <Tabs defaultValue="today" className="w-full">
                <TabsList className="w-full bg-yellow-100 border border-yellow-200">
                    <TabsTrigger value="today" className="w-1/2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black">Today's Menu</TabsTrigger>
                    <TabsTrigger value="weekly" className="w-1/2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black">Weekly Menu</TabsTrigger>
                </TabsList>
                
                <TabsContent value="today" className="mt-4">
                    {loadingMenu ? (
                    <Card className="h-[400px] flex items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                        <p className="text-muted-foreground text-yellow-700 animate-pulse">Loading menu...</p>
                    </Card>
                    ) : (
                    <MenuCard 
                        menu={todaysMenu} 
                        timings={timings} 
                        userId={user?.email || undefined}
                    />
                    )}
                </TabsContent>

                <TabsContent value="weekly" className="mt-4">
                    {loadingMenu ? (
                        <Card className="h-[400px] flex items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                            <p className="text-muted-foreground text-yellow-700 animate-pulse">Loading menu...</p>
                        </Card>
                    ) : (
                        <div className="bg-white border rounded-xl overflow-x-auto shadow-sm">
                            <table className="w-full border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-zinc-900 text-white">
                                        <th className="p-3 text-[10px] font-black uppercase text-left border-r border-zinc-700 w-24">Meal Slot</th>
                                        {daysOfWeek.map(day => (
                                            <th key={day} className="p-3 text-[10px] font-black uppercase text-center border-r border-zinc-700 last:border-r-0">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((meal, mIdx) => (
                                        <tr key={meal} className={mIdx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                                            <td className="p-3 border-r border-zinc-100 align-middle bg-zinc-50/80">
                                                <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider inline-block">{meal}</span>
                                            </td>
                                            {daysOfWeek.map(day => {
                                                const items = weeklyMenu?.[day]?.[meal] || [];
                                                return (
                                                    <td key={`${day}-${meal}`} className="p-2 border-r border-zinc-100 last:border-r-0 align-top h-24">
                                                        <div className="flex flex-col gap-1">
                                                            {items.length > 0 ? (
                                                                items.slice(0, 5).map((item: string, i: number) => (
                                                                    <div key={i} className="text-[10px] leading-tight text-zinc-600 bg-white px-1.5 py-0.5 rounded border border-zinc-100 shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.05)] truncate">
                                                                        {item}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <span className="text-[9px] text-zinc-300 italic">No entry</span>
                                                            )}
                                                            {items.length > 5 && <div className="text-[8px] text-yellow-600 font-bold px-1">+{items.length - 5} more...</div>}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-2 bg-zinc-900/5 border-t text-[9px] text-zinc-500 text-center font-medium">
                                💡 Tip: The matrix shows the entire week's schedule at a glance.
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Official PDF Upload/Download Section */}
            <Card className="border-t-4 border-t-yellow-400 shadow-md">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Official Documents
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Direct XLSX Download */}
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between group hover:border-yellow-400 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-md">
                                <Utensils className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-zinc-900">Weekly Mess Menu</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-medium">Excel Format (.xlsx)</p>
                            </div>
                        </div>
                        <Button 
                            variant="secondary"
                            className="bg-zinc-900 text-white hover:bg-zinc-800"
                            onClick={() => window.open('/mess_menu.xlsx', '_blank')}
                        >
                            Download
                        </Button>
                    </div>

                    {/* Timing XLSX Download */}
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between group hover:border-blue-400 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-zinc-900">Mess Timings</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-medium">Excel Format (.xlsx)</p>
                            </div>
                        </div>
                        <Button 
                            variant="secondary"
                            className="bg-zinc-900 text-white hover:bg-zinc-800"
                            onClick={() => window.open('/mess_timing.xlsx', '_blank')}
                        >
                            Download
                        </Button>
                    </div>

                    {menuHistory.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-zinc-100">
                            <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">Historical Archives</h4>
                            <div className="space-y-3">
                                {menuHistory.map((h: any) => (
                                    <div key={h.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100 hover:bg-white hover:border-yellow-200 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-zinc-200 text-zinc-600 rounded-lg group-hover:bg-yellow-100 group-hover:text-yellow-600 transition-colors">
                                                <CalendarDays className="h-3 w-3" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-zinc-900 capitalize">{h.id.replace('-', ' ')} Archive</p>
                                                <p className="text-[9px] text-zinc-500 font-medium">Generated on {new Date(h.generatedAt?.toDate?.() || h.generatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-tighter h-7">View</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {pdfUrl && (
                        <Button 
                            variant="outline" 
                            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => window.open(pdfUrl, '_blank')}
                        >
                            View Current Official PDF
                        </Button>
                    )}
                    
                    {isRep && (
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mt-4 flex flex-col gap-4">
                            <div>
                                <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-3">Upload Menu File</p>
                                <input 
                                    type="file" 
                                    accept="application/pdf,image/*,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    onChange={handleFileChange}
                                    className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200 mb-3"
                                />
                                <Button 
                                    onClick={handleProcessMenu}
                                    disabled={!file || isProcessing}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black flex items-center justify-center gap-2"
                                >
                                    {isProcessing && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                                    {isProcessing ? 'Extracting Text...' : 'Smart Parse Menu'}
                                </Button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 border-b border-yellow-200"></div>
                                <span className="text-xs font-medium text-yellow-600 uppercase">OR</span>
                                <div className="flex-1 border-b border-yellow-200"></div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-2">Manual Actions</p>
                                <div className="space-y-2">
                                    <Button 
                                        variant="outline"
                                        onClick={handleEditActiveMenu}
                                        className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100 bg-white"
                                    >
                                        Edit Currently Live Menu
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={handleManualEntry}
                                        className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100 bg-white"
                                    >
                                        Start a Fresh Menu Manually
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!pdfUrl && !isRep && (
                        <p className="text-sm text-muted-foreground text-center italic py-2">
                            No official PDF uploaded yet.
                        </p>
                    )}
                </CardContent>
            </Card>
          </div>
          )}

        {/* Review Menu Modal (Overlay) - Moved outside the grid to avoid structure confusion */}
        {isReviewing && parsedMenu && (
          <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col mt-10">
                    <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-yellow-50 rounded-t-xl sticky top-0 z-10 shrink-0">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold">Review Extracted Menu</h2>
                            <p className="text-sm text-muted-foreground">Please correct any OCR mistakes before saving to the live database.</p>
                        </div>
                        <Button variant="ghost" onClick={() => setIsReviewing(false)}>Cancel</Button>
                    </div>
                    
                    <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-zinc-50">
                        {daysOfWeek.map(day => (
                            <Card key={day} className="border-yellow-200 shadow-sm">
                                <CardHeader className="bg-yellow-50 pb-2">
                                    <CardTitle className="text-lg capitalize flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4" /> {day}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-4">
                                    {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map(meal => (
                                        <div key={meal}>
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground">{meal}</Label>
                                            <textarea 
                                                className="w-full text-sm p-2 border border-zinc-200 rounded-md min-h-[60px] focus:ring-yellow-500 focus:border-yellow-500"
                                                value={(parsedMenu[day]?.[meal] || []).join(', ')}
                                                onChange={(e) => {
                                                    const updated = { ...parsedMenu };
                                                    updated[day][meal] = e.target.value.split(',').map(i => i.trim()).filter(i => i);
                                                    setParsedMenu(updated);
                                                }}
                                                placeholder={`Enter ${meal} items separated by commas`}
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="p-4 sm:p-6 border-t bg-white flex justify-end gap-3 rounded-b-xl sticky bottom-0 shrink-0">
                        <Button variant="outline" onClick={() => setIsReviewing(false)}>Discard Form</Button>
                        <Button 
                            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 sm:px-8 font-medium shadow-sm flex items-center gap-2"
                            onClick={handleSaveParsedMenu}
                            disabled={isSavingParsed}
                        >
                            {isSavingParsed && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                            {isSavingParsed ? 'Publishing Live...' : 'Confirm & Publish List'}
                        </Button>
                    </div>
                </div>
            </div>
          )}

          {/* Food Poll Column */}
          {currentTab === 'polls' && (
            <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500" id="food-polls">
              <div className="flex flex-col gap-6">
                <FoodPoll userId={user?.email || 'anonymous'} pollId="sunday_brunch" readOnly={user?.email === 'staff@checkme.com'} />
                <FoodPoll userId={user?.email || 'anonymous'} pollId="sunday_snacks" readOnly={user?.email === 'staff@checkme.com'} />
                <FoodPoll userId={user?.email || 'anonymous'} pollId="sunday_dinner" readOnly={user?.email === 'staff@checkme.com'} />
              </div>
            </div>
          )}

          {/* My Attendance */}
          {currentTab === 'attendance' && (
          <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500" id="my-attendance">
            <AttendanceTable 
              records={attendanceData}
              className="h-full"
            />
          </div>
          )}

          {/* Monthly Voting Interface */}
          {currentTab === 'voting' && (
              <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                  {currentUserVote ? (
                      <Card className="bg-zinc-900 text-white rounded-3xl p-12 text-center border-none shadow-2xl overflow-hidden relative">
                          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                          <div className="relative z-10">
                              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                  <CheckCircle2 className="h-10 w-10 text-black" />
                              </div>
                              <h2 className="text-4xl font-black mb-4">Ballot Recorded!</h2>
                              <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed mb-8">
                                  Thank you for participating. Your selections have been saved. The final menu will be generated based on the overall student consensus.
                              </p>

                              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                  <Button 
                                      onClick={handleDownloadBallotExcel}
                                      className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-8 rounded-2xl flex items-center gap-2 shadow-lg shadow-green-900/40"
                                  >
                                      <FileSpreadsheet className="h-4 w-4" />
                                      Download Ballot Receipt (.xlsx)
                                  </Button>
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                      Voted On: {new Date(currentUserVote.timestamp?.toDate?.() || currentUserVote.timestamp).toLocaleString()}
                                  </p>
                              </div>

                              <div className="mt-12 pt-12 border-t border-white/5">
                                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-yellow-500 mb-8">Full Ballot Review</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                                      {surveyMeals.map(meal => (
                                          <div key={meal} className="space-y-4">
                                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/10 pb-2">{meal}</p>
                                              {surveyDays.map(day => {
                                                  const slot = `${day}-${meal}`;
                                                  const choice = currentUserVote.selections[slot];
                                                  return (
                                                      <div key={day} className="group">
                                                          <p className="text-[8px] font-bold text-zinc-500 uppercase mb-1">{day}</p>
                                                          <p className="text-xs font-bold text-zinc-300 group-hover:text-yellow-500 transition-colors">{choice}</p>
                                                      </div>
                                                  );
                                              })}
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </Card>
                  ) : activeSurvey ? (
                      <div className="space-y-8">
                          <div className="bg-white rounded-3xl p-8 shadow-sm flex items-center justify-between border-b-4 border-yellow-500">
                              <div>
                                  <h2 className="text-3xl font-black tracking-tight text-zinc-900">{activeSurvey.monthName} Selection</h2>
                                  <p className="text-zinc-500 font-medium text-sm">Choose your preferred meal for every slot next month.</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Status</p>
                                  <div className="flex items-center gap-2 text-green-600 font-bold">
                                      <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                                      Live Now
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-6">
                              {surveyDays.map(day => (
                                  <Card key={day} className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                                      <div className="bg-zinc-900 p-4 text-white flex items-center gap-3">
                                          <CalendarDays className="h-4 w-4 text-yellow-500" />
                                          <h3 className="font-black uppercase text-sm tracking-widest">{day}</h3>
                                      </div>
                                      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                                          {surveyMeals.map(meal => {
                                              const slotId = `${day}-${meal}`;
                                              const options = activeSurvey.slots[day]?.[meal] || [];
                                              if (options.length < 2) return null;

                                              return (
                                                  <div key={meal} className="space-y-3">
                                                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                                          <Utensils className="h-3 w-3" /> {meal}
                                                      </p>
                                                      <RadioGroup 
                                                          onValueChange={(val) => handleSurveySelect(slotId, val)}
                                                          value={surveySelections[slotId]}
                                                          className="grid grid-cols-1 gap-2"
                                                      >
                                                          {options.map((opt: string) => (
                                                              <div key={opt} className={`flex items-center space-x-2 border p-3 rounded-xl transition-all cursor-pointer ${surveySelections[slotId] === opt ? 'border-yellow-500 bg-yellow-50/50 shadow-sm' : 'border-zinc-100 hover:border-zinc-300 bg-white'}`}>
                                                                  <RadioGroupItem value={opt} id={`${slotId}-${opt}`} className="text-yellow-600 border-zinc-300" />
                                                                  <Label htmlFor={`${slotId}-${opt}`} className={`text-xs font-bold leading-tight flex-1 cursor-pointer ${surveySelections[slotId] === opt ? 'text-yellow-900' : 'text-zinc-800'}`}>{opt}</Label>
                                                              </div>
                                                          ))}
                                                      </RadioGroup>
                                                  </div>
                                              );
                                          })}
                                      </div>
                                  </Card>
                              ))}
                          </div>

                          <div className="sticky bottom-6 left-0 right-0 z-40 bg-zinc-900 rounded-3xl p-6 text-white shadow-2xl flex items-center justify-between border border-white/5 animate-in slide-in-from-bottom-6 transition-all duration-700">
                              <div>
                                  <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Progress</p>
                                  <p className="text-lg font-black">{Object.keys(surveySelections).length} / 28 Slots Filled</p>
                              </div>
                              <Button 
                                  onClick={handleSubmitMonthlyVote}
                                  disabled={isSubmittingVote || Object.keys(surveySelections).length < 28}
                                  className="bg-yellow-500 text-black hover:bg-yellow-400 font-black px-12 h-14 rounded-2xl shadow-xl transition-all active:scale-95"
                              >
                                  {isSubmittingVote ? 'Submitting Ballot...' : 'Cast Final Vote'}
                              </Button>
                          </div>
                      </div>
                  ) : (
                      <Card className="bg-zinc-50 border-zinc-200 border-dashed p-20 text-center rounded-3xl">
                          <Vote className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-zinc-400">No active monthly survey.</h3>
                          <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2">Check back later when the mess staff releases next month's selection form.</p>
                      </Card>
                  )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
}