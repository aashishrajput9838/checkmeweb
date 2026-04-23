import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, Coffee, Sun, Soup, Moon, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface MenuItem {
  breakfast: string[];
  lunch: string[];
  snacks: string[];
  dinner: string[];
}

interface Timings {
  breakfast?: string;
  lunch?: string;
  snacks?: string;
  dinner?: string;
}

interface MenuCardProps {
  title?: string;
  menu: MenuItem;
  timings?: Timings;
  className?: string;
  userId?: string;
}

export function MenuCard({ title = "Today's Menu", menu, timings, className, userId }: MenuCardProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState<string | null>(null); // item_type

  const handleFeedback = async (dishName: string, type: 'like' | 'dislike') => {
    if (!userId) {
        toast({ title: 'Authentication Required', description: 'Please sign in to give feedback.', variant: 'destructive' });
        return;
    }
    
    const target = `${dishName}_${type}`;
    setSubmitting(target);

    try {
      const res = await fetch('/api/foodFeedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishName, type, userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }

      toast({
        title: 'Feedback Received!',
        description: `Your ${type} for ${dishName} has been recorded.`,
      });
    } catch (error: any) {
      toast({
        title: 'Notice',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(null);
    }
  };

  const sections = [
    { id: 'breakfast', label: 'Breakfast', items: menu.breakfast, time: timings?.breakfast, icon: Coffee, color: 'text-orange-600' },
    { id: 'lunch', label: 'Lunch', items: menu.lunch, time: timings?.lunch, icon: Sun, color: 'text-yellow-600' },
    { id: 'snacks', label: 'Snacks', items: menu.snacks, time: timings?.snacks, icon: Soup, color: 'text-amber-600' },
    { id: 'dinner', label: 'Dinner', items: menu.dinner, time: timings?.dinner, icon: Moon, color: 'text-blue-600' },
  ];

  return (
    <Card className={`h-full bg-white border shadow-sm ${className}`}>
      <CardHeader className="bg-zinc-900 text-white rounded-t-lg py-4">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section) => (
            <div key={section.id} className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white shadow-sm ${section.color}`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 leading-none">{section.label}</h3>
                    {section.time && <p className="text-[10px] text-zinc-500 font-medium uppercase mt-1 tracking-wider">{section.time}</p>}
                  </div>
                </div>
              </div>

              {section.items && section.items.length > 0 ? (
                <ul className="space-y-2">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-3 text-zinc-700 bg-white px-3 py-2 rounded-lg border border-zinc-100 shadow-sm text-sm group hover:border-zinc-300 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                        <span className="font-medium">{item}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                            onClick={() => handleFeedback(item, 'like')}
                            disabled={submitting === `${item}_like`}
                            className="p-1.5 rounded-md hover:bg-green-50 text-zinc-400 hover:text-green-600 transition-colors disabled:opacity-50"
                            title="I like this!"
                        >
                            <ThumbsUp className={`h-3.5 w-3.5 ${submitting === `${item}_like` ? 'animate-bounce' : ''}`} />
                        </button>
                        <button 
                            onClick={() => handleFeedback(item, 'dislike')}
                            disabled={submitting === `${item}_dislike`}
                            className="p-1.5 rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="I don't like this"
                        >
                            <ThumbsDown className={`h-3.5 w-3.5 ${submitting === `${item}_dislike` ? 'animate-bounce' : ''}`} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-zinc-400 italic">No menu items scheduled</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}