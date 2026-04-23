'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { UserAvatar } from '@/components/user-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarDays, Utensils, Vote, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MenuCard } from '@/components/modules/MenuCard';
import { AttendanceTable } from '@/components/modules/AttendanceTable';
import { db, storage } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const foodPollOptions = [
  { id: 'biryani', label: 'Biryani', votes: 42 },
  { id: 'friedrice', label: 'Fried Rice', votes: 28 },
  { id: 'pasta', label: 'Pasta', votes: 35 }
];

const attendanceData: { date: string; status: 'Present' | 'Absent' }[] = [
  { date: '2024-02-10', status: 'Present' },
  { date: '2024-02-11', status: 'Present' },
  { date: '2024-02-12', status: 'Absent' },
  { date: '2024-02-13', status: 'Present' },
  { date: '2024-02-14', status: 'Present' },
  { date: '2024-02-15', status: 'Present' },
  { date: '2024-02-16', status: 'Present' }
];

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function StudentDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
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

        <div className={`grid gap-6 ${currentTab === 'overview' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 w-full max-w-4xl mx-auto'}`}>
          {/* Live Menu Board */}
          {(currentTab === 'overview' || currentTab === 'menu') && (
            <div className={`${currentTab === 'overview' ? 'lg:col-span-1' : ''} flex flex-col gap-6`} id="live-menu">
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
                                <p className="text-zinc-500 text-xs italic">No menu items found for this slot.</p>
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
                    <MenuCard menu={todaysMenu} timings={timings} />
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

          {/* Food Polls */}
          {(currentTab === 'overview' || currentTab === 'polls') && (
          <div className={currentTab === 'overview' ? 'lg:col-span-1' : ''} id="food-polls">
            <Card className="h-full border-2 border-dashed border-yellow-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  <CardTitle>Food Poll</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Vote for Sunday Special</p>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  className="space-y-4" 
                  onValueChange={(value) => handleVote(value)}
                >
                  {foodPollOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1">
                        <div className="flex justify-between items-center">
                          <span>{option.label}</span>
                          <span className="text-sm text-muted-foreground">{option.votes} votes</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button 
                  className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
                  onClick={() => toast({
                    title: 'Poll Submitted!',
                    description: 'Thank you for your vote!'
                  })}
                >
                  Submit Vote
                </Button>
              </CardContent>
            </Card>
          </div>
          )}

          {/* My Attendance */}
          {(currentTab === 'overview' || currentTab === 'attendance') && (
          <div className={currentTab === 'overview' ? 'lg:col-span-1' : ''} id="my-attendance">
            <AttendanceTable 
              records={attendanceData}
              className="h-full"
            />
          </div>
          )}
        </div>
        {/* End of Grid */}
      </div>
    </div>
  );
}