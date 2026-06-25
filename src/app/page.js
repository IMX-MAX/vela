"use client";

import Link from "next/link";
import { 
  PaperPlaneRight, Sparkle, ArrowBendUpLeft, PencilSimple, 
  Tray, ArrowRight, ArrowsOut, Briefcase, FileText, MagnifyingGlass
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
          <h1 className="text-5xl md:text-[6.5rem] font-medium tracking-tight text-[#1e2a3b] leading-[1.05] mb-10">
            the <span className="text-[#194060]">future of email — is</span><br />
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
          <div className="relative z-10">
            <div className="bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/5 p-6 w-full max-w-md mx-auto overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-500">C</div>
                  <span className="font-semibold text-gray-800 text-sm">Crossway</span>
                </div>
                <span className="text-xs text-gray-400 mt-1">Jan 22, 2026, 9:17 PM</span>
              </div>
              <div className="flex gap-3 mb-6">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-md text-xs font-medium text-[#7f99b0] transition-colors">
                  <Sparkle size={14} weight="fill" /> Summarize
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-md text-xs font-medium text-[#1e2a3b]/60 transition-colors">
                  <ArrowBendUpLeft size={14} weight="bold" /> Reply with AI
                </button>
              </div>
              <div className="w-full h-32 bg-orange-50/50 rounded-lg flex flex-col items-center justify-center border border-orange-100/50">
                <div className="grid grid-cols-2 gap-1 mb-2 opacity-20">
                  <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                  <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                  <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                  <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                </div>
                <span className="text-[10px] font-bold tracking-widest text-orange-800/40 uppercase">Crossway</span>
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
          <div className="relative z-10 order-1 md:order-2 p-8 bg-black/[0.03] rounded-[2rem] transform hover:scale-[1.02] transition-transform duration-500">
            <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/5 w-full max-w-md mx-auto overflow-hidden">
              <div className="flex items-center px-4 py-3 border-b border-black/5">
                <input type="text" placeholder="Search emails..." className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm font-medium" disabled />
                <div className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-semibold border border-gray-200">Tab for AI</div>
              </div>
              <div className="px-4 py-3">
                <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-2">SUGGESTIONS</div>
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-100/80 rounded-lg mb-1 cursor-pointer">
                  <PencilSimple size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Compose message</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <Tray size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Go to inbox</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3: Composer */}
        <section className="py-24 px-12 md:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 p-4 transform hover:scale-[1.02] transition-transform duration-500">
            <div className="bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/5 w-full max-w-md mx-auto flex flex-col overflow-hidden relative">
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between bg-[#fcfcfd]">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reply to...</div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                </div>
              </div>
              <div className="px-5 py-6 flex-1 min-h-[160px]">
                <p className="text-[15px] font-medium text-gray-700">Thanks for sharing this, I'll review it and work on it.</p>
              </div>
              
              {/* AI Context Menu Overlay */}
              <div className="absolute top-24 left-8 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-1.5 w-56">
                <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <Sparkle size={14} weight="fill" className="text-[#305a7d]" />
                    <span className="text-sm font-semibold text-gray-700">Fix grammar</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-300" />
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <ArrowsOut size={14} weight="bold" className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Expand on this</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-300" />
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <Briefcase size={14} weight="bold" className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Make professional</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-300" />
                </div>
              </div>

              <div className="px-4 py-3 bg-[#fcfcfd] flex justify-end border-t border-black/5">
                <button className="bg-[#305a7d] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md">
                  Send <PaperPlaneRight size={14} weight="fill" />
                </button>
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
            <div className="bg-[#fcfcfd] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/5 w-full h-[400px] flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-48 bg-[#f2f4f5]/50 border-r border-black/5 p-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-3 py-2 bg-[#e8ecef] rounded-lg text-[#305a7d]">
                  <div className="flex items-center gap-2.5">
                    <Tray size={16} weight="fill" />
                    <span className="text-sm font-semibold">Inbox</span>
                  </div>
                  <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full shadow-sm">24</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-black/5 rounded-lg text-gray-500 transition-colors cursor-pointer">
                  <FileText size={16} />
                  <span className="text-sm font-medium">Drafts</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-black/5 rounded-lg text-gray-500 transition-colors cursor-pointer">
                  <PaperPlaneRight size={16} />
                  <span className="text-sm font-medium">Sent</span>
                </div>
              </div>
              {/* Main List */}
              <div className="flex-1 flex flex-col bg-white">
                <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0">
                  <h3 className="font-bold text-lg text-gray-800">Inbox</h3>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                      <MagnifyingGlass size={14} weight="bold"/>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Email Item 1 */}
                  <div className="px-6 py-3.5 border-b border-black/5 bg-[#f8fbff] flex items-center gap-4 cursor-pointer relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#305a7d]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#305a7d] shadow-sm shadow-blue-200"></div>
                    <div className="w-32 truncate text-[13px] font-bold text-[#194060]">Alex Morgan</div>
                    <div className="flex-1 truncate text-[13px] font-semibold text-gray-800">Project Q3 Roadmap update <span className="font-normal text-gray-400 ml-1">— Here are the latest details...</span></div>
                    <div className="text-[11px] text-[#305a7d] font-bold">10:42 AM</div>
                  </div>
                  {/* Email Item 2 */}
                  <div className="px-6 py-3.5 border-b border-black/5 hover:bg-gray-50 flex items-center gap-4 cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-transparent"></div>
                    <div className="w-32 truncate text-[13px] font-semibold text-gray-600">Vercel</div>
                    <div className="flex-1 truncate text-[13px] font-medium text-gray-700">Deployment successful <span className="font-normal text-gray-400 ml-1">— Your production deployment...</span></div>
                    <div className="text-[11px] text-gray-400 font-semibold">Yesterday</div>
                  </div>
                  {/* Email Item 3 */}
                  <div className="px-6 py-3.5 border-b border-black/5 hover:bg-gray-50 flex items-center gap-4 cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-transparent"></div>
                    <div className="w-32 truncate text-[13px] font-semibold text-gray-600">Figma</div>
                    <div className="flex-1 truncate text-[13px] font-medium text-gray-700">Sarah commented on Landing Page <span className="font-normal text-gray-400 ml-1">— Can we move the button...</span></div>
                    <div className="text-[11px] text-gray-400 font-semibold">Yesterday</div>
                  </div>
                  {/* Email Item 4 */}
                  <div className="px-6 py-3.5 border-b border-black/5 hover:bg-gray-50 flex items-center gap-4 cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-transparent"></div>
                    <div className="w-32 truncate text-[13px] font-semibold text-gray-600">GitHub</div>
                    <div className="flex-1 truncate text-[13px] font-medium text-gray-700">[IMX-MAX/vela] Pull request merged <span className="font-normal text-gray-400 ml-1">— Merged PR #42 by...</span></div>
                    <div className="text-[11px] text-gray-400 font-semibold">Jan 22</div>
                  </div>
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
