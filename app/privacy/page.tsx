import React from 'react';
import { StaticPageLayout } from '@/components/landing/StaticPageLayout';

export default function PrivacyPage() {
  return (
    <StaticPageLayout 
        title="Privacy Policy" 
        subtitle="How we protect your hostel data"
    >
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">1. Introduction</h2>
          <p>
            Welcome to CheckMe. We are committed to protecting your personal information and your right to privacy. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our mess management platform.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">2. Information We Collect</h2>
          <p>We collect information that you provide directly to us through Sharda University's authentication system:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Personal Identifiers:</strong> Name, Sharda University email address, and profile picture.</li>
            <li><strong>Hostel Data:</strong> Room information (synced from Warden Hub) and attendance history.</li>
            <li><strong>Interaction Data:</strong> Meal feedback, survey votes, and poll participation.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">3. How We Use Your Data</h2>
          <p>Your data is used strictly for improving hostel operations:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>To manage and verify mess attendance.</li>
            <li>To analyze food preferences and reduce waste.</li>
            <li>To facilitate democratic voting for Sunday specials.</li>
            <li>To provide personalized notifications from the Warden.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">4. Data Security</h2>
          <p>
            We implement robust security measures via Google Firebase. Your data is protected by Role-Based Access Control (RBAC), 
            ensuring that only authorized staff (Wardens, Mess Staff) can view specific data relevant to their roles.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">5. Contact Us</h2>
          <p>
            If you have questions about this policy, please contact our founder, Aashish Rajput, at 
            <a href="mailto:aashishrajput9838@gmail.com" className="text-yellow-500 hover:underline ml-1">aashishrajput9838@gmail.com</a>.
          </p>
        </div>
      </section>
    </StaticPageLayout>
  );
}
