import React from 'react';
import { StaticPageLayout } from '@/components/landing/StaticPageLayout';
import { Mail, MessageSquare, ShieldQuestion, UserCheck } from 'lucide-react';

export default function SupportPage() {
  return (
    <StaticPageLayout 
        title="Support Hub" 
        subtitle="We're here to help you navigate"
    >
      <section className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/5 p-8 rounded-3xl">
                <Mail className="text-yellow-500 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Direct Support</h3>
                <p className="text-sm text-zinc-400 mb-6">Found a bug or need technical assistance? Email our technical lead directly.</p>
                <a href="mailto:aashishrajput9838@gmail.com" className="text-yellow-500 font-bold hover:underline italic">aashishrajput9838@gmail.com</a>
            </div>

            <div className="bg-white/5 border border-white/5 p-8 rounded-3xl">
                <ShieldQuestion className="text-blue-500 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Access Issues</h3>
                <p className="text-sm text-zinc-400 mb-6">Getting "Permission Denied"? Ensure you are logged in with your Sharda University email.</p>
                <button className="px-6 h-10 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition">Check My Role</button>
            </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-6">
                <h4 className="text-lg font-bold text-yellow-500 mb-2 uppercase tracking-tight">How do I mark my attendance?</h4>
                <p className="text-zinc-400">Attendance is marked by the Warden during meal times. You can verify your records in the 'My Attendance' tab in your Student Hub.</p>
            </div>
            <div className="border-b border-white/5 pb-6">
                <h4 className="text-lg font-bold text-yellow-500 mb-2 uppercase tracking-tight">When can I vote for Sunday specials?</h4>
                <p className="text-zinc-400">Monthly surveys open in the last week of every month. Sunday food polls are live every weekend.</p>
            </div>
            <div className="border-b border-white/5 pb-6">
                <h4 className="text-lg font-bold text-yellow-500 mb-2 uppercase tracking-tight">I am a Mess Rep, how do I upload a menu?</h4>
                <p className="text-zinc-400">Once your role is assigned by the Admin, you will see an "Upload Menu" button in your Student Hub's Menu section.</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500 p-8 rounded-[2rem] text-black text-center">
            <h3 className="text-2xl font-black mb-2 uppercase italic">Need Urgent Help?</h3>
            <p className="font-bold mb-6">Visit the Warden Office at Sharda University, Knowledge Park 3.</p>
            <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest">
                    <UserCheck size={14} /> Warden Hub
                </div>
                <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest">
                    <MessageSquare size={14} /> Mess Station
                </div>
            </div>
        </div>
      </section>
    </StaticPageLayout>
  );
}
