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
    <div className="min-h-screen bg-[#2b323b] text-white font-[Inter] selection:bg-[#50686c] selection:text-white overflow-x-hidden">
      
      {/* Navbar */}
      <MarketingNavbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center px-6 max-w-6xl mx-auto">
        {/* Dynamic gradient that follows mouse */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div
            className="absolute w-[600px] h-[600px] rounded-full transition-all duration-[2000ms] ease-out opacity-20"
            style={{
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, #50686c 0%, transparent 70%)"
            }}
          ></div>
          <div className="absolute top-[-15%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#50686c]/15 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-[#50686c]/10 blur-[120px]"></div>
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_50%_50%,black_20%,transparent_70%)]"></div>
        </div>

        <div className="max-w-3xl pt-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-gray-400 mb-10 animate-fade-in-up backdrop-blur-md">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            Now in Beta
          </div>
          
          <h1 className="text-5xl md:text-[5.5rem] font-medium tracking-[-0.03em] text-white leading-[1.05] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Email,<br />reimagined.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-lg leading-relaxed mb-10 animate-fade-in-up font-light" style={{ animationDelay: '0.15s' }}>
            An AI-native email client built for speed, clarity, and deep focus. Fly through your inbox and reclaim hours of your week.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link href={ctaLink} className="group inline-flex items-center gap-2 text-sm font-medium bg-white text-[#2b323b] px-7 py-3.5 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-black/20">
              {ctaText} <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <span className="text-xs text-gray-500 font-medium">Free during beta</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/40 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="px-6 pb-32 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">Everything you need, nothing you don't.</h2>
          <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">Built from the ground up with a focus on speed, keyboard navigation, and AI intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feature 1: Speed - Large Card */}
          <div className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 overflow-hidden hover:border-white/[0.12] transition-all duration-500 md:row-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-[#50686c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Lightning size={18} weight="fill" className="text-yellow-500" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Blazing Fast</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">Built on a modern stack. Every interaction is instantaneous — no loading spinners, no waiting.</p>
              
              {/* Speed Visual */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative">
                  <div className="text-6xl font-mono font-light text-white/10 group-hover:text-white/20 transition-colors duration-500">
                    0<span className="text-[#50686c]">ms</span>
                  </div>
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600 font-mono">perceived latency</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Keyboard */}
          <div className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 overflow-hidden hover:border-white/[0.12] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#50686c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Command size={18} weight="bold" className="text-blue-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Keyboard First</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">Navigate your entire inbox without ever touching your mouse. Every action has a shortcut.</p>
              
              {/* Keyboard Keys Visual */}
              <div className="flex items-center gap-1.5 justify-center">
                {['J', 'K', 'E', 'R', '#'].map((key) => (
                  <div key={key} className="h-9 w-9 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-xs font-mono text-gray-400 group-hover:border-white/[0.16] transition-all duration-300">
                    {key}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3: AI */}
          <div className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 overflow-hidden hover:border-white/[0.12] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Sparkle size={18} weight="fill" className="text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">AI Intelligence</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">Instantly extract the core message from long threads. Draft replies in seconds with context-aware AI.</p>
              
              {/* AI Visual */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <Sparkle size={16} weight="fill" className="text-purple-400 shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-1.5 w-full bg-white/10 rounded-full"></div>
                  <div className="h-1.5 w-3/4 bg-white/10 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Search */}
          <div className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 overflow-hidden hover:border-white/[0.12] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#50686c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <MagnifyingGlass size={18} weight="bold" className="text-emerald-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Deep Search</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">Find exactly what you're looking for instantly. Search across subjects, senders, and content.</p>
              
              {/* Search Visual */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <MagnifyingGlass size={16} className="text-gray-500 shrink-0" />
                <div className="h-4 w-[2px] bg-white/30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Feature 5: Privacy */}
          <div className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 overflow-hidden hover:border-white/[0.12] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#50686c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <ShieldCheck size={18} weight="fill" className="text-teal-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Private by Default</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Your data stays yours. We never sell your information or train models on your emails.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-24 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "< 100ms", label: "Response time" },
            { value: "100%", label: "Keyboard navigable" },
            { value: "10x", label: "Faster than Gmail" },
            { value: "0", label: "Trackers allowed" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-medium text-white mb-1 tracking-tight">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#50686c]/10 blur-[120px]"></div>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-4 tracking-tight">Ready to try Vela?</h2>
          <p className="text-gray-400 mb-10 max-w-md mx-auto text-sm leading-relaxed">
            Join the beta and experience email the way it should be.
          </p>
          <Link href={ctaLink} className="group inline-flex items-center gap-2 text-sm font-medium bg-white text-[#2b323b] px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-black/20">
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
