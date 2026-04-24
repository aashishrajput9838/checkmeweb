import { LayoutDashboard, Vote, Utensils, CalendarDays, TrendingUp, CalendarCheck, UserCheck, ShieldAlert, BarChart3 as ChartBar } from 'lucide-react';
import React from 'react';
import { resolveUserRole } from '@/lib/roles';

export function useNavigation(user: any, firestoreRole?: string | null) {
  const role = resolveUserRole(user?.email, firestoreRole);
  
  const isStudent = role === 'student' || role === 'representative';
  const isStaff = role === 'staff';
  const isWarden = role === 'warden';
  const isAdmin = role === 'admin';

  const navItems = [
    ...(isStudent ? [
      { title: 'Students Hub', href: '/dashboard/student', icon: React.createElement(LayoutDashboard, { className: "h-4 w-4" }) },
      { title: 'Monthly Vote', href: '/dashboard/student?tab=voting', icon: React.createElement(Vote, { className: "h-4 w-4" }) },
      { title: 'Live Menu', href: '/dashboard/student?tab=menu', icon: React.createElement(Utensils, { className: "h-4 w-4" }) },
      { title: 'Food Polls', href: '/dashboard/student?tab=polls', icon: React.createElement(Vote, { className: "h-4 w-4" }) },
      { title: 'My Attendance', href: '/dashboard/student?tab=attendance', icon: React.createElement(CalendarDays, { className: "h-4 w-4" }) }
    ] : []),
    ...(isStaff ? [
      { title: 'Mess Analytics', href: '/dashboard/mess?tab=overview', icon: React.createElement(TrendingUp, { className: "h-4 w-4" }) },
      { title: 'Daily Menu Mgr', href: '/dashboard/mess?tab=menu', icon: React.createElement(Utensils, { className: "h-4 w-4" }) },
      { title: 'Stock Inventory', href: '/dashboard/mess?tab=inventory', icon: React.createElement(ChartBar, { className: "h-4 w-4" }) },
      { title: 'Survey Station', href: '/dashboard/mess?tab=survey', icon: React.createElement(Vote, { className: "h-4 w-4" }) }
    ] : []),
    ...(isWarden ? [
      { title: 'Take Attendance', href: '/dashboard/warden?tab=attendance', icon: React.createElement(CalendarCheck, { className: "h-4 w-4" }) },
      { title: 'Food Sentiment', href: '/dashboard/warden?tab=analytics', icon: React.createElement(ChartBar, { className: "h-4 w-4" }) }
    ] : []),
    ...(isAdmin ? [
      { title: 'Admin Dashboard', href: '/dashboard/admin', icon: React.createElement(ShieldAlert, { className: "h-4 w-4" }) },
      { title: 'Warden Center', href: '/dashboard/warden', icon: React.createElement(UserCheck, { className: "h-4 w-4" }) }
    ] : [])
  ];

  return { navItems };
}
