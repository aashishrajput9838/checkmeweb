import React from 'react';
import { StaticPageLayout } from '@/components/landing/StaticPageLayout';

export default function TermsPage() {
  return (
    <StaticPageLayout 
        title="Terms of Service" 
        subtitle="The rules of the CheckMe ecosystem"
    >
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CheckMe, you agree to be bound by these Terms of Service. 
            If you are a student or staff member of Sharda University, you also agree to comply with the official university hostel guidelines.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">2. User Conduct</h2>
          <p>Users must adhere to the following rules:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Authenticity:</strong> You must not impersonate other students or staff.</li>
            <li><strong>Fair Voting:</strong> You must not attempt to manipulate poll results or survey votes.</li>
            <li><strong>Respectful Feedback:</strong> Meal reviews and feedback must be constructive and free of abusive language.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">3. Mess Representative Responsibilities</h2>
          <p>
            Students assigned as Mess Representatives have the authority to upload official menus. 
            Reps are responsible for ensuring the accuracy of the menus they publish to the live hub.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">4. Limitation of Liability</h2>
          <p>
            CheckMe is a tool to facilitate hostel management. While we strive for 100% accuracy in menu parsing and attendance tracking, 
            the university administration remains the final authority on all hostel matters.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">5. Modifications</h2>
          <p>
            We reserve the right to modify these terms at any time. Significant changes will be announced through the 
            Official Warden Notice board within the application.
          </p>
        </div>
      </section>
    </StaticPageLayout>
  );
}
