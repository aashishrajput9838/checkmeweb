import React from 'react';
import { Card } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

interface OverviewTabProps {
    user: any;
    attendanceCount: number;
}

export function OverviewTab({ user, attendanceCount }: OverviewTabProps) {
    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-900 text-white border-none p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-yellow-500 mb-6">Student Profile</h2>
                        <div className="flex items-center gap-6 mb-8">
                            {user?.photoURL ? (
                                <img 
                                    src={user.photoURL} 
                                    alt="Profile" 
                                    className="h-20 w-20 rounded-2xl object-cover border-2 border-yellow-500/50 shadow-lg"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="h-20 w-20 bg-yellow-500 rounded-2xl flex items-center justify-center text-black text-3xl font-black">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-3xl font-black tracking-tight">{user?.email?.split('@')[0]}</p>
                                <p className="text-zinc-400 text-sm">{user?.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-zinc-500">Hostel Role</p>
                                <p className="text-sm font-bold">Resident Student</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-zinc-500">Room Info</p>
                                <p className="text-sm font-bold uppercase">Syncing with Warden Hub</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-blue-600 text-white border-none p-8 rounded-3xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-200 mb-6">Quick Stats</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10">
                                <span className="text-xs">Meal Feedback Given</span>
                                <span className="font-bold">12 Total</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10">
                                <span className="text-xs">Attendance Marked</span>
                                <span className="font-bold">{attendanceCount} Days</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-blue-200 mt-8 tracking-widest">Verification Status: Verified</p>
                </Card>
            </div>

            <div className="mt-8 p-6 bg-zinc-50 rounded-2xl border border-zinc-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-zinc-900 rounded-lg text-white">
                        <LayoutDashboard className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-zinc-900 uppercase">Hub Explorer</h3>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">
                    Welcome to your central hub. Use the sidebar to check the live menu, cast your votes for Sunday specials, or verify your attendance history.
                </p>
            </div>
        </div>
    );
}
