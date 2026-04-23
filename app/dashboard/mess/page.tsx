'use client';

import { useState, useEffect } from 'react';
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
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, collection, query } from 'firebase/firestore';
import { InventoryCard } from '@/components/modules/InventoryCard';
import { FoodPoll } from '@/components/modules/FoodPoll';
import { Vote } from 'lucide-react';

const inventoryIcons: any = {
  rice: '🍚',
  chicken: '🍗',
  vegetables: '🥦',
  milk: '🥛',
  bread: '🍞'
};


const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function MessDashboard() {
  const { toast } = useToast();
  const [formMenu, setFormMenu] = useState({
    breakfast: '',
    lunch: '',
    snacks: '',
    dinner: ''
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [foodAnalyticsData, setFoodAnalyticsData] = useState<any[]>([]);
  const todayName = daysOfWeek[new Date().getDay()];

  useEffect(() => {
    const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

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
      onSnapshot(doc(db, 'daily_overrides', todayDate), (overrideSnap) => {
        if (overrideSnap.exists()) {
          const data = overrideSnap.data();
          setFormMenu({
            breakfast: data.breakfast || '',
            lunch: data.lunch || '',
            snacks: data.snacks || '',
            dinner: data.dinner || '',
          });
        }
      });

      setLoading(false);
    }, (error) => {
      console.error("Error fetching menu:", error);
      setLoading(false);
    });

    const unsubscribePdf = onSnapshot(doc(db, 'mess_menu', 'pdfContent'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().url) {
        setPdfUrl(docSnap.data().url);
      }
    });

    const unsubscribeInventory = onSnapshot(query(collection(db, 'inventory')), (snap) => {
        const items = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setInventoryList(items);
    });

    const unsubscribeAnalytics = onSnapshot(query(collection(db, 'food_analytics')), (snap) => {
        const stats = snap.docs.map(doc => ({
            dish: doc.data().dish,
            likes: doc.data().likes || 0,
            dislikes: doc.data().dislikes || 0
        }));
        setFoodAnalyticsData(stats);
    });

    return () => {
        unsubscribeMenu();
        unsubscribePdf();
        unsubscribeInventory();
        unsubscribeAnalytics();
    }
  }, [todayName]);

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
      
      toast({
        title: "Today's Menu Updated!",
        description: `Emergency override active for ${todayDate}. This will only affect today.`,
      });
    } catch (error) {
      console.error("Error updating menu:", error);
      toast({
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
        
        toast({
            title: 'Menu Reset!',
            description: 'Today\'s emergency override has been removed. Reverting to weekly menu.',
        });
    } catch (error) {
        console.error("Error resetting menu:", error);
        toast({
            title: 'Reset Failed',
            description: 'Could not revert to weekly menu.',
            variant: 'destructive'
        });
    } finally {
        setIsUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormMenu(prev => ({ ...prev, [field]: value }));
  };

  const lowStockItems = inventoryList.filter(item => item.stock <= (item.threshold || 5));

  return (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Update Menu Form */}
          <div className="lg:col-span-1">
            <Card className="h-full border-2 border-yellow-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  <CardTitle>Daily Menu Overwrite</CardTitle>
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
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="breakfast" className="block text-sm font-medium mb-1">
                          Breakfast
                        </label>
                        <Textarea 
                          id="breakfast" 
                          placeholder="Enter breakfast items (comma-separated)" 
                          value={formMenu.breakfast}
                          onChange={(e) => handleInputChange('breakfast', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label htmlFor="lunch" className="block text-sm font-medium mb-1">
                          Lunch
                        </label>
                        <Textarea 
                          id="lunch" 
                          placeholder="Enter lunch items (comma-separated)" 
                          value={formMenu.lunch}
                          onChange={(e) => handleInputChange('lunch', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label htmlFor="snacks" className="block text-sm font-medium mb-1">
                          Snacks
                        </label>
                        <Textarea 
                          id="snacks" 
                          placeholder="Enter snack items (comma-separated)" 
                          value={formMenu.snacks}
                          onChange={(e) => handleInputChange('snacks', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label htmlFor="dinner" className="block text-sm font-medium mb-1">
                          Dinner
                        </label>
                        <Textarea 
                          id="dinner" 
                          placeholder="Enter dinner items (comma-separated)" 
                          value={formMenu.dinner}
                          onChange={(e) => handleInputChange('dinner', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button 
                            type="submit" 
                            disabled={isUpdating}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black flex items-center justify-center gap-2"
                        >
                            {isUpdating && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                            {isUpdating ? 'Updating...' : 'Update Live Menu'}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={handleReset}
                            className="w-full border-zinc-200 hover:bg-zinc-50 text-zinc-500 font-medium"
                            disabled={isUpdating}
                        >
                            Reset to Regular Menu
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Food Analytics Chart */}
          <div className="lg:col-span-1">
            <AnalyticsChart 
              data={foodAnalyticsData}
              className="h-full"
            />
          </div>
        </div>

        {/* Inventory Section */}
        <div className="mt-6 mb-20">
          <Card className="bg-zinc-50 border-zinc-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Real-time Stock Management</CardTitle>
                    <p className="text-sm text-muted-foreground italic">Manage inventory levels instantly (Cloud Synced)</p>
                  </div>
                  <div className="bg-zinc-900 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                      Live
                  </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {inventoryList.length > 0 ? (
                    inventoryList.map((item) => (
                        <InventoryCard key={item.id} item={{ ...item, icon: inventoryIcons[item.name.toLowerCase()] || '📦' }} />
                    ))
                ) : (
                    <div className="col-span-full p-12 text-center text-zinc-400 border-2 border-dashed rounded-xl">
                        Loading cloud inventory...
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}