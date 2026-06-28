"use client";

import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#b9c2c8] text-[#1e2a3b] selection:bg-[#7f99b0] selection:text-white flex flex-col relative overflow-x-hidden">
      
      {/* Background Lighting Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 bottom-0 right-[15%] w-[35%] bg-gradient-to-l from-white/70 to-transparent blur-[80px] transform skew-x-[-15deg] origin-top"></div>
        <div className="absolute top-0 bottom-0 right-[0%] w-[25%] bg-gradient-to-l from-black/[0.15] to-transparent blur-[60px] transform skew-x-[-15deg] origin-top"></div>
      </div>

      <MarketingNavbar />
      
      <main className="flex-1 pt-40 pb-32 px-12 md:px-24 max-w-[1400px] mx-auto w-full relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">

          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-[#1e2a3b] mb-4">Simple pricing for your AI email client.</h1>
          <p className="text-[#1e2a3b]/60 max-w-xl mx-auto text-lg leading-relaxed">
            Get started for free during our beta. Upgrade when you need more power for your inbox.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="relative rounded-3xl bg-white/40 border border-white/60 p-10 flex flex-col hover:bg-white/60 hover:shadow-xl hover:shadow-black/5 backdrop-blur-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-2xl font-medium text-[#1e2a3b] mb-2">Free Plan</h3>
            <p className="text-sm text-[#1e2a3b]/60 mb-6">Perfect for casual use and getting started.</p>
            <div className="text-4xl font-semibold text-[#1e2a3b] mb-8">$0 <span className="text-lg font-normal text-[#1e2a3b]/40">/mo</span></div>
            
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3 text-sm text-[#1e2a3b]/70">
                <CheckCircle size={20} weight="fill" className="text-[#5a768c] shrink-0" />
                <span title="Fair use limits apply (summary and AI draft replies are not counted)" className="cursor-help border-b border-dashed border-[#1e2a3b]/40 hover:text-[#1e2a3b] transition-colors">Limited monthly usage</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#1e2a3b]/70">
                <CheckCircle size={20} weight="fill" className="text-[#5a768c] shrink-0" />
                <span>Basic email summarization</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#1e2a3b]/70">
                <CheckCircle size={20} weight="fill" className="text-[#5a768c] shrink-0" />
                <span>Standard inbox features</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#1e2a3b]/70">
                <CheckCircle size={20} weight="fill" className="text-[#5a768c] shrink-0" />
                <span>Zero tracking, ad-free</span>
              </li>
            </ul>
            
            <Link href="/login" className="w-full text-center py-3 rounded-xl font-medium text-sm bg-white/60 hover:bg-white shadow-sm hover:shadow-md text-[#1e2a3b] transition-all">
              Get Started for Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-3xl bg-white/60 border border-[#7f99b0]/40 p-10 flex flex-col shadow-xl shadow-[#7f99b0]/10 backdrop-blur-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="absolute top-0 right-10 -translate-y-1/2">
              <span className="bg-[#5a768c] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">Most Popular</span>
            </div>
            
            <h3 className="text-2xl font-medium text-[#1e2a3b] mb-2">Pro Plan</h3>
            <p className="text-sm text-[#1e2a3b]/60 mb-6">For power users who need constant AI assistance.</p>
            <div className="text-4xl font-semibold text-[#1e2a3b] mb-8">$8 <span className="text-lg font-normal text-[#1e2a3b]/40">/mo</span></div>
            
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3 text-sm text-[#1e2a3b]/70">
                <CheckCircle size={20} weight="fill" className="text-[#5a768c] shrink-0" />
                <span className="font-medium text-[#1e2a3b]">Everything in Free, plus:</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#1e2a3b]/70">
                <CheckCircle size={20} weight="fill" className="text-[#5a768c] shrink-0" />
                <span title="Significantly higher usage limits (summary and AI draft replies are not counted)" className="cursor-help border-b border-dashed border-[#1e2a3b]/40 hover:text-[#1e2a3b] transition-colors">Up to 110x more usage than free</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#1e2a3b]/70">
                <CheckCircle size={20} weight="fill" className="text-[#5a768c] shrink-0" />
                <span>Connect multiple email accounts</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#1e2a3b]/70">
                <CheckCircle size={20} weight="fill" className="text-[#5a768c] shrink-0" />
                <span>Access to Split Inboxes</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#1e2a3b]/70">
                <CheckCircle size={20} weight="fill" className="text-[#5a768c] shrink-0" />
                <span>Advanced AI Composer tools</span>
              </li>
            </ul>
            
            <Link href="/login?upgrade=true" className="w-full text-center py-3 rounded-xl font-medium text-sm bg-[#1e2a3b] text-white hover:bg-[#1e2a3b]/90 transition-colors block">
              Get Pro
            </Link>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
