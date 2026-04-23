import React from 'react';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-bold">CM</div>
            <span className="text-xl font-bold text-white tracking-tight">CheckMe</span>
          </div>
          <p className="text-zinc-400 max-w-sm leading-relaxed mb-6">
            Revolutionizing the college hostel experience with smart mess management, 
            real-time attendance, and democratic meal planning.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-yellow-500 hover:text-black transition-all text-zinc-400">
              <Github size={20} />
            </a>
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-yellow-500 hover:text-black transition-all text-zinc-400">
              <Twitter size={20} />
            </a>
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-yellow-500 hover:text-black transition-all text-zinc-400">
              <Mail size={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Platform</h4>
          <ul className="space-y-4 text-zinc-400 text-sm">
            <li><a href="#features" className="hover:text-yellow-500 transition">Features</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition">Live Menu</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition">Attendance Hub</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition">Voting Station</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Legal</h4>
          <ul className="space-y-4 text-zinc-400 text-sm">
            <li><a href="#" className="hover:text-yellow-500 transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition">Hostel Guidelines</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-zinc-500 text-xs">
          © {new Date().getFullYear()} CheckMe. All rights reserved.
        </p>
        <p className="text-zinc-500 text-xs flex items-center gap-1">
          Made with <Heart size={12} className="text-red-500 fill-red-500" /> by Sharda University Students
        </p>
      </div>
    </footer>
  );
}
