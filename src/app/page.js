"use client";

import Link from "next/link";
import { 
  PaperPlaneRight, Sparkle, ArrowBendUpLeft, PencilSimple, 
  Tray, ArrowRight, ArrowsOut, Briefcase, FileText, MagnifyingGlass,
  Paperclip, Image
} from "@phosphor-icons/react";
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
          <h1 className="text-5xl md:text-[6.5rem] font-medium tracking-tight leading-[1.05] mb-10">
            <span className="text-[#194060]">the </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#194060] to-[#7f99b0]">future of email — is</span><br />
            <span className="text-[#194060]">here</span>
          </h1>
          <p className="text-lg md:text-xl text-[#1e2a3b]/80 max-w-2xl leading-relaxed font-medium mb-12">
            Vela is the next generation of AI email clients. Experience<br />
            one of the fastest workflows, designed for speed, clarity, and focus.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="bg-[#9ba9b4] hover:bg-[#8b99a4] text-white px-8 py-3 rounded-2xl font-medium text-lg transition-colors shadow-sm">
              Get started
            </Link>
            <div className="flex items-center gap-2 text-[#1e2a3b]/40 font-medium text-lg">
              <span>&larr;</span>
              <span>Unlock your new email</span>
            </div>
          </div>
        </section>

        {/* Feature 1: Reply/Summarize */}
        <section className="py-24 px-12 md:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 p-4 transform hover:scale-[1.02] transition-transform duration-500">
            <div className="bg-white rounded-[4px] shadow-sm w-full max-w-2xl mx-auto overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-[#f1f3f5] flex items-center justify-center font-bold text-gray-400 text-lg">C</div>
                    <div>
                      <div className="font-bold text-[#1e2a3b] text-base flex items-center gap-2">Crossway <span className="text-xs font-normal text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-sm">hello@crossway.org</span></div>
                      <div className="text-xs text-gray-400 mt-1">To: me <span className="ml-1 text-[8px]">▼</span></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Jan 22, 2026, 9:17 PM</span>
                </div>
                
                <div className="flex gap-4 mb-16">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 rounded-lg text-sm font-semibold text-gray-600 transition-colors">
                    <Sparkle size={16} weight="fill" className="text-gray-400" /> Summarize
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 rounded-lg text-sm font-semibold text-gray-600 transition-colors">
                    <ArrowBendUpLeft size={16} weight="bold" className="text-gray-400" /> Reply with AI
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="grid grid-cols-2 gap-1.5 mb-3 opacity-40">
                    <div className="w-3.5 h-3.5 bg-gray-600 rounded-sm"></div>
                    <div className="w-3.5 h-3.5 bg-gray-600 rounded-sm"></div>
                    <div className="w-3.5 h-3.5 bg-gray-600 rounded-sm"></div>
                    <div className="w-3.5 h-3.5 bg-gray-600 rounded-sm"></div>
                  </div>
                  <span className="text-sm font-bold tracking-[0.2em] text-[#305a7d] uppercase">Crossway</span>
                </div>
              </div>
              <div className="w-full h-32 bg-[#a36b5e] flex items-end justify-center px-20">
                <div className="w-48 h-20 bg-[#d9a58c] rounded-t-[40px] opacity-80 relative flex justify-center">
                  <div className="absolute bottom-0 w-12 h-16 bg-[#b27d6d] rounded-t-full"></div>
                  <div className="absolute bottom-0 w-16 h-12 bg-[#b27d6d] rounded-t-full translate-x-12"></div>
                </div>
              </div>
            </div>
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
          <div className="relative z-10 order-1 md:order-2 flex justify-center items-center transform hover:scale-[1.02] transition-transform duration-500">
            {/* Dark gray pill background container */}
            <div className="w-full max-w-2xl aspect-[2/1] bg-black/15 rounded-[40px] shadow-inner flex items-center justify-center p-8 relative overflow-hidden backdrop-blur-sm border border-white/10">
              {/* White command palette floating */}
              <div className="bg-[#fcfcfc] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] w-full max-w-md mx-auto overflow-hidden">
                <div className="flex items-center px-5 py-4 border-b border-black/5">
                  <input type="text" placeholder="Search emails..." className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base font-medium" disabled />
                  <div className="text-[11px] bg-gray-100 text-gray-500 px-3 py-1.5 rounded-md font-semibold">Tab for AI</div>
                </div>
                <div className="px-5 py-4">
                  <div className="text-[10px] font-bold text-gray-400 tracking-widest mb-3">SUGGESTIONS</div>
                  <div className="flex items-center gap-4 px-4 py-3 bg-[#f1f3f5] rounded-xl mb-1.5 cursor-pointer">
                    <PencilSimple size={18} weight="bold" className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">Compose message</span>
                  </div>
                  <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors">
                    <Tray size={18} weight="bold" className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-500">Go to inbox</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Composer */}
        <section className="py-24 px-12 md:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 p-8 transform hover:scale-[1.02] transition-transform duration-500 md:pl-16">
            <div className="bg-white rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-black/5 w-full max-w-2xl mx-auto flex flex-col overflow-hidden relative">
              <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-white">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reply to...</div>
                <div className="flex gap-2">
                  <div className="text-[10px] font-medium text-gray-400">Saved</div>
                </div>
              </div>
              <div className="px-6 py-8 flex-1 min-h-[200px]">
                <p className="text-[15px] font-medium text-gray-700">Thanks for sharing this, I'll review it and work on it.</p>
              </div>

              <div className="px-6 py-4 flex justify-between items-center border-t border-black/5 bg-white">
                <div className="flex gap-3">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors"><Paperclip size={18} /></button>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors"><Image size={18} /></button>
                </div>
                <button className="bg-[#495b6a] text-white px-6 py-2 rounded-md text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-[#394a59] transition-colors">
                  Send <PaperPlaneRight size={14} weight="fill" />
                </button>
              </div>
            </div>
            
            {/* AI Context Menu Overlay - Floating off left edge */}
            <div className="absolute top-28 left-0 md:-left-8 bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-2 w-60 z-20">
              <div className="flex items-center justify-between px-3 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Sparkle size={16} weight="fill" className="text-[#194060]" />
                  <span className="text-sm font-semibold text-gray-800">Fix grammar</span>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
              </div>
              <div className="flex items-center justify-between px-3 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <ArrowsOut size={16} weight="bold" className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Expand on this</span>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
              </div>
              <div className="flex items-center justify-between px-3 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Briefcase size={16} weight="bold" className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Make professional</span>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
              </div>
              <div className="flex items-center justify-between px-3 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border-t border-black/5 mt-1 pt-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">Ask AI...</span>
                </div>
                <span className="text-[10px] text-gray-400 font-bold border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">Ctrl K</span>
              </div>
            </div>
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
          <div className="relative z-10 order-1 md:order-2 transform hover:scale-[1.02] transition-transform duration-500">
            <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-black/5 w-full max-w-3xl mx-auto h-[480px] flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-56 bg-[#f7f9fa] border-r border-black/5 flex flex-col py-6">
                <div className="px-6 mb-8 flex items-center gap-2 text-[#194060]">
                  <img src="/logo-vela.png" alt="Logo" className="w-5 h-5 opacity-80" />
                  <span className="font-semibold text-lg">vela</span>
                </div>
                <div className="px-3 flex flex-col gap-1">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-[#e9ecef] rounded-lg text-[#194060]">
                    <div className="flex items-center gap-3">
                      <Tray size={18} weight="fill" />
                      <span className="text-sm font-semibold">Inbox</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white text-gray-600 px-2 py-0.5 rounded-full shadow-sm">24</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-black/5 rounded-lg transition-colors cursor-pointer">
                    <FileText size={18} weight="bold" />
                    <span className="text-sm font-semibold">Drafts</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-black/5 rounded-lg transition-colors cursor-pointer">
                    <PaperPlaneRight size={18} weight="bold" />
                    <span className="text-sm font-semibold">Sent</span>
                  </div>
                </div>
              </div>
              {/* Main List */}
              <div className="flex-1 flex flex-col bg-white">
                <div className="px-8 py-6 border-b border-black/5 flex items-center justify-between bg-white sticky top-0">
                  <h3 className="font-bold text-xl text-gray-800">Inbox</h3>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                      <MagnifyingGlass size={18} weight="bold"/>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Email List Items */}
                  {[
                    { sender: 'Alex Morgan', subj: 'Project Q3 Roadmap update', preview: 'Here are the latest details...', time: '10:42 AM', unread: true },
                    { sender: 'Vercel', subj: 'Deployment successful', preview: 'Your production deployment...', time: 'Yesterday', unread: false },
                    { sender: 'Figma', subj: 'Sarah commented on Landing Page', preview: 'Can we move the button...', time: 'Yesterday', unread: false },
                    { sender: 'GitHub', subj: '[IMX-MAX/vela] Pull request merged', preview: 'Merged PR #42 by...', time: 'Jan 22', unread: false },
                    { sender: 'Linear', subj: 'New issue assigned to you', preview: 'Issue #104 has been...', time: 'Jan 20', unread: false },
                    { sender: 'Linear', subj: 'New issue assigned to you', preview: 'Issue #104 has been...', time: 'Jan 20', unread: false },
                    { sender: 'Linear', subj: 'New issue assigned to you', preview: 'Issue #104 has been...', time: 'Jan 20', unread: false }
                  ].map((email, i) => (
                    <div key={i} className={`px-8 py-4 border-b border-black/5 flex items-center gap-6 cursor-pointer relative ${email.unread ? 'bg-[#f4f7f9]' : 'hover:bg-gray-50'}`}>
                      {email.unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#194060]"></div>}
                      <div className="w-36 truncate text-[13px] font-bold text-[#194060]">{email.sender}</div>
                      <div className="flex-1 truncate text-[13px] font-semibold text-gray-800">{email.subj} <span className="font-normal text-gray-400 ml-1">— {email.preview}</span></div>
                      <div className={`text-[11px] font-bold ${email.unread ? 'text-[#194060]' : 'text-gray-400'}`}>{email.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 px-6 text-center w-full">
          <h2 className="text-5xl md:text-7xl font-medium text-[#0f2136] tracking-tight mb-6">there's no need to wait.</h2>
          <p className="text-xl md:text-2xl text-[#1e2a3b] max-w-2xl mx-auto font-medium leading-snug mb-12">
            try vela for free today — unlock the<br />
            email experience you've always been<br />
            promised.
          </p>
          <Link href="/login" className="bg-[#194060] hover:bg-[#0f2136] text-white px-10 py-4 rounded-full font-medium text-lg transition-colors shadow-xl shadow-black/10 inline-block">
            Get started
          </Link>
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
