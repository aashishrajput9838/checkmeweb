'use client'

import { Home, Library, Plus, ClipboardList, User, Volume2, Edit2, Circle, Users, UserCheck, Utensils } from 'lucide-react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/protected-route'
import { GoogleSignIn } from '@/components/google-signin'
import { UserAvatar } from '@/components/user-avatar'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  
  const isStudent = user?.email?.includes('@ug.sharda.ac.in');

  useEffect(() => {
    if (!user) return;

    const checkRoleAndRedirect = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.email!));
        const role = userDoc.exists() ? userDoc.data()?.role : 'student';

        if (role === 'admin') router.push('/dashboard/admin');
        else if (role === 'warden') router.push('/dashboard/warden');
        else if (role === 'staff') router.push('/dashboard/mess');
        else if (role === 'representative' || role === 'student') {
            // Only redirect if they are on the root path
            if (window.location.pathname === '/') router.push('/dashboard/student');
        }
      } catch (error) {
        console.error("Redirection error:", error);
      }
    };

    checkRoleAndRedirect();
  }, [user, router]);

  if (user?.email === 'admin@checkme.com') return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-yellow-300 flex items-center justify-center p-6">
        {/* Main Container */}
        <div className="relative w-full max-w-6xl bg-black rounded-3xl overflow-hidden shadow-2xl">

          {/* Geometric Background Shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Orange shape - left */}
            <div className="absolute left-0 top-1/4 w-64 h-96 bg-orange-500 rounded-full blur-3xl opacity-60"></div>

            {/* Yellow geometric shapes */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 900">
              {/* Yellow triangles and shapes */}
              <polygon points="200,100 500,200 300,400" fill="#FFFF00" opacity="0.3" />
              <polygon points="700,100 1000,150 900,350" fill="#FFFF00" opacity="0.25" />
              <polygon points="150,500 400,600 250,800" fill="#FF6B00" opacity="0.2" />
              <polygon points="800,400 1100,450 1000,700" fill="#CCFF00" opacity="0.3" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 p-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  CM
                </div>
                <span className="text-white text-2xl font-bold">CheckMe</span>
              </div>

              {/* Center Navigation */}
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition">
                  Dashboard
                </button>
                <button className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-full hover:bg-gray-600 transition">
                  My Status
                </button>
              </div>

              {/* Full Power & Auth */}
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <Volume2 size={24} />
                  <span className="font-semibold">Full Access</span>
                </div>
                <GoogleSignIn />
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-4 gap-6 mb-8">

              {/* Get Started Card - Large */}
              <Link href="/dashboard/student" className="col-span-1 bg-white rounded-2xl p-6 flex flex-col justify-between h-80 relative hover:shadow-lg transition-shadow cursor-pointer">
                <div>
                  <h2 className="text-4xl font-bold text-black mb-2">Getting Started</h2>
                  <p className="text-gray-600 text-sm">View menus and manage attendance</p>
                </div>

                {/* Stylus Image Placeholder */}
                <div className="relative h-40 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 150" fill="none">
                      {/* Hand holding stylus - simple representation */}
                      <path d="M 30 80 Q 25 100 35 130 M 30 80 L 50 30 L 52 20 M 50 30 Q 45 35 40 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 52 20 Q 60 25 65 35 M 52 20 L 48 15" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* D Badge */}
                <UserAvatar />
              </Link>

              {/* Tutorial Cards - Middle Column */}
              <div className="col-span-1 flex flex-col gap-6">

                {/* Student Dashboard */}
                <Link href="/dashboard/student" className="bg-white border-4 border-yellow-400 rounded-2xl p-5 relative h-48 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Student</p>
                      <h3 className="text-lg font-bold text-black">Student Dashboard</h3>
                    </div>
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="flex justify-center items-center h-32">
                    <div className="text-5xl">🎓</div>
                  </div>
                </Link>

                {/* Warden Dashboard */}
                {!isStudent && (
                  <Link href="/dashboard/warden" className="bg-white border-4 border-yellow-400 rounded-2xl p-5 relative h-48 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Warden</p>
                        <h3 className="text-lg font-bold text-black">Warden Dashboard</h3>
                      </div>
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white">
                        <UserCheck size={16} />
                      </div>
                    </div>
                    <div className="flex justify-center items-center h-32">
                      <div className="text-5xl">📋</div>
                    </div>
                  </Link>
                )}
              </div>

              {/* Project Cards - Right Columns */}
              <div className="col-span-2 grid grid-cols-2 gap-6">

                {/* Smart Analytics */}
                <Link href="/dashboard/student" className="bg-gray-900 rounded-2xl p-6 text-white flex flex-col justify-between h-80 hover:shadow-lg transition-shadow">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Students Feature</p>
                    <h3 className="text-2xl font-bold">Vote & Analytics</h3>
                  </div>
                  <div className="flex justify-center items-center h-40">
                    <div className="text-7xl">📊</div>
                  </div>
                  <div className="absolute top-6 right-6 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600">
                    <Edit2 size={18} />
                  </div>
                </Link>

                {/* Mess Dashboard */}
                {!isStudent && (
                  <Link href="/dashboard/mess" className="bg-gray-900 rounded-2xl p-6 text-white flex flex-col justify-between h-80 hover:shadow-lg transition-shadow">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Mess Staff</p>
                      <h3 className="text-2xl font-bold">Mess Dashboard</h3>
                    </div>
                    <div className="flex justify-center items-center h-40">
                      <div className="text-7xl">🍳</div>
                    </div>
                    <div className="absolute top-6 right-6 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600">
                      <Utensils size={18} />
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mb-8">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-center gap-8 bg-gray-950 rounded-full py-4 px-8 mx-auto w-fit">
              <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition">
                <Home size={24} />
                <span className="text-xs">Home</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition">
                <Library size={24} />
                <span className="text-xs">Menu</span>
              </button>
              <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition shadow-lg">
                <Plus size={28} />
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition">
                <ClipboardList size={24} />
                <span className="text-xs">Reports</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition">
                <User size={24} />
                <span className="text-xs">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
