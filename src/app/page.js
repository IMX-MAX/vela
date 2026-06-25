"use client";

import Link from "next/link";
import { PaperPlaneRight } from "@phosphor-icons/react";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#b9c2c8] text-[#1e2a3b] font-[Inter] selection:bg-[#7f99b0] selection:text-white flex flex-col relative overflow-x-hidden">
      
      {/* Background Lighting Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 bottom-0 right-[15%] w-[35%] bg-gradient-to-l from-white/70 to-transparent blur-[80px] transform skew-x-[-15deg] origin-top"></div>
        <div className="absolute top-0 bottom-0 right-[0%] w-[25%] bg-gradient-to-l from-black/[0.15] to-transparent blur-[60px] transform skew-x-[-15deg] origin-top"></div>
      </div>

      <MarketingNavbar />
      
      <main className="w-full">
        {/* Hero Section */}
        <section className="pt-40 pb-32 px-12 md:px-24 max-w-[1400px] mx-auto w-full relative z-10 animate-fade-in-up">
          <h1 className="text-5xl md:text-[6.5rem] font-medium tracking-tight text-[#1e2a3b] leading-[1.05] mb-10">
            the <span className="text-[#194060]">future of email — is</span><br />
            <span className="text-[#194060]">here</span>
          </h1>
          <p className="text-lg md:text-xl text-[#1e2a3b]/80 max-w-2xl leading-relaxed font-medium">
            Vela is the next generation of AI email clients. Experience<br />
            one of the fastest workflows, designed for speed, clarity, and focus.
          </p>
        </section>

        {/* Feature 1: Reply/Summarize */}
        <section className="py-24 px-12 md:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/10 transition-transform hover:scale-[1.02] duration-500">
            <img src="/mockups/email_reply_summary_mockup.png" alt="Email Summary UI" className="w-full h-auto object-cover" />
          </div>
          <div className="flex flex-col gap-8 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-[#7f99b0]">reply to and summarize emails</h2>
            <div className="space-y-6 text-[#1e2a3b]/80 font-medium leading-relaxed">
              <p>Use ai to automate the easy things.</p>
              <p>Get instant summaries of emails, to instantly understand what's going on.</p>
              <p>Reply to emails automatically, and let ai handle your inbox, so you can skip to what matters.</p>
            </div>
          </div>
        </section>

        {/* Feature 2: Search */}
        <section className="py-24 px-12 md:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8 max-w-lg order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-[#7f99b0]">ai that knows what you're<br />looking for</h2>
            <div className="space-y-6 text-[#1e2a3b]/80 font-medium leading-relaxed">
              <p>just hit cmd + k on your keyboard to bring up Command Palette.</p>
              <p>Search anything, navigate to any page, or ask ai any question about your inbox.</p>
              <p>Vela's agents parse your inbox and make sure nothing slips through the cracks.</p>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/10 transition-transform hover:scale-[1.02] duration-500 order-1 md:order-2 p-4 bg-black/5">
            <img src="/mockups/command_palette_search_mockup.png" alt="Command Palette UI" className="w-full h-auto object-cover rounded-2xl" />
          </div>
        </section>

        {/* Feature 3: Composer */}
        <section className="py-24 px-12 md:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/10 transition-transform hover:scale-[1.02] duration-500">
            <img src="/mockups/email_composer_markdown_mockup.png" alt="Email Composer UI" className="w-full h-auto object-cover" />
          </div>
          <div className="flex flex-col gap-8 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-[#305a7d]">email writing experience that<br />feels like your favorite notes<br />apps</h2>
            <div className="space-y-6 text-[#1e2a3b]/80 font-medium leading-relaxed">
              <p>Our email composer supports markdown writing so you can craft beautiful emails without the stress.</p>
              <p>Hit / to open the AI Actions menu, allowing you to use our tools to help you write better emails. Our models have been trained to write emails specifically, outperforming most general LLMs.</p>
            </div>
          </div>
        </section>

        {/* Feature 4: Modern Age */}
        <section className="py-24 px-12 md:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8 max-w-lg order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-[#194060]">The email client designed<br />for the modern age</h2>
            <div className="space-y-6 text-[#1e2a3b]/80 font-medium leading-relaxed">
              <p>Forget about bulky, bloated, and outdated email services.</p>
              <p>Vela has been hand crafted to be lightweight. We don't serve you ads, nor do we sell your data. Vela runs with perceived interactions of &lt;100ms</p>
              <p>Our ai models are hosted with strict data privacy laws in Europe.</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/10 transition-transform hover:scale-[1.02] duration-500 order-1 md:order-2">
            <img src="/mockups/modern_inbox_mockup.png" alt="Modern Inbox UI" className="w-full h-auto object-cover" />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 px-6 text-center w-full">
          <h2 className="text-5xl md:text-7xl font-medium text-[#0f2136] tracking-tight mb-6">there's no need to wait.</h2>
          <p className="text-xl md:text-2xl text-[#1e2a3b] max-w-2xl mx-auto font-medium leading-snug">
            try vela for free today — unlock the<br />
            email experience you've always been<br />
            promised.
          </p>
        </section>
      </main>

      <MarketingFooter />

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
