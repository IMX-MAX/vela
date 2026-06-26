"use client";

import Link from "next/link";
import { 
  PaperPlaneRight, Sparkle, ArrowBendUpLeft, PencilSimple, 
  Tray, ArrowRight, ArrowsOut, Briefcase, FileText, MagnifyingGlass,
  Paperclip, Image, Star, CheckCircle, Trash, FadersHorizontal,
  WarningOctagon, ChatCircle
} from "@phosphor-icons/react";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { useAuthStore } from "@/lib/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      router.push("/inbox");
    }
  }, [user, router]);

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
            <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-black/5 w-full max-w-2xl mx-auto overflow-hidden">
              <div className="px-6 md:px-8 py-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-[#f1f3f5] flex items-center justify-center font-medium text-gray-700 text-lg">C</div>
                    <div>
                      <div className="font-semibold text-gray-800 text-[15px] flex items-center gap-2">
                        Crossway <span className="text-[14px] font-normal text-gray-400">john@example.com</span>
                      </div>
                      <div className="text-[13px] text-gray-400 mt-0.5">to me <span className="ml-1 text-[10px]">▼</span></div>
                    </div>
                  </div>
                  <span className="text-[13px] text-gray-400 font-medium pt-1">Jun 22, 2026, 9:17 PM</span>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex gap-3 mb-8">
                  <button className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-[13px] font-semibold text-[#2b323b] transition-colors shadow-sm">
                    <Sparkle size={16} weight="fill" className="text-[#2b323b]" /> Summarize
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-[13px] font-semibold text-[#2b323b] transition-colors shadow-sm">
                    <Sparkle size={16} weight="fill" className="text-[#2b323b]" /> Reply with AI
                  </button>
                </div>

                <div className="bg-[#f8f9fa] rounded-lg w-full h-64 border border-gray-100"></div>
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

        {/* Feature 3.5: AI Models */}
        <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 max-w-lg">
              <div className="bg-[#194060]/10 w-12 h-12 flex items-center justify-center rounded-xl mb-2">
                <Sparkle size={24} weight="fill" className="text-[#194060]" />
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#194060] leading-tight">
                AI email apps are only as good as the models driving them.
              </h2>
              <div className="space-y-6 text-[#1e2a3b]/80 font-medium leading-relaxed text-lg mt-4">
                <p>We've specially trained our models to excel at one thing: <span className="text-[#194060] font-semibold">Emails.</span></p>
                <p>Unlike generic AI that outputs robotic, overly-formal text, Vela Intelligence writes natural, highly-structured, and context-aware responses designed to save you time and preserve your voice.</p>
                <p>Don't believe it? <Link href="/login" className="text-[#7f99b0] hover:text-[#194060] underline underline-offset-4 transition-colors">Test it out yourself in the app.</Link></p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#dddcdc] to-white rounded-3xl p-8 border border-[#dddcdc] shadow-xl relative overflow-hidden h-[400px] flex items-center justify-center">
               <div className="absolute inset-0 bg-[#194060]/5 mix-blend-multiply opacity-50" style={{ backgroundImage: 'radial-gradient(#194060 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               <div className="relative z-10 flex gap-4 items-end h-full py-12">
                 <div className="w-12 bg-gradient-to-t from-[#194060]/20 to-[#194060]/40 rounded-t-full h-[40%] animate-pulse"></div>
                 <div className="w-12 bg-gradient-to-t from-[#194060]/40 to-[#194060]/60 rounded-t-full h-[70%] animate-pulse" style={{animationDelay: '150ms'}}></div>
                 <div className="w-12 bg-gradient-to-t from-[#194060]/60 to-[#194060]/80 rounded-t-full h-[100%] animate-pulse" style={{animationDelay: '300ms'}}></div>
                 <div className="w-12 bg-gradient-to-t from-[#194060]/30 to-[#194060]/50 rounded-t-full h-[55%] animate-pulse" style={{animationDelay: '450ms'}}></div>
               </div>
            </div>
          </div>
        </section>

        {/* Feature 4: Modern Age (Linear Style) */}
        <section className="py-32 px-6 md:px-12 max-w-[1200px] mx-auto w-full flex flex-col items-center text-center">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#194060] mb-6">
              The email client designed<br />for the modern age
            </h2>
            <p className="text-lg md:text-xl text-[#1e2a3b]/70 font-medium leading-relaxed max-w-2xl mx-auto">
              Forget about bulky, bloated, and outdated email services. Vela has been hand crafted to be lightweight. We don't serve you ads, nor do we sell your data. Vela runs with perceived interactions of &lt;100ms. Our ai models are hosted with strict data privacy laws in Europe.
            </p>
          </div>
          
          <div className="relative w-full transform hover:scale-[1.01] transition-transform duration-700">
            {/* Subtle glow behind the demo */}
            <div className="absolute -inset-1 bg-gradient-to-b from-[#7f99b0]/30 to-transparent blur-2xl opacity-60 rounded-[2rem]"></div>
            
            {/* The Demo UI Container */}
            <div className="bg-[#dddcdc] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white/40 w-full h-[600px] flex overflow-hidden relative z-10 backdrop-blur-sm">
              {/* Sidebar */}
              <div className="w-56 bg-[#dddcdc] flex flex-col py-4 px-3 relative">
                <div className="px-3 mb-6 flex items-center gap-2 text-[#2b323b]">
                  <img src="/logo-vela.png" alt="Logo" className="w-5 h-5 opacity-80" />
                  <span className="font-semibold text-[15px]">Vela</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between px-3 py-2 bg-[#c7d4ce] rounded-lg text-[#2b323b]">
                    <div className="flex items-center gap-3">
                      <Tray size={18} weight="fill" />
                      <span className="text-[13px] font-medium">Inbox</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-[#c7d4ce]/50 hover:text-[#2b323b] rounded-lg transition-colors cursor-pointer">
                    <Star size={18} />
                    <span className="text-[13px] font-medium">Starred</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-[#c7d4ce]/50 hover:text-[#2b323b] rounded-lg transition-colors cursor-pointer">
                    <PaperPlaneRight size={18} />
                    <span className="text-[13px] font-medium">Sent</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-[#c7d4ce]/50 hover:text-[#2b323b] rounded-lg transition-colors cursor-pointer">
                    <FileText size={18} />
                    <span className="text-[13px] font-medium">Drafts</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-[#c7d4ce]/50 hover:text-[#2b323b] rounded-lg transition-colors cursor-pointer">
                    <CheckCircle size={18} />
                    <span className="text-[13px] font-medium">Done</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-[#c7d4ce]/50 hover:text-[#2b323b] rounded-lg transition-colors cursor-pointer">
                    <Trash size={18} />
                    <span className="text-[13px] font-medium">Trash</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-gray-400 shadow-sm border border-[#dddcdc]">
                  U
                </div>
              </div>

              {/* Main Area */}
              <div className="flex-1 flex flex-col bg-[#eceae6] rounded-[14px] m-1.5 ml-0 overflow-hidden relative shadow-sm border border-white/50">
                {/* Top Bar */}
                <div className="h-14 border-b border-[#dddcdc] flex items-center px-6 sticky top-0 bg-[#eceae6]/90 backdrop-blur-sm z-10">
                  <div className="flex items-center gap-1">
                    <div className="px-3 py-1.5 rounded-md text-[14px] font-medium bg-white shadow-sm text-[#2b323b]">
                      Inbox
                    </div>
                    <div className="px-3 py-1.5 rounded-md text-[14px] font-medium text-gray-500">
                      Other
                    </div>
                  </div>
                  <div className="ml-2 text-gray-400">
                    <FadersHorizontal size={16} weight="bold" />
                  </div>
                </div>

                {/* Email List */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  {[
                    { sender: 'Alex Morgan', subj: 'Project Q3 Roadmap update', preview: 'Here are the latest details on our upcoming launch...', time: '10:42 AM', unread: true },
                    { sender: 'Vercel', subj: 'Deployment successful', preview: 'Your production deployment has been successfully completed...', time: 'Yesterday', unread: false },
                    { sender: 'Figma', subj: 'Sarah commented on Landing Page', preview: 'Can we move the button a bit to the right...', time: 'Yesterday', unread: false },
                    { sender: 'GitHub', subj: '[IMX-MAX/vela] Pull request merged', preview: 'Merged PR #42 by john-doe into main...', time: 'Jan 22', unread: false },
                    { sender: 'Linear', subj: 'New issue assigned to you', preview: 'Issue #104 has been assigned to you by the team...', time: 'Jan 20', unread: false },
                    { sender: 'Stripe', subj: 'Payment successful', preview: 'We received your payment of $49.00 for the Vela Pro plan...', time: 'Jan 19', unread: false },
                    { sender: 'Google Workspace', subj: 'Security alert', preview: 'A new sign-in from an unrecognized device was detected...', time: 'Jan 18', unread: false },
                    { sender: 'Notion', subj: 'Weekly Digest', preview: 'Here is what your team worked on this week...', time: 'Jan 15', unread: false }
                  ].map((email, i) => (
                    <div key={i} className={`px-6 py-4 border-b border-[#2b323b]/5 flex items-center gap-4 cursor-pointer relative ${email.unread ? 'bg-white' : 'hover:bg-[#dddcdc]/50'}`}>
                      <div className="w-4 flex-shrink-0 flex items-center justify-center">
                        {email.unread && <div className="h-2 w-2 rounded-full bg-[#2b323b]"></div>}
                      </div>
                      <div className={`w-40 truncate text-[14px] ${email.unread ? 'font-semibold text-[#2b323b]' : 'font-medium text-gray-700'}`}>{email.sender}</div>
                      <div className="flex-1 truncate flex items-center min-w-0">
                        <div className={`truncate text-[14px] ${email.unread ? 'font-semibold text-[#2b323b]' : 'font-medium text-gray-800'}`}>{email.subj}</div>
                        <span className="text-gray-400 mx-2 text-[14px]">&mdash;</span>
                        <div className="text-gray-500 truncate text-[14px] flex-1">{email.preview}</div>
                      </div>
                      <div className={`text-[13px] flex-shrink-0 w-20 text-right ${email.unread ? 'font-medium text-[#2b323b]' : 'text-gray-500'}`}>{email.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-20 px-6 max-w-[1200px] mx-auto w-full">
          <div className="bg-[#194060] rounded-3xl overflow-hidden flex flex-col md:flex-row relative shadow-2xl">
            <div className="absolute inset-0 bg-[#0f2136] opacity-50 mix-blend-overlay"></div>
            
            <Link href="https://tally.so/r/A702L0" target="_blank" className="flex-1 p-10 md:p-12 hover:bg-white/5 transition-colors border-b md:border-b-0 md:border-r border-white/10 group relative z-10">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-6">
                <WarningOctagon size={24} weight="fill" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Report a Bug</h3>
              <p className="text-white/70 font-medium text-[17px] mb-8 max-w-[280px] leading-relaxed">Spotted something weird? Let us know so we can fix it.</p>
              <div className="text-white font-semibold flex items-center gap-2 group-hover:gap-4 transition-all">
                File bug report <ArrowRight size={16} weight="bold" />
              </div>
            </Link>
            
            <Link href="https://tally.so/r/RGgMRp" target="_blank" className="flex-1 p-10 md:p-12 hover:bg-white/5 transition-colors group relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                <ChatCircle size={24} weight="fill" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Customer Support</h3>
              <p className="text-white/70 font-medium text-[17px] mb-8 max-w-[280px] leading-relaxed">Need help with your account or have a question? We're here.</p>
              <div className="text-white font-semibold flex items-center gap-2 group-hover:gap-4 transition-all">
                Get support <ArrowRight size={16} weight="bold" />
              </div>
            </Link>
          </div>
        </section>

        {/* CTA Section (Linear Style) */}
        <section className="py-40 px-6 text-center w-full relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#7f99b0]/30 to-transparent"></div>
          
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-white/60 to-white/10 shadow-lg flex items-center justify-center border border-white/50 backdrop-blur-md">
              <img src="/logo-vela.png" alt="Vela Logo" className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#0f2136] to-[#194060] mb-8 pb-2">
            there's no need to wait.
          </h2>
          <p className="text-xl md:text-2xl text-[#1e2a3b]/70 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            try vela for free today — unlock the<br />
            email experience you've always been<br />
            promised.
          </p>
          <Link href="/login" className="group relative inline-flex items-center justify-center gap-2 bg-[#194060] hover:bg-[#0f2136] text-white px-8 py-3.5 rounded-full font-medium text-[15px] transition-all duration-300 shadow-[0_0_40px_-10px_rgba(25,64,96,0.5)] hover:shadow-[0_0_60px_-15px_rgba(25,64,96,0.7)]">
            <span>Get started</span>
            <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
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
