import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils } from 'lucide-react';

interface MenuItem {
  breakfast: string[];
  lunch: string[];
  snacks: string[];
  dinner: string[];
}

interface MenuCardProps {
  title?: string;
  menu: MenuItem;
  className?: string;
}

export function MenuCard({ title = "Today's Menu", menu, className }: MenuCardProps) {
  return (
    <Card className={`h-full bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 ${className}`}>
      <CardHeader className="bg-yellow-500 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">Breakfast</h3>
            {menu.breakfast && menu.breakfast.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {menu.breakfast.map((item, idx) => (
                  <li key={idx} className="text-yellow-700">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-yellow-600/70 italic">No items set</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">Lunch</h3>
            {menu.lunch && menu.lunch.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {menu.lunch.map((item, idx) => (
                  <li key={idx} className="text-yellow-700">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-yellow-600/70 italic">No items set</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">Dinner</h3>
            {menu.dinner && menu.dinner.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {menu.dinner.map((item, idx) => (
                  <li key={idx} className="text-yellow-700">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-yellow-600/70 italic">No items set</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">Snacks</h3>
            {menu.snacks && menu.snacks.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {menu.snacks.map((item, idx) => (
                  <li key={idx} className="text-yellow-700">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-yellow-600/70 italic">No items set</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}