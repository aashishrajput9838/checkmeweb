'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FoodCardProps {
  name: string;
}

export function FoodCard({ name }: FoodCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Normalize empty strings
    if (!name || name.trim() === '') {
        setLoading(false);
        setError(true);
        return;
    }

    const fetchImage = async () => {
      try {
        const res = await fetch(`/api/getFoodImage?name=${encodeURIComponent(name.trim())}`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        if (mounted && data.url) {
          setImageUrl(data.url);
        } else if (mounted) {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching image for', name, err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchImage();

    return () => {
      mounted = false;
    };
  }, [name]);

  // Fallback image gradient matching dark theme structure if loading fails
  const fallbackImage = "linear-gradient(135deg, #27272a 0%, #18181b 100%)";

  return (
    <Card className="overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 bg-white">
      <div className="relative w-full h-32 bg-zinc-100 flex items-center justify-center">
        {loading ? (
          <Skeleton className="w-full h-full" />
        ) : error || !imageUrl ? (
          <div 
            className="w-full h-full flex flex-col items-center justify-center opacity-80" 
            style={{ background: fallbackImage }}
          >
             <span className="text-zinc-500 text-xs text-center px-2">Image unavailable</span>
          </div>
        ) : (
          <img 
            src={imageUrl} 
            alt={name} 
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-500"
            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
            style={{ opacity: 0 }}
          />
        )}
      </div>
      <CardContent className="p-3">
        <p className="text-sm font-semibold text-zinc-800 line-clamp-2 leading-tight">
          {name}
        </p>
      </CardContent>
    </Card>
  );
}
