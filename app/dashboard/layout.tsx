'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/protected-route';
import { useNavigation } from '@/hooks/dashboard/useNavigation';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { navItems } = useNavigation(user);

  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading dashboard...</div>}>
        <div className="min-h-screen bg-background">
          <Sidebar navItems={navItems} />
          <main className="md:ml-64 md:pt-10 pb-20 md:pb-10">
            <div className="container max-w-7xl p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </Suspense>
    </ProtectedRoute>
  );
}