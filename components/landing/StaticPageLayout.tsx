import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Footer } from './Footer';

interface StaticPageLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export function StaticPageLayout({ title, subtitle, children }: StaticPageLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-yellow-500/30">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-black text-sm group-hover:scale-110 transition-transform">
              CM
            </div>
            <span className="text-xl font-black tracking-tight uppercase italic">CheckMe</span>
          </Link>
          
          <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-yellow-500 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase italic">
              {title}
            </h1>
            <p className="text-xl text-yellow-500 font-bold uppercase tracking-widest">
              {subtitle}
            </p>
          </div>

          <div className="prose prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:text-zinc-400 prose-p:leading-relaxed prose-strong:text-white prose-li:text-zinc-400">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
