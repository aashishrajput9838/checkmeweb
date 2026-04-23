"use client";

import { useState, useEffect } from "react";
import { GoogleSignIn } from "@/components/google-signin";
import { AdminLogin } from "@/components/admin-login";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAdminMode, setIsAdminMode] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            // Basic role routing - if they are admin@checkme.com go to admin route
            if (user.email === 'admin@checkme.com') {
                router.push('/dashboard/admin'); // Redirect admins to their specific dashboard
            } else {
                router.push("/");
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
                        className={`flex-1 py-2 rounded-md transition-colors ${!isAdminMode ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                        onClick={() => setIsAdminMode(false)}
                    >
                        Student / Staff
                    </button>
                    <button 
                        className={`flex-1 py-2 rounded-md transition-colors ${isAdminMode ? 'bg-zinc-800 text-yellow-500 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white'}`}
                        onClick={() => setIsAdminMode(true)}
                    >
                        Admin
                    </button>
                </div>

                <div className="flex justify-center min-h-[140px] items-center">
                    {isAdminMode ? (
                        <div className="w-full">
                            <AdminLogin />
                        </div>
                    ) : (
                        <GoogleSignIn />
                    )}
                </div>
            </div>
        </div>
    )
}
