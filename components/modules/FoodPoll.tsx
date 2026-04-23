'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Vote, CheckCircle2, Download } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { pollService } from '@/lib/pollService';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface PollOption {
  name: string;
  votes: number;
}

interface PollData {
  question: string;
  options: PollOption[];
  voters: string[];
}

export function FoodPoll({ userId, pollId = 'current_poll', readOnly = false }: { userId: string, pollId?: string, readOnly?: boolean }) {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Real-time listener for vote counts
    const unsub = onSnapshot(doc(db, 'food_polls', pollId), (doc) => {
      if (doc.exists()) {
        setPoll(doc.data() as PollData);
      }
    });

    return () => unsub();
  }, [pollId]);

  const totalVotes = poll?.options.reduce((acc, opt) => acc + opt.votes, 0) || 0;
  const hasVoted = poll?.voters.includes(userId);

  const handleVote = async () => {
    if (!selected || hasVoted) return;

    setIsSubmitting(true);
    try {
      // Direct call to controller logic since we are in a client component using SDK
      // or we can use pollService.vote if we update it to accept pollId
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, selectedOption: selected, pollId }),
      });
      
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Vote failed');
      }

      toast({
        title: 'Success!',
        description: 'Your vote has been recorded.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadXLSX = () => {
    if (!poll) return;

    // Prepare data for XLSX
    const data = poll.options.map(opt => ({
        "Food Option": opt.name,
        "Total Votes": opt.votes,
        "Percentage": totalVotes > 0 ? `${Math.round((opt.votes / totalVotes) * 100)}%` : "0%"
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");

    // Fix column widths
    const maxWidths = [{ wch: 40 }, { wch: 15 }, { wch: 15 }];
    ws['!cols'] = maxWidths;

    // Download file
    XLSX.writeFile(wb, `${poll.question.replace(/\s+/g, '_')}_Results.xlsx`);
    
    toast({
        title: 'Exported!',
        description: 'Poll results have been downloaded.',
    });
  };

  if (!poll) return null;

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-white shadow-2xl border-dashed">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
            <CardTitle className="text-xl flex items-center gap-2">
                <Vote className="h-5 w-5 text-yellow-500" />
                Food Poll
            </CardTitle>
            <p className="text-sm text-zinc-400">{poll.question}</p>
        </div>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDownloadXLSX}
            className="text-zinc-500 hover:text-white hover:bg-white/10"
            title="Download XLSX Results"
        >
            <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <RadioGroup value={selected} onValueChange={setSelected} className="space-y-4">
          {poll.options.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const isWinner = hasVoted && option.votes === Math.max(...poll.options.map(o => o.votes));

            return (
              <div key={option.name} className="relative group">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 z-10">
                        {(!hasVoted && !readOnly) && (
                            <RadioGroupItem value={option.name} id={option.name} className="border-zinc-700 text-yellow-500" />
                        )}
                        <Label htmlFor={option.name} className={`text-sm font-bold opacity-100 ${(!hasVoted && !readOnly) ? 'cursor-pointer group-hover:text-yellow-500 transition-colors' : ''}`}>
                            {option.name}
                        </Label>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 z-10">{option.votes} votes ({percentage}%)</span>
                </div>
                
                {/* Progress Bar Background */}
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${ (hasVoted || readOnly) ? ( (selected === option.name || isWinner) ? 'bg-yellow-500' : 'bg-zinc-700') : 'bg-zinc-800'}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
              </div>
            );
          })}
        </RadioGroup>

        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Total: {totalVotes} Responses</p>
            {readOnly ? (
                <div className="text-[9px] text-zinc-600 font-medium">REAL-TIME INSIGHTS</div>
            ) : !hasVoted ? (
                <Button 
                    onClick={handleVote} 
                    disabled={!selected || isSubmitting}
                    className="bg-yellow-500 text-black hover:bg-yellow-400 px-8 font-bold"
                >
                    {isSubmitting ? 'Casting...' : 'Submit Vote'}
                </Button>
            ) : (
                <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Vote Recorded
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
