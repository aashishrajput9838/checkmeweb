import React from 'react';
import { Github, Twitter, Mail, Heart, Linkedin, Globe, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black">CM</div>
            <span className="text-2xl font-black text-white tracking-tight uppercase italic">CheckMe</span>
          </div>
          <p className="text-zinc-400 max-w-sm leading-relaxed mb-8">
            Revolutionizing the college hostel experience with smart mess management, 
            real-time attendance, and democratic meal planning.
          </p>
          <div className="flex gap-4">
            <a href="https://github.com/aashishrajput9838" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-yellow-500 hover:text-black transition-all text-zinc-400 group">
              <Github size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a href="https://linkedin.com/in/aashishrajput9838" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-blue-500 hover:text-white transition-all text-zinc-400 group">
              <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a href="https://aspirinexar.vercel.app/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-green-500 hover:text-white transition-all text-zinc-400 group">
              <Globe size={20} className="group-hover:scale-110 transition-transform" />
            </a>
            <a href="mailto:aashishrajput9838@gmail.com" className="p-3 bg-white/5 rounded-xl hover:bg-red-500 hover:text-white transition-all text-zinc-400 group">
              <Mail size={20} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.3em] text-yellow-500">Contact Founder</h4>
          <ul className="space-y-4 text-zinc-400 text-sm">
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-yellow-500" />
              <a href="mailto:aashishrajput9838@gmail.com" className="hover:text-white transition">aashishrajput9838@gmail.com</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-yellow-500" />
              <a href="tel:+919319977285" className="hover:text-white transition">+91 9319977285</a>
            </li>
            <li className="flex items-start gap-3">
              <Globe size={16} className="text-yellow-500 mt-1" />
              <span className="leading-tight">Greater Noida, UP<br />Knowledge Park 3</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.3em] text-yellow-500">Navigation</h4>
          <ul className="space-y-4 text-zinc-400 text-sm">
            <li><a href="#features" className="hover:text-white transition">Features</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition">Support Hub</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} CheckMe Ecosystem. Engineered for Excellence.
        </p>
        <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold">
          <span>Developed with</span>
          <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" />
          <span>by</span>
          <a href="https://aspirinexar.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline decoration-2 underline-offset-4">Aashish Rajput</a>
        </div>
      </div>
    </footer>
  );
}
