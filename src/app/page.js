"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState, useRef } from "react";
import { Sparkle, Lightning, MagnifyingGlass, ArrowRight, Command, EnvelopeSimple, ShieldCheck, Clock } from "@phosphor-icons/react";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";

export default function LandingPage() {
  const { user, loading, checkAuth } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    checkAuth();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const handleMouse = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };
    window.addEventListener("mousemove", handleMouse);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [checkAuth]);

  const ctaLink = !loading && user ? "/inbox" : "/login";
  const ctaText = !loading && user ? "Open Inbox" : "Get Started";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2f4f5] via-[#e5e7e9] to-[#cfd3d6] text-[#1e2a3b] font-[Inter] selection:bg-[#5a768c] selection:text-white overflow-x-hidden relative">
      
      {/* Navbar */}
      <MarketingNavbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center px-6 max-w-6xl mx-auto">
        
        {/* Dynamic dramatic lighting background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 bottom-0 left-[10%] w-[30%] bg-gradient-to-r from-black/[0.12] to-transparent blur-[60px] transform -skew-x-[20deg] origin-top"></div>
          <div className="absolute top-0 bottom-0 left-[25%] w-[15%] bg-gradient-to-r from-white/60 to-transparent blur-[40px] transform -skew-x-[20deg] origin-top"></div>
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-white/40 blur-[120px]"></div>
          
          {/* Subtle cursor tracking orb */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full transition-all duration-[2000ms] ease-out opacity-40 mix-blend-overlay"
            style={{
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, #ffffff 0%, transparent 70%)"
            }}
          ></div>
        </div>

        <div className="max-w-4xl pt-20 relative z-10">
          
          <h1 className="text-6xl md:text-[8rem] font-medium tracking-[-0.04em] text-[#1e2a3b] leading-[0.95] mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            the <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#1e2a3b] to-[#7f99b0]">future</span><br />
            of email <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#1e2a3b] to-[#7f99b0]">is</span><br />
            here
          </h1>
          
          <p className="text-lg md:text-xl text-[#1e2a3b]/60 max-w-lg leading-relaxed mb-10 animate-fade-in-up font-light" style={{ animationDelay: '0.15s' }}>
            Vela is the ultimate AI email client spearheading UI and AI in email. Experience the fastest email workflow, built for speed, clarity, and deep focus.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link href={ctaLink} className="group inline-flex items-center gap-2 text-sm font-medium bg-[#1e2a3b] text-white px-8 py-4 rounded-full hover:bg-[#2a3a4c] transition-all duration-200 shadow-xl shadow-black/10">
              {ctaText} <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <span className="text-xs text-[#1e2a3b]/50 font-medium">Free during beta</span>
          </div>
        </div>

      </section>

      {/* Bento Grid Features */}
      <section className="px-6 pb-32 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-[#1e2a3b] mb-4">Everything you need, nothing you don't.</h2>
          <p className="text-[#1e2a3b]/60 max-w-lg mx-auto text-sm leading-relaxed">Built from the ground up with a focus on speed, keyboard navigation, and AI intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feature 1: Speed - Large Card */}
          <div className="group relative rounded-3xl bg-white/40 border border-white/60 p-8 overflow-hidden hover:bg-white/60 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 md:row-span-2 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Lightning size={18} weight="fill" className="text-yellow-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-[#1e2a3b] mb-2">Blazing Fast</h3>
              <p className="text-sm text-[#1e2a3b]/60 leading-relaxed mb-8">Built on a modern stack. Every interaction is instantaneous — no loading spinners, no waiting.</p>
              
              {/* Speed Visual */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative">
                  <div className="text-6xl font-mono font-light text-[#1e2a3b]/10 group-hover:text-[#1e2a3b]/20 transition-colors duration-500">
                    0<span className="text-[#5a768c]">ms</span>
                  </div>
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-[#1e2a3b]/40 font-mono">perceived latency</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Keyboard */}
          <div className="group relative rounded-3xl bg-white/40 border border-white/60 p-8 overflow-hidden hover:bg-white/60 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Command size={18} weight="bold" className="text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-[#1e2a3b] mb-2">Keyboard First</h3>
              <p className="text-sm text-[#1e2a3b]/60 leading-relaxed mb-6">Navigate your entire inbox without ever touching your mouse. Every action has a shortcut.</p>
              
              {/* Keyboard Keys Visual */}
              <div className="flex items-center gap-1.5 justify-center">
                {['J', 'K', 'E', 'R', '#'].map((key) => (
                  <div key={key} className="h-9 w-9 rounded-lg bg-white/50 border border-white/80 flex items-center justify-center text-xs font-mono text-[#1e2a3b]/60 group-hover:border-white transition-all duration-300 shadow-sm">
                    {key}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3: AI */}
          <div className="group relative rounded-3xl bg-white/40 border border-white/60 p-8 overflow-hidden hover:bg-white/60 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Sparkle size={18} weight="fill" className="text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-[#1e2a3b] mb-2">AI Intelligence</h3>
              <p className="text-sm text-[#1e2a3b]/60 leading-relaxed mb-6">Instantly extract the core message from long threads. Draft replies in seconds with context-aware AI.</p>
              
              {/* AI Visual */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 border border-white/80 shadow-sm">
                <Sparkle size={16} weight="fill" className="text-purple-600 shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-1.5 w-full bg-[#1e2a3b]/10 rounded-full"></div>
                  <div className="h-1.5 w-3/4 bg-[#1e2a3b]/10 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center relative overflow-hidden z-10">
        <div className="relative z-10 bg-white/40 border border-white/60 backdrop-blur-2xl rounded-[3rem] max-w-4xl mx-auto p-16 shadow-2xl shadow-black/5">
          <h2 className="text-4xl md:text-5xl font-medium text-[#1e2a3b] mb-4 tracking-tight">Ready to try Vela?</h2>
          <p className="text-[#1e2a3b]/60 mb-10 max-w-md mx-auto text-sm leading-relaxed">
            Join the beta and experience email the way it should be.
          </p>
          <Link href={ctaLink} className="group inline-flex items-center gap-2 text-sm font-medium bg-[#1e2a3b] text-white px-8 py-4 rounded-full hover:bg-[#2a3a4c] transition-all duration-200 shadow-xl shadow-black/10">
            {ctaText} <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <MarketingFooter />
      
      {/* Global Animation Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
