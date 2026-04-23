'use client'

import { Utensils, CalendarCheck, Vote, ShieldCheck, ChevronRight, Star, ArrowRight, Zap, Layers, Linkedin, Github } from 'lucide-react'
import Link from 'next/link'
import { GoogleSignIn } from '@/components/google-signin'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Footer } from '@/components/landing/Footer'

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!user || loading) return;

    const checkRoleAndRedirect = async () => {
      setIsRedirecting(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.email!));
        const role = userDoc.exists() ? userDoc.data()?.role : 'student';

        if (role === 'admin') router.push('/dashboard/admin');
        else if (role === 'warden') router.push('/dashboard/warden');
        else if (role === 'staff') router.push('/dashboard/mess');
        else router.push('/dashboard/student');
      } catch (error) {
        console.error("Redirection error:", error);
        setIsRedirecting(false);
      }
    };

    checkRoleAndRedirect();
  }, [user, loading, router]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-zinc-400 font-medium animate-pulse">Entering the hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-yellow-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black text-lg shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              CM
            </div>
            <span className="text-2xl font-black tracking-tight uppercase italic">CheckMe</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
            <a href="#features" className="hover:text-yellow-500 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-yellow-500 transition-colors">Process</a>
            <a href="#impact" className="hover:text-yellow-500 transition-colors">Impact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-6 py-2 text-sm font-bold uppercase tracking-widest text-white border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all"
            >
              Login
            </Link>
            <GoogleSignIn />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full text-yellow-500 text-xs font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap size={14} className="fill-yellow-500" /> 
            Revolutionizing Hostel Life
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            YOUR MESS, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-orange-500">SMARTER.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-zinc-400 font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            Digitizing Sharda University's Mess Ecosystem. Live Menus, Real-time Attendance, and Democratic Meal Selection — all in one premium hub.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Link 
              href="/login" 
              className="px-8 h-14 bg-white text-black rounded-2xl flex items-center justify-center font-black hover:bg-yellow-500 transition-all shadow-xl"
            >
              Login with ID
            </Link>
            <GoogleSignIn />
            <button className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold transition-all group">
              Explore the Features <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="group bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-yellow-500/30 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-500/20 transition-all"></div>
              <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center text-black mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/20">
                <Utensils size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Digital Menu Hub</h3>
              <p className="text-zinc-400 leading-relaxed font-medium">
                No more paper menus. View live, weekly schedules with smart parsing technology. AI-powered OCR keeps the menu updated in seconds.
              </p>
            </div>

            <div className="group bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all"></div>
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                <CalendarCheck size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Smart Attendance</h3>
              <p className="text-zinc-400 leading-relaxed font-medium">
                Wardens track attendance effortlessly. Students view their history. Data-driven insights help mess staff minimize food waste.
              </p>
            </div>

            <div className="group bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-orange-500/30 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-all"></div>
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                <Vote size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">Democratic Voting</h3>
              <p className="text-zinc-400 leading-relaxed font-medium">
                Your plate, your voice. Cast monthly votes for Sunday specials and rate every meal to shape the future of hostel dining.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section id="impact" className="py-24 bg-white/[0.02] border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <p className="text-4xl font-black text-yellow-500 mb-2">2500+</p>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Active Students</p>
            </div>
            <div>
              <p className="text-4xl font-black text-yellow-500 mb-2">98%</p>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Feedback Rate</p>
            </div>
            <div>
              <p className="text-4xl font-black text-yellow-500 mb-2">15+</p>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Daily Menus</p>
            </div>
            <div>
              <p className="text-4xl font-black text-yellow-500 mb-2">Zero</p>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Paper Waste</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 md:p-16 backdrop-blur-xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square rounded-[2rem] overflow-hidden border-4 border-yellow-500/20 shadow-2xl">
                <img 
                  src="https://github.com/aashishrajput9838.png" 
                  alt="Aashish Rajput" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-yellow-500 text-black p-6 rounded-2xl shadow-xl">
                <p className="text-sm font-black uppercase tracking-widest leading-none mb-1">Founded By</p>
                <p className="text-xl font-black italic">Aashish Rajput</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                The Architect
              </div>
              <h2 className="text-4xl font-black tracking-tight leading-tight">
                "TURNING IDEAS INTO <br />
                <span className="text-yellow-500 italic">MEANINGFUL CODE.</span>"
              </h2>
              <p className="text-zinc-400 font-medium leading-relaxed italic">
                "UI obsessed and logic driven. I write clean code like poetry, with purpose and precision. CheckMe was born from the need to solve real-world campus problems with elegant engineering."
              </p>
              <div className="pt-6 flex items-center gap-6">
                <a 
                  href="https://aspirinexar.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 h-14 bg-white text-black rounded-2xl flex items-center justify-center font-black hover:bg-yellow-500 transition-all shadow-xl"
                >
                  View Portfolio
                </a>
                <div className="flex gap-4">
                  <a href="https://linkedin.com/in/aashishrajput9838" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all">
                    <Linkedin size={20} />
                  </a>
                  <a href="https://github.com/aashishrajput9838" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all">
                    <Github size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-yellow-500 to-orange-600 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black/10 opacity-50 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-black mb-8 leading-tight">
              READY TO <br />UPGRADE YOUR LIFE?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link 
                href="/login" 
                className="px-12 h-16 bg-black text-white rounded-2xl flex items-center justify-center font-black hover:bg-zinc-900 transition-all shadow-2xl"
              >
                Login with ID
              </Link>
              <GoogleSignIn />
            </div>
            <p className="mt-8 text-black/60 font-bold uppercase tracking-widest text-xs">
              Exclusive for Sharda University Students & Staff
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
