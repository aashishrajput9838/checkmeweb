import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Vote, CheckCircle2, FileSpreadsheet, CalendarDays, Utensils } from 'lucide-react';

interface VotingTabProps {
    currentUserVote: any;
    activeSurvey: any;
    surveySelections: any;
    isSubmittingVote: boolean;
    onSurveySelect: (slotId: string, choice: string) => void;
    onSubmitVote: () => void;
    onDownloadReceipt: () => void;
}

const surveyDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const surveyMeals = ['breakfast', 'lunch', 'snacks', 'dinner'];

export function VotingTab({ 
    currentUserVote, activeSurvey, surveySelections, isSubmittingVote, 
    onSurveySelect, onSubmitVote, onDownloadReceipt 
}: VotingTabProps) {
    if (currentUserVote) {
        return (
            <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <Card className="bg-zinc-900 text-white rounded-3xl p-12 text-center border-none shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                            <CheckCircle2 className="h-10 w-10 text-black" />
                        </div>
                        <h2 className="text-4xl font-black mb-4">Ballot Recorded!</h2>
                        <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed mb-8">
                            Thank you for participating. Your selections have been saved.
                        </p>
                        <Button onClick={onDownloadReceipt} className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-8 rounded-2xl flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            Download Ballot Receipt (.xlsx)
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (!activeSurvey) {
        return (
            <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <Card className="bg-zinc-50 border-zinc-200 border-dashed p-20 text-center rounded-3xl">
                    <Vote className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-zinc-400">No active monthly survey.</h3>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="bg-white rounded-3xl p-8 shadow-sm flex items-center justify-between border-b-4 border-yellow-500 mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900">{activeSurvey.monthName} Selection</h2>
                    <p className="text-zinc-500 font-medium text-sm">Choose your preferred meal for every slot next month.</p>
                </div>
            </div>

            <div className="space-y-6">
                {surveyDays.map(day => (
                    <Card key={day} className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                        <div className="bg-zinc-900 p-4 text-white flex items-center gap-3">
                            <CalendarDays className="h-4 w-4 text-yellow-500" />
                            <h3 className="font-black uppercase text-sm tracking-widest">{day}</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                            {surveyMeals.map(meal => {
                                const slotId = `${day}-${meal}`;
                                const options = activeSurvey.slots?.[day]?.[meal] || [];
                                if (options.length < 2) return null;
                                return (
                                    <div key={meal} className="space-y-3">
                                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                                            <Utensils className="h-3 w-3" /> {meal}
                                        </p>
                                        <RadioGroup onValueChange={(val) => onSurveySelect(slotId, val)} value={surveySelections[slotId]} className="grid grid-cols-1 gap-2">
                                            {options.map((opt: string) => (
                                                <div key={opt} className={`flex items-center space-x-2 border p-3 rounded-xl transition-all cursor-pointer ${surveySelections[slotId] === opt ? 'border-yellow-500 bg-yellow-50/50 shadow-sm' : 'border-zinc-100 hover:border-zinc-300 bg-white'}`}>
                                                    <RadioGroupItem value={opt} id={`${slotId}-${opt}`} className="text-yellow-600 border-zinc-300" />
                                                    <Label htmlFor={`${slotId}-${opt}`} className={`text-xs font-bold leading-tight flex-1 cursor-pointer ${surveySelections[slotId] === opt ? 'text-yellow-900' : 'text-zinc-800'}`}>{opt}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}
            </div>

            <div className="sticky bottom-6 left-0 right-0 z-40 bg-zinc-900 rounded-3xl p-6 text-white shadow-2xl flex items-center justify-between border border-white/5">
                <div>
                    <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Progress</p>
                    <p className="text-lg font-black">{Object.keys(surveySelections).length} / 28 Slots Filled</p>
                </div>
                <Button onClick={onSubmitVote} disabled={isSubmittingVote || Object.keys(surveySelections).length < 28} className="bg-yellow-500 text-black hover:bg-yellow-400 font-black px-12 h-14 rounded-2xl shadow-xl">
                    {isSubmittingVote ? 'Submitting Ballot...' : 'Cast Final Vote'}
                </Button>
            </div>
        </div>
    );
}
