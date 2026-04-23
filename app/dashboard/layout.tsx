'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Users, UserCheck, Utensils, ShieldAlert, Vote, CalendarDays, LayoutDashboard, CalendarCheck, BarChart3 as ChartBar, TrendingUp, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/protected-route';
import { GoogleSignIn } from '@/components/google-signin';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuspenseWrapper>
      <DashboardSidebar>{children}</DashboardSidebar>
    </SuspenseWrapper>
  );
}

function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const { user } = useAuth();
  const isStudent = user?.email?.includes('@ug.sharda.ac.in');
  const isStaff = user?.email === 'staff@checkme.com';
  const isWarden = user?.email === 'warden@checkme.com';
  const isAdmin = user?.email === 'admin@checkme.com';

  const navItems = [
    ...(isStudent ? [
      {
        title: 'Students Hub',
        href: '/dashboard/student',
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        title: 'Monthly Vote',
        href: '/dashboard/student?tab=voting',
        icon: <Vote className="h-4 w-4" />,
      },
      {
        title: 'Live Menu',
        href: '/dashboard/student?tab=menu',
        icon: <Utensils className="h-4 w-4" />,
      },
      {
        title: 'Food Polls',
        href: '/dashboard/student?tab=polls',
        icon: <Vote className="h-4 w-4" />,
      },
      {
        title: 'My Attendance',
        href: '/dashboard/student?tab=attendance',
        icon: <CalendarDays className="h-4 w-4" />,
      }
    ] : []),
    ...(isStaff ? [
        {
          title: 'Mess Analytics',
          href: '/dashboard/mess?tab=overview',
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: 'Daily Menu Mgr',
          href: '/dashboard/mess?tab=menu',
          icon: <Utensils className="h-4 w-4" />,
        },
        {
          title: 'Stock Inventory',
          href: '/dashboard/mess?tab=inventory',
          icon: <ChartBar className="h-4 w-4" />,
        },
        {
          title: 'Survey Station',
          href: '/dashboard/mess?tab=survey',
          icon: <Vote className="h-4 w-4" />,
        },
        {
            title: 'Live Poll Results',
            href: '/dashboard/student?tab=polls',
            icon: <Vote className="h-4 w-4" />,
        }
      ] : []),
    ...(isWarden ? [
        {
          title: 'Take Attendance',
          href: '/dashboard/warden?tab=attendance',
          icon: <CalendarCheck className="h-4 w-4" />,
        },
        {
          title: 'Food Sentiment',
          href: '/dashboard/warden?tab=analytics',
          icon: <ChartBar className="h-4 w-4" />,
        }
      ] : []),
    ...(isAdmin ? [{
      title: 'Admin Dashboard',
      href: '/dashboard/admin',
      icon: <ShieldAlert className="h-4 w-4" />,
    },
    {
        title: 'Warden Center',
        href: '/dashboard/warden',
        icon: <UserCheck className="h-4 w-4" />,
    },
    {
        title: 'System Polls',
        href: '/dashboard/student?tab=polls',
        icon: <Vote className="h-4 w-4" />,
    }] : [])
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 border-r bg-background md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="text-lg">CheckMe</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map((item) => {
                  const isActive = item.href === pathname || 
                                   (pathname === item.href.split('?')[0] && 
                                    ((currentTab === 'overview' && !item.href.includes('?')) || 
                                     (currentTab !== 'overview' && item.href.includes(`tab=${currentTab}`))));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                        isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="mt-auto p-4 border-t">
              <GoogleSignIn />
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
          <div className={navItems.length === 1 ? "grid grid-cols-1" : "grid grid-cols-3"}>
            {navItems.map((item) => {
              const isActive = item.href === pathname || 
                               (pathname === item.href.split('?')[0] && 
                                ((currentTab === 'overview' && !item.href.includes('?')) || 
                                 (currentTab !== 'overview' && item.href.includes(`tab=${currentTab}`))));
              return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-3 text-xs ${
                  isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
                  }`}
              >
                <div className="mb-1">{item.icon}</div>
                {item.title.split(' ')[0]}
              </Link>
            )})}
          </div>
        </div>

        {/* Main Content */}
        <main className="md:ml-64 md:pt-10 pb-20 md:pb-10">
          <div className="container max-w-7xl p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Wrapper to satisfy Next.js useSearchParams suspense requirement
import React, { Suspense } from 'react';
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading mapping...</div>}>
      {children}
    </Suspense>
  )
}