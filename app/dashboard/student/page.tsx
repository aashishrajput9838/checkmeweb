'use client';

import { useState, useEffect } from 'react';
import UserAvatar from '@/components/user-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarDays, Utensils, Vote } from 'lucide-react';
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
  const [todaysMenu, setTodaysMenu] = useState({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: []
  });
  const [weeklyMenu, setWeeklyMenu] = useState<any>(null);
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
    // 1. Fetch current day's text menu
    const today = new Date().getDay();
    const dayName = daysOfWeek[today]; // 0 is sunday, 1 is monday, etc.

    const unsubscribeMenu = onSnapshot(doc(db, 'mess_menu', 'weekly'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) {
          setWeeklyMenu(data);
          if (data[dayName]) {
            setTodaysMenu(data[dayName]);
          }
        }
      }
      setLoadingMenu(false);
    }, (error) => {
      console.error("Error fetching menu:", error);
      setLoadingMenu(false);
    });

    // 2. Listen to PDF URL
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

  return (
      <div className="min-h-screen bg-background p-4 md:p-6 relative">
        <UserAvatar />
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Manage your hostel life efficiently</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Menu Board */}
          <div className="lg:col-span-1 flex flex-col gap-6">
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
                    <MenuCard menu={todaysMenu} />
                    )}
                </TabsContent>

                <TabsContent value="weekly" className="mt-4 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {loadingMenu ? (
                        <Card className="h-[400px] flex items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                            <p className="text-muted-foreground text-yellow-700 animate-pulse">Loading menu...</p>
                        </Card>
                    ) : (
                        daysOfWeek.map(day => (
                            <Card key={day} className="border-l-4 border-l-yellow-400">
                                <CardHeader className="py-3 bg-zinc-50 border-b">
                                    <CardTitle className="text-md capitalize">{day}</CardTitle>
                                </CardHeader>
                                <CardContent className="py-3 space-y-2 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-xs text-muted-foreground uppercase">Breakfast</span>
                                        <span>{(weeklyMenu?.[day]?.breakfast || []).join(', ') || 'Not specified'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-xs text-muted-foreground uppercase">Lunch</span>
                                        <span>{(weeklyMenu?.[day]?.lunch || []).join(', ') || 'Not specified'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-xs text-muted-foreground uppercase">Dinner</span>
                                        <span>{(weeklyMenu?.[day]?.dinner || []).join(', ') || 'Not specified'}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            {/* Official PDF Upload/Download Section */}
            <Card className="border-t-4 border-t-yellow-400 shadow-md">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        Official PDF Menu
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

          {/* Review Menu Modal (Overlay) */}
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
          <div className="lg:col-span-1">
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

          {/* My Attendance */}
          <div className="lg:col-span-1">
            <AttendanceTable 
              records={attendanceData}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}