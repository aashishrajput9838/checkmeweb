"use client";

import { useState, useEffect } from "react";
import { GoogleSignIn } from "@/components/google-signin";
import { IDSignIn, RoleBasedSignIn } from "@/components/id-signin";
import { AdminLogin } from "@/components/admin-login";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [loginRole, setLoginRole] = useState<'student' | 'staff' | 'warden' | 'admin'>('student');

    useEffect(() => {
        if (!loading && user) {
            if (user.email === 'admin@checkme.com') {
                router.push('/dashboard/admin'); 
            } else if (user.email === 'staff@checkme.com') {
                router.push('/dashboard/mess');
            } else if (user.email === 'warden@checkme.com') {
                router.push('/dashboard/warden');
            } else {
                router.push("/dashboard/student");
            }
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen bg-yellow-300 flex items-center justify-center p-6">
            <div className="bg-black text-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome to CheckMe</h1>
                <p className="text-gray-400 mb-6">Sign in to access your dashboard, view menus, and manage attendance.</p>
                
                <div className="flex bg-zinc-900 rounded-lg p-1 mb-8">
                    <button 
                        className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all ${loginRole === 'student' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                        onClick={() => setLoginRole('student')}
                    >
                        Student
                    </button>
                    <button 
                        className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all ${loginRole === 'staff' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                        onClick={() => setLoginRole('staff')}
                    >
                        Staff
                    </button>
                    <button 
                        className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all ${loginRole === 'warden' ? 'bg-blue-500 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                        onClick={() => setLoginRole('warden')}
                    >
                        Warden
                    </button>
                    <button 
                        className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all ${loginRole === 'admin' ? 'bg-red-500 text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                        onClick={() => setLoginRole('admin')}
                    >
                        Admin
                    </button>
                </div>

                <div className="flex justify-center min-h-[160px] items-center">
                    {loginRole === 'student' ? (
                        <div className="space-y-4 w-full">
                            <div className="flex flex-col space-y-4">
                                <GoogleSignIn />
                                <IDSignIn />
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-zinc-800"></span>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-black px-2 text-zinc-500 font-bold tracking-widest">or</span>
                                    </div>
                                </div>
                                <AdminLogin role="student" />
                            </div>
                            <p className="text-[10px] text-zinc-500 italic mt-4">Only @ug.sharda.ac.in emails allowed for Google Sign-in</p>
                        </div>
                    ) : (
                        <div className="w-full space-y-4">
                            <RoleBasedSignIn role={loginRole} />
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-800"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-black px-2 text-zinc-500 font-bold tracking-widest">or</span>
                                </div>
                            </div>
                            <AdminLogin role={loginRole as 'staff' | 'warden' | 'admin'} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
