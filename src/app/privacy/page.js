"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f1] text-[#1e1e1e] font-[Inter]">
      <div className="h-14 border-b border-[#e4e3e0] flex items-center px-4 sticky top-0 bg-[#f2f2f1]/90 backdrop-blur-sm z-10">
        <Link href="/login" className="p-2 text-gray-500 hover:text-gray-900 transition rounded-md hover:bg-[#e4e3e0]/50">
          <ArrowLeft size={18} />
        </Link>
        <div className="ml-2 font-medium text-gray-900">Privacy Policy</div>
      </div>
      
      <div className="max-w-3xl mx-auto w-full px-8 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Privacy Policy for Vela</h1>
        <p className="text-gray-500 mb-8">Last updated: June 22, 2026</p>

        <div className="space-y-8 text-gray-800 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Introduction</h2>
            <p>Welcome to Vela ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you as to how we look after your personal data when you visit our application at vela.nafen.sbs (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">2. The Data We Collect About You</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Identity Data</strong> includes your first name, last name, and profile picture obtained via Google OAuth or standard registration.</li>
              <li><strong>Contact Data</strong> includes your email address.</li>
              <li><strong>Email Data</strong> includes the content of your emails, which we access via the Gmail API to display within the application and process using Vela Intelligence for summarization and drafting replies at your explicit request.</li>
              <li><strong>Technical Data</strong> includes authentication tokens required to securely communicate with the Google APIs and Composio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>To provide the core functionality of the Vela email client.</li>
              <li>To allow Vela Intelligence to summarize emails or draft replies. Your email content is securely passed to our Intelligence API for processing and is not used for training our own models.</li>
              <li>To manage our relationship with you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Third-Party Services</h2>
            <p>Vela utilizes third-party services to function effectively. We share necessary data with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Google:</strong> We use Google OAuth for authentication and the Gmail API to access your mailbox. Vela's use and transfer to any other app of information received from Google APIs will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</li>
              <li><strong>Vela Intelligence:</strong> We use Vela Intelligence (powered by third-party LLM providers) to power the intelligent summarization and drafting features.</li>
              <li><strong>Composio:</strong> We use Composio MCP to manage secure API integrations for your inbox.</li>
              <li><strong>Appwrite:</strong> We use Appwrite Cloud as our backend infrastructure to securely store your session data and access tokens.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">5. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. Your data is encrypted in transit and at rest where applicable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, including any requests to exercise your legal rights, please contact us via the support channels provided in the application.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
