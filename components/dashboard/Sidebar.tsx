import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { GoogleSignIn } from '@/components/google-signin';

interface SidebarProps {
    navItems: any[];
}

export function Sidebar({ navItems }: SidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'overview';

    return (
        <>
            {/* Desktop Sidebar */}
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
                                            isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
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
                <div className={`grid ${navItems.length === 1 ? "grid-cols-1" : "grid-cols-3"}`}>
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
                                    isActive ? 'text-primary' : 'text-muted-foreground'
                                }`}
                            >
                                <div className="mb-1">{item.icon}</div>
                                {item.title.split(' ')[0]}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
