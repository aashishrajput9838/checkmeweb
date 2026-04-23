'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, UserCheck, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/protected-route';
import { GoogleSignIn } from '@/components/google-signin';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Student Dashboard',
      href: '/dashboard/student',
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: 'Warden Dashboard',
      href: '/dashboard/warden',
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      title: 'Mess Dashboard',
      href: '/dashboard/mess',
      icon: <Utensils className="h-4 w-4" />,
    },
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
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="mt-auto p-4 border-t">
              <GoogleSignIn />
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
          <div className="grid grid-cols-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-3 text-xs ${pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
                  }`}
              >
                <div className="mb-1">{item.icon}</div>
                {item.title.split(' ')[0]}
              </Link>
            ))}
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