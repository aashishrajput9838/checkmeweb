"use client";

import { useState, useEffect } from "react";
import { GoogleSignIn } from "@/components/google-signin";
import { AdminLogin } from "@/components/admin-login";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [loginRole, setLoginRole] = useState<'student' | 'staff' | 'admin'>('student');

    useEffect(() => {
        if (!loading && user) {
            if (user.email === 'admin@checkme.com') {
                router.push('/dashboard/admin'); 
            } else if (user.email === 'staff@checkme.com') {
                router.push('/dashboard/mess');
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
                        className={`flex-1 py-2 text-xs rounded-md transition-colors ${loginRole === 'student' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                        onClick={() => setLoginRole('student')}
                    >
                        Student
                    </button>
                    <button 
                        className={`flex-1 py-2 text-xs rounded-md transition-colors ${loginRole === 'staff' ? 'bg-yellow-500 text-black shadow-sm font-semibold' : 'text-zinc-400 hover:text-white'}`}
                        onClick={() => setLoginRole('staff')}
                    >
                        Staff
                    </button>
                    <button 
                        className={`flex-1 py-2 text-xs rounded-md transition-colors ${loginRole === 'admin' ? 'bg-red-500 text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-white'}`}
                        onClick={() => setLoginRole('admin')}
                    >
                        Admin
                    </button>
                </div>

                <div className="flex justify-center min-h-[160px] items-center">
                    {loginRole === 'student' ? (
                        <div className="space-y-4 w-full">
                            <GoogleSignIn />
                            <p className="text-[10px] text-zinc-500 italic">Only @ug.sharda.ac.in emails allowed</p>
                        </div>
                    ) : (
                        <div className="w-full">
                            <AdminLogin isStaff={loginRole === 'staff'} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
