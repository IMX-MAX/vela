"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-[#eceae6] text-[#1e1e1e] font-[Inter]">
      <div className="h-14 border-b border-[#dddcdc] flex items-center px-4 sticky top-0 bg-[#eceae6]/90 backdrop-blur-sm z-10">
        <Link href="/login" className="p-2 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#dddcdc]/50">
          <ArrowLeft size={18} />
        </Link>
        <div className="ml-2 font-medium text-[#2b323b]">Terms of Service</div>
      </div>
      
      <div className="max-w-3xl mx-auto w-full px-8 py-12">
        <h1 className="text-3xl font-bold mb-8 text-[#2b323b]">Terms of Service for Vela</h1>
        <p className="text-gray-500 mb-8">Last updated: June 22, 2026</p>

        <div className="space-y-8 text-gray-800 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">1. Acceptance of Terms</h2>
            <p>By accessing or using Vela ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">2. Description of Service</h2>
            <p>Vela is an advanced, AI-powered email client built on top of the Gmail API that enables users to read, organize, and send emails. The Service includes AI-assisted email summarization, drafting capabilities, and various inbox management tools. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">3. Account Registration</h2>
            <p>To use certain features of the Service, you must register for an account using your Google account or a registered email address. When you register, you agree to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="mt-2">Your use of Vela via your Google account is also subject to Google's Terms of Service and Privacy Policy. You are responsible for maintaining the confidentiality of your account credentials.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">4. Subscription and Billing</h2>
            <p>Vela offers various subscription plans with different features and AI usage limits. By subscribing to a paid plan, you agree to the following:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Billing:</strong> Subscriptions are billed monthly or annually in advance. Payment is processed through Stripe, our third-party payment processor.</li>
              <li><strong>Free Trials:</strong> New users may be eligible for a free trial period. At the end of the trial, your subscription will automatically convert to a paid plan unless canceled.</li>
              <li><strong>Usage Limits:</strong> Your subscription includes a monthly allocation of AI usage. Unused usage does not roll over to the next billing period.</li>
              <li><strong>Price Changes:</strong> We reserve the right to modify subscription prices. Price changes will be communicated to you in advance and will apply to your next billing cycle.</li>
              <li><strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period.</li>
              <li><strong>Refunds:</strong> Refunds are provided at our discretion and in accordance with applicable law. Generally, we do not provide refunds for partial billing periods.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">5. User Content and Third-Party API Data</h2>
            <p>Vela uses the Google Gmail API to access your email data. Our use of this data is strictly limited to providing you with the email client interface and optional AI-powered features. We adhere strictly to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
            <p className="mt-2">You retain all ownership rights to the content you create and emails you send using the Service ("User Content"). You are solely responsible for your User Content and represent that you have all necessary rights to create and send such content.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">6. Prohibited Uses</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the intellectual property rights of others</li>
              <li>Send spam, malicious code, viruses, or harmful software</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Use the Service to create or send content that is illegal, harmful, or violates others' rights</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code of the Service</li>
              <li>Use automated systems to access the Service without authorization</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">7. AI Features and Limitations</h2>
            <p>Vela uses artificial intelligence to assist with email summarization and drafting. While we strive for accuracy and quality, AI-generated content may contain errors or inaccuracies. You acknowledge that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>AI-generated content is provided "as is" without warranties</li>
              <li>You are solely responsible for reviewing and verifying AI-generated content before sending any email</li>
              <li>We are not liable for any consequences resulting from the use of AI-generated content</li>
              <li>AI features are subject to usage limits based on your subscription plan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">8. Termination</h2>
            <p>We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including but not limited to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Breach of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Non-payment of subscription fees</li>
              <li>Extended periods of inactivity</li>
            </ul>
            <p className="mt-2">Upon termination, your right to use the Service will immediately cease. We may delete your account and associated data. You may also terminate your account at any time through your account settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">9. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, VELA AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">10. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">11. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">12. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Vela operates, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved in the appropriate courts of that jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-[#2b323b]">13. Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us at support@vela.nafen.sbs.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
