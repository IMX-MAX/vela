"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f1] text-[#1e1e1e] font-[Inter]">
      <div className="h-14 border-b border-[#e4e3e0] flex items-center px-4 sticky top-0 bg-[#f2f2f1]/90 backdrop-blur-sm z-10">
        <Link href="/login" className="p-2 text-gray-500 hover:text-gray-900 transition rounded-md hover:bg-[#e4e3e0]/50">
          <ArrowLeft size={18} />
        </Link>
        <div className="ml-2 font-medium text-gray-900">Terms of Service</div>
      </div>
      
      <div className="max-w-3xl mx-auto w-full px-8 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Terms of Service for Vela</h1>
        <p className="text-gray-500 mb-8">Last updated: June 22, 2026</p>

        <div className="space-y-8 text-gray-800 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Agreement to Terms</h2>
            <p>By accessing or using our application, Vela, located at vela.nafen.sbs, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Description of Service</h2>
            <p>Vela is an advanced, AI-powered email client built on top of the Gmail API and Composio integrations. It allows users to read, organize, and send emails, and utilizes Vela Intelligence to provide summarization and automated drafting capabilities.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">3. User Accounts & Responsibilities</h2>
            <p>To use Vela, you must sign in using your Google account or a registered email address. You are responsible for safeguarding the password and credentials that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>
            <p className="mt-2">You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Intellectual Property</h2>
            <p>The service and its original content, features, and functionality are and will remain the exclusive property of Vela and its licensors. The service is protected by copyright, trademark, and other laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">5. Disclaimer of Warranties</h2>
            <p>Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis. The service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">6. Limitation of Liability</h2>
            <p>In no event shall Vela, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">7. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
