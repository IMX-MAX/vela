"use client";

import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#2b323b] text-white font-[Inter] selection:bg-[#50686c] selection:text-white flex flex-col">
      <MarketingNavbar />
      
      <main className="flex-1 pt-32 pb-24 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-gray-400 mb-6 backdrop-blur-md">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            Early Access Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">Simple, transparent pricing.</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
            Get started for free during our beta. Upgrade when you need more power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="relative rounded-3xl bg-white/[0.02] border border-white/[0.08] p-10 flex flex-col hover:border-white/[0.15] transition-colors animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-2xl font-medium text-white mb-2">Free Plan</h3>
            <p className="text-sm text-gray-400 mb-6">Perfect for casual use and getting started.</p>
            <div className="text-4xl font-semibold text-white mb-8">$0 <span className="text-lg font-normal text-gray-500">/mo</span></div>
            
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={20} weight="fill" className="text-emerald-400 shrink-0" />
                <span title="Fair use limits apply (summary and AI draft replies are not counted)" className="cursor-help border-b border-dashed border-gray-500 hover:text-white transition-colors">Limited monthly usage</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={20} weight="fill" className="text-emerald-400 shrink-0" />
                <span>Basic email summarization</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={20} weight="fill" className="text-emerald-400 shrink-0" />
                <span>Standard inbox features</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={20} weight="fill" className="text-emerald-400 shrink-0" />
                <span>Zero tracking, ad-free</span>
              </li>
            </ul>
            
            <Link href="/login" className="w-full text-center py-3 rounded-xl font-medium text-sm bg-white/[0.08] hover:bg-white/[0.12] text-white transition-colors">
              Get Started for Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-3xl bg-white/[0.05] border border-[#50686c]/40 p-10 flex flex-col shadow-[0_0_40px_rgba(80,104,108,0.15)] animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="absolute top-0 right-10 -translate-y-1/2">
              <span className="bg-[#50686c] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</span>
            </div>
            
            <h3 className="text-2xl font-medium text-white mb-2">Pro Plan</h3>
            <p className="text-sm text-gray-400 mb-6">For power users who need constant AI assistance.</p>
            <div className="text-4xl font-semibold text-white mb-8">$8 <span className="text-lg font-normal text-gray-500">/mo</span></div>
            
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={20} weight="fill" className="text-emerald-400 shrink-0" />
                <span className="font-medium text-white">Everything in Free, plus:</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={20} weight="fill" className="text-emerald-400 shrink-0" />
                <span title="Significantly higher usage limits (summary and AI draft replies are not counted)" className="cursor-help border-b border-dashed border-gray-500 hover:text-white transition-colors">Up to 30x higher AI usage</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={20} weight="fill" className="text-emerald-400 shrink-0" />
                <span>Connect multiple email accounts</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={20} weight="fill" className="text-emerald-400 shrink-0" />
                <span>Access to Split Inboxes</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle size={20} weight="fill" className="text-emerald-400 shrink-0" />
                <span>Advanced AI Composer tools</span>
              </li>
            </ul>
            
            <button disabled className="w-full text-center py-3 rounded-xl font-medium text-sm bg-white text-[#2b323b] opacity-70 cursor-not-allowed transition-colors">
              Unavailable during beta
            </button>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
