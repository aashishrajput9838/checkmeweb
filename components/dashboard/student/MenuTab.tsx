import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Utensils, Clock, CalendarDays } from 'lucide-react';
import { MenuCard } from '@/components/modules/MenuCard';

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

interface MenuTabProps {
    todaysMenu: any;
    weeklyMenu: any;
    timings: any;
    loadingMenu: boolean;
    pdfUrl: string | null;
    isRep: boolean;
    onProcessMenu: () => void;
    onManualEntry: () => void;
    onEditActiveMenu: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isProcessing: boolean;
    file: File | null;
    activeMealInfo: any;
    userEmail: string | undefined;
}

export function MenuTab({ 
    todaysMenu, weeklyMenu, timings, loadingMenu, pdfUrl, isRep, 
    onProcessMenu, onManualEntry, onEditActiveMenu, onFileChange, 
    isProcessing, file, activeMealInfo, userEmail 
}: MenuTabProps) {
    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500" id="live-menu">
            {activeMealInfo && (
                <div className="bg-zinc-900 rounded-xl p-5 text-white shadow-xl border-t-4 border-yellow-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Utensils className="h-24 w-24" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">{activeMealInfo.status}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-black capitalize tracking-tight mb-1">{activeMealInfo.meal}</h2>
                            <p className="text-zinc-400 text-sm italic">
                                {timings?.[activeMealInfo.meal] || 'Schedule pending'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-2">
                         {activeMealInfo.items.length > 0 ? (
                            activeMealInfo.items.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 p-2.5 rounded-lg backdrop-blur-sm">
                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                                    <span className="text-sm font-medium">{item}</span>
                                </div>
                            ))
                         ) : (
                            <p className="text-zinc-500 text-[10px] italic">No entry available.</p>
                         )}
                    </div>
                </div>
            )}

            <Tabs defaultValue="today" className="w-full">
                <TabsList className="w-full bg-yellow-100 border border-yellow-200">
                    <TabsTrigger value="today" className="w-1/2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black">Today's Menu</TabsTrigger>
                    <TabsTrigger value="weekly" className="w-1/2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black">Weekly Menu</TabsTrigger>
                </TabsList>
                
                <TabsContent value="today" className="mt-4">
                    {loadingMenu ? (
                        <Card className="h-[400px] flex items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                            <p className="text-muted-foreground text-yellow-700 animate-pulse">Loading menu...</p>
                        </Card>
                    ) : (
                        <MenuCard 
                            menu={todaysMenu} 
                            timings={timings} 
                            userId={userEmail}
                        />
                    )}
                </TabsContent>

                <TabsContent value="weekly" className="mt-4">
                    {loadingMenu ? (
                        <Card className="h-[400px] flex items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                            <p className="text-muted-foreground text-yellow-700 animate-pulse">Loading menu...</p>
                        </Card>
                    ) : (
                        <div className="bg-white border rounded-xl overflow-x-auto shadow-sm">
                            <table className="w-full border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-zinc-900 text-white">
                                        <th className="p-3 text-[10px] font-black uppercase text-left border-r border-zinc-700 w-24">Meal Slot</th>
                                        {daysOfWeek.map(day => (
                                            <th key={day} className="p-3 text-[10px] font-black uppercase text-center border-r border-zinc-700 last:border-r-0">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((meal, mIdx) => (
                                        <tr key={meal} className={mIdx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                                            <td className="p-3 border-r border-zinc-100 align-middle bg-zinc-50/80">
                                                <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider inline-block">{meal}</span>
                                            </td>
                                            {daysOfWeek.map(day => {
                                                const items = weeklyMenu?.[day]?.[meal] || [];
                                                return (
                                                    <td key={`${day}-${meal}`} className="p-2 border-r border-zinc-100 last:border-r-0 align-top h-24">
                                                        <div className="flex flex-col gap-1">
                                                            {items.length > 0 ? (
                                                                items.slice(0, 5).map((item: string, i: number) => (
                                                                    <div key={i} className="text-[10px] leading-tight text-zinc-600 bg-white px-1.5 py-0.5 rounded border border-zinc-100 shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.05)] truncate">
                                                                        {item}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <span className="text-[9px] text-zinc-300 italic">No entry</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <Card className="border-t-4 border-t-yellow-400 shadow-md">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">Official Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between group hover:border-yellow-400 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-md"><Utensils className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm font-bold text-zinc-900">Weekly Mess Menu</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-medium">Excel Format (.xlsx)</p>
                            </div>
                        </div>
                        <Button variant="secondary" className="bg-zinc-900 text-white hover:bg-zinc-800" onClick={() => window.open('/mess_menu.xlsx', '_blank')}>Download</Button>
                    </div>

                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between group hover:border-blue-400 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-md"><Clock className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm font-bold text-zinc-900">Mess Timings</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-medium">Excel Format (.xlsx)</p>
                            </div>
                        </div>
                        <Button variant="secondary" className="bg-zinc-900 text-white hover:bg-zinc-800" onClick={() => window.open('/mess_timing.xlsx', '_blank')}>Download</Button>
                    </div>

                    {pdfUrl && (
                        <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => window.open(pdfUrl, '_blank')}>View Current Official PDF</Button>
                    )}
                    
                    {isRep && (
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mt-4 flex flex-col gap-4">
                            <div>
                                <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-3">Upload Menu File</p>
                                <input 
                                    type="file" 
                                    accept="application/pdf,image/*,.xlsx"
                                    onChange={onFileChange}
                                    className="text-sm w-full mb-3"
                                />
                                <Button 
                                    onClick={onProcessMenu}
                                    disabled={!file || isProcessing}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                                >
                                    {isProcessing ? 'Extracting Text...' : 'Smart Parse Menu'}
                                </Button>
                            </div>
                            <Button variant="outline" onClick={onEditActiveMenu} className="w-full border-yellow-300">Edit Currently Live Menu</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
