import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CalendarDays } from 'lucide-react';

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

interface ReviewMenuModalProps {
    parsedMenu: any;
    onSetParsedMenu: (menu: any) => void;
    onCancel: () => void;
    onSave: () => void;
    isSaving: boolean;
}

export function ReviewMenuModal({ parsedMenu, onSetParsedMenu, onCancel, onSave, isSaving }: ReviewMenuModalProps) {
    if (!parsedMenu) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col mt-10">
                <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-yellow-50 rounded-t-xl sticky top-0 z-10 shrink-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold">Review Extracted Menu</h2>
                        <p className="text-sm text-muted-foreground">Please correct any OCR mistakes before saving to the live database.</p>
                    </div>
                    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
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
                                                onSetParsedMenu(updated);
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
                    <Button variant="outline" onClick={onCancel}>Discard Form</Button>
                    <Button 
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 sm:px-8 font-medium shadow-sm flex items-center gap-2"
                        onClick={onSave}
                        disabled={isSaving}
                    >
                        {isSaving && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                        {isSaving ? 'Publishing Live...' : 'Confirm & Publish List'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
