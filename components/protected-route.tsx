"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [roleLoading, setRoleLoading] = useState(!!allowedRoles);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        if (!allowedRoles) {
            setAuthorized(true);
            setRoleLoading(false);
            return;
        }

        // Check Role if restricted
        const checkRole = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.email!));
                const userRole = userDoc.exists() ? userDoc.data()?.role : 'student';
                
                if (allowedRoles.includes(userRole)) {
                    setAuthorized(true);
                } else {
                    router.push("/dashboard/student?error=unauthorized");
                }
            } catch (error) {
                console.error("RBAC Check Error:", error);
                router.push("/login");
            } finally {
                setRoleLoading(false);
            }
        };

        checkRole();
    }, [user, authLoading, allowedRoles, router]);

    if (authLoading || roleLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-sm text-muted-foreground font-medium animate-pulse">Verifying credentials...</p>
            </div>
        );
    }

    if (!user || !authorized) {
        return null; 
    }

    return <>{children}</>;
}
