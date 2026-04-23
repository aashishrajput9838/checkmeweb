import React from 'react';
import { StaticPageLayout } from '@/components/landing/StaticPageLayout';
import { Code2, Palette, Terminal, Cpu, Award, Milestone } from 'lucide-react';

export default function AboutPage() {
  return (
    <StaticPageLayout 
        title="Meet the Founder" 
        subtitle="Aashish Rajput - Architect of CheckMe"
    >
      <section className="space-y-16">
        <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-full md:w-1/3">
                <div className="aspect-square rounded-[3rem] overflow-hidden border-8 border-yellow-500/10 shadow-2xl relative group">
                    <img 
                        src="https://github.com/aashishrajput9838.png" 
                        alt="Aashish Rajput" 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </div>
            
            <div className="w-full md:w-2/3 space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Who am I?</h2>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    I am <span className="text-white font-bold">Aashish Rajput</span>, a developer who believes that software should be as beautiful as it is functional. 
                    I'm obsessed with UI details and driven by logic. My mission with CheckMe is to replace outdated manual systems with elegant, automated solutions 
                    that actually work for the people using them.
                </p>
                <div className="flex flex-wrap gap-3 pt-4">
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-yellow-500">Full Stack Dev</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-yellow-500">UI/UX Designer</span>
                    <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-yellow-500">Logic Enthusiast</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:border-yellow-500/30 transition-all group">
                <Terminal className="text-yellow-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">Tech Stack</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    Proficient in <span className="text-white">Java, Python, and Modern Web Technologies</span>. 
                    I leverage Firebase for scalable backends and Next.js for high-performance frontends.
                </p>
            </div>

            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group">
                <Palette className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">Design Philosophy</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    "Clean code like poetry." I prioritize clarity, maintainability, and a premium aesthetic in everything I build.
                </p>
            </div>

            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:border-orange-500/30 transition-all group">
                <Award className="text-orange-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">Achievements</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    GitHub <span className="text-white">Pull Shark & YOLO</span> achiever. Active contributor to open source and constant learner of new tech paradigms.
                </p>
            </div>
        </div>

        <div className="relative p-12 bg-gradient-to-br from-zinc-900 to-black rounded-[3rem] border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
            <div className="relative z-10 text-center space-y-6">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">The Vision</h2>
                <p className="max-w-2xl mx-auto text-zinc-400 font-medium">
                    CheckMe isn't just a mess management app; it's a statement. It's about bringing the same level of digital excellence to campus life 
                    that we expect from top-tier consumer apps. No more friction, just precision.
                </p>
                <div className="pt-6">
                    <a href="https://aspirinexar.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-yellow-500 font-black uppercase tracking-[0.2em] text-sm hover:gap-4 transition-all">
                        Explore My Work <Milestone size={16} />
                    </a>
                </div>
            </div>
        </div>
      </section>
    </StaticPageLayout>
  );
}
