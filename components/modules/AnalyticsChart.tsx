import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface FoodAnalyticsData {
  dish: string;
  likes: number;
  dislikes: number;
}

interface AnalyticsChartProps {
  title?: string;
  data: FoodAnalyticsData[];
  className?: string;
}

export function AnalyticsChart({ 
  title = 'Food Analytics', 
  data, 
  className 
}: AnalyticsChartProps) {
  return (
    <Card className={`h-full border-2 border-gray-200 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <CardTitle>{title}</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">Most liked vs disliked dishes</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dish" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="likes" fill="#facc15" name="Liked" />
              <Bar dataKey="dislikes" fill="#ef4444" name="Disliked" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}