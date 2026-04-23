'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Utensils, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsChart } from '@/components/modules/AnalyticsChart';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

const foodAnalyticsData = [
  { dish: 'Biryani', likes: 85, dislikes: 15 },
  { dish: 'Fried Rice', likes: 65, dislikes: 35 },
  { dish: 'Pasta', likes: 75, dislikes: 25 },
  { dish: 'Grilled Chicken', likes: 90, dislikes: 10 },
  { dish: 'Vegetable Curry', likes: 55, dislikes: 45 },
];

const inventoryItems = [
  { name: 'Rice', quantity: 5 },
  { name: 'Chicken', quantity: 12 },
  { name: 'Vegetables', quantity: 8 },
  { name: 'Milk', quantity: 3 },
  { name: 'Bread', quantity: 2 },
];

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
  const todayName = daysOfWeek[new Date().getDay()];

  useEffect(() => {
    const unsubscribeMenu = onSnapshot(doc(db, 'menus', 'weekly'), (docSnap) => {
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
      setLoading(false);
    }, (error) => {
      console.error("Error fetching menu:", error);
      setLoading(false);
    });

    const unsubscribePdf = onSnapshot(doc(db, 'menus', 'pdfContent'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().url) {
        setPdfUrl(docSnap.data().url);
      }
    });

    return () => {
        unsubscribeMenu();
        unsubscribePdf();
    }
  }, [todayName]);

  const handleMenuUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Convert comma-separated strings back to arrays, trimming whitespace
      const updatedMenu = {
        breakfast: formMenu.breakfast.split(',').map(i => i.trim()).filter(i => i),
        lunch: formMenu.lunch.split(',').map(i => i.trim()).filter(i => i),
        snacks: formMenu.snacks.split(',').map(i => i.trim()).filter(i => i),
        dinner: formMenu.dinner.split(',').map(i => i.trim()).filter(i => i),
      };

      await updateDoc(doc(db, 'menus', 'weekly'), {
        [todayName]: updatedMenu
      });
      
      toast({
        title: 'Menu Updated!',
        description: 'The live menu has been successfully updated.',
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

  const handleInputChange = (field: string, value: string) => {
    setFormMenu(prev => ({ ...prev, [field]: value }));
  };

  const lowStockItems = inventoryItems.filter(item => item.quantity < 5);

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
                  <CardTitle>Update Menu</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Update {todayName.charAt(0).toUpperCase() + todayName.slice(1)}'s meal plan</p>
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
                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black flex items-center justify-center gap-2"
                      >
                        {isUpdating && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                        {isUpdating ? 'Updating...' : 'Update Live Menu'}
                      </Button>
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
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <p className="text-sm text-muted-foreground">Items in stock</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {inventoryItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      item.quantity < 5 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-lg font-bold ${
                      item.quantity < 5 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.quantity} units
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}