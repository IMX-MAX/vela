"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-[#eceae6] text-[#1e1e1e] font-[Inter]">
      <div className="h-14 border-b border-[#dddcdc] flex items-center px-4 sticky top-0 bg-[#eceae6]/90 backdrop-blur-sm z-10">
        <Link href="/login" className="p-2 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#dddcdc]/50">
          <ArrowLeft size={18} />
        </Link>
        <div className="ml-2 font-medium text-[#2b323b]">Privacy Policy</div>
      </div>
      
      <div className="max-w-3xl mx-auto w-full px-8 py-12">
        <h1 className="text-3xl font-bold mb-8 text-[#2b323b]">Privacy Policy for Vela</h1>
        <p className="text-gray-500 mb-8">Last updated: June 22, 2026</p>

        <div className="space-y-8 text-gray-800 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">1. Introduction</h2>
            <p>Welcome to Vela ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you as to how we look after your personal data when you visit our application at vela.nafen.sbs (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">2. The Data We Collect About You</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Identity Data:</strong> First name, last name, and profile picture obtained via Google OAuth or standard registration.</li>
              <li><strong>Contact Data:</strong> Your email address.</li>
              <li><strong>Email Data:</strong> The content of your emails, which we access via the Gmail API to display within the application and process using Vela Intelligence for summarization and drafting replies at your explicit request. <strong>We do not persistently store your email content on our servers. Emails are fetched on-demand to display in your client.</strong></li>
              <li><strong>Technical Data:</strong> Authentication tokens required to securely communicate with Google APIs. These are encrypted and stored securely.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>To provide the core functionality of the Vela email client (reading, organizing, and sending emails).</li>
              <li>To allow Vela Intelligence to summarize emails or draft replies. Your email content is securely passed to our Intelligence API for real-time processing and is immediately discarded. <strong>We strictly do not use your data, including Google workspace data, to develop, improve, or train generalized AI and/or ML models.</strong></li>
              <li>To manage our relationship with you, including subscription and billing support.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">4. Third-Party Services & Google API Limited Use</h2>
            <p>Vela utilizes third-party services to function effectively. We share necessary data with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Google:</strong> We use Google OAuth for authentication and the Gmail API to access your mailbox. Vela's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</li>
              <li><strong>Vela Intelligence:</strong> We use Vela Intelligence (powered by trusted third-party LLM providers) to power the intelligent summarization and drafting features. These providers are bound by strict zero-retention policies.</li>
              <li><strong>Appwrite & Stripe:</strong> We use Appwrite Cloud to securely store your session data and encrypted access tokens, and Stripe to process payments.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">5. Data Retention and Deletion</h2>
            <p>We retain your encrypted authentication tokens and profile data only for as long as your account is active. You can delete your account and clear all local data directly from the "Privacy" section in your Settings. Upon account deletion, all OAuth tokens are permanently destroyed, revoking our access to your Google account immediately. To prevent abuse of our services, we may retain a hashed version of your email address for up to 30 days post-deletion.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">6. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. Your data is encrypted in transit and at rest where applicable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, including any requests to exercise your legal rights, please contact us via the support channels provided in the application.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
