"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export function GoogleSignIn() {
    const { user, loading } = useAuth();

    const handleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    if (loading) {
        return <button disabled className="px-4 py-2 border rounded-md opacity-50 cursor-not-allowed">Loading...</button>;
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{user.displayName}</span>
                <button
                    className="px-4 py-2 text-sm border rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={handleSignOut}
                >
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <button
            className="px-4 py-2 text-sm text-white bg-black border rounded-md dark:bg-white dark:text-black hover:opacity-90"
            onClick={handleSignIn}
        >
            Sign in with Google
        </button>
    );
}
