'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  name: string;
  stock: number;
  threshold: number;
  unit?: string;
  icon?: string;
}

export function InventoryCard({ item }: { item: InventoryItem }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async (change: number) => {
    if (isUpdating) return;
    if (item.stock + change < 0) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/updateStock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: item.name, change }),
      });

      if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Update failed');
      }
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = () => {
    if (item.stock <= 3) return 'text-red-500 bg-red-950/20 border-red-500/50';
    if (item.stock <= item.threshold) return 'text-yellow-500 bg-yellow-950/20 border-yellow-500/50';
    return 'text-green-500 bg-green-950/20 border-green-500/50';
  };

  const getProgressColor = () => {
    if (item.stock <= 3) return 'bg-red-500';
    if (item.stock <= item.threshold) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className={`relative overflow-hidden border transition-all duration-300 hover:shadow-lg bg-zinc-950 ${getStatusColor()}`}>
      <CardContent className="p-4 pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <h3 className="font-black uppercase tracking-tight text-white">{item.name}</h3>
              <p className="text-[10px] uppercase font-bold opacity-70">Stock Level</p>
            </div>
          </div>
          {item.stock <= 3 && (
            <div className="animate-pulse flex items-center gap-1 text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">
              <AlertTriangle className="h-3 w-3" /> Low Stock
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-4 mb-3">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-white">{item.stock}</span>
            <span className="text-xs font-bold uppercase opacity-60 text-white">{item.unit || 'units'}</span>
          </div>
          <div className="flex gap-2">
            <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8 p-0 rounded-lg border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-50"
                onClick={() => handleUpdate(-1)}
                disabled={isUpdating || item.stock <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8 p-0 rounded-lg border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-50"
                onClick={() => handleUpdate(1)}
                disabled={isUpdating}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
             <div 
                className={`h-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${Math.min((item.stock / 20) * 100, 100)}%` }}
             />
        </div>
      </CardContent>
    </Card>
  );
}
