"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { EnvelopeSimple, Sparkle, Lightning, MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";

export default function LandingPage() {
  const { user, loading, checkAuth } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    checkAuth();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-[Inter] selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-lg tracking-tight text-white">
            <div className="bg-white text-black p-1.5 rounded-md">
              <EnvelopeSimple size={18} weight="fill" />
            </div>
            Vela
          </div>
          <div className="flex items-center gap-4">
            {!loading && user ? (
              <Link href="/inbox" className="text-xs font-medium bg-white/10 text-white px-5 py-2 rounded-full hover:bg-white/20 transition backdrop-blur-sm border border-white/10">
                Go to Inbox
              </Link>
            ) : (
              <Link href="/login" className="text-xs font-medium bg-white/10 text-white px-5 py-2 rounded-full hover:bg-white/20 transition backdrop-blur-sm border border-white/10">
                Try Vela
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 max-w-6xl mx-auto">
        {/* Abstract Gradient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/30 blur-[120px]"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-900/20 blur-[120px]"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
          {/* Gradient fade to bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
        </div>

        <div className="max-w-3xl pt-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-8 animate-fade-in-up backdrop-blur-md">
            <Sparkle size={14} weight="fill" className="text-purple-400" />
            Vela Intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-white leading-[1.1] mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            The email experience<br />you've been waiting for.
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {!loading && user ? (
              <Link href="/inbox" className="inline-flex items-center gap-2 text-sm font-medium bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition">
                Open Inbox <ArrowRight size={16} />
              </Link>
            ) : (
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition">
                Try Vela <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Stack */}
      <section className="px-6 pb-32 max-w-4xl mx-auto space-y-32">
        {/* Feature 1: Speed */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">Speed</div>
            <h3 className="text-2xl font-medium text-white mb-2">Built on a modern stack. Interactions are instantaneous.</h3>
          </div>
          <div className="aspect-[21/9] rounded-2xl bg-[#121212] border border-white/5 relative overflow-hidden flex items-center justify-center group">
             {/* Abstract visual for speed */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
             <div className="flex gap-2 items-center text-gray-600">
               <Lightning size={32} weight="fill" className="text-yellow-500/50" />
               <span className="font-mono text-sm">0ms latency</span>
             </div>
          </div>
        </div>

        {/* Feature 2: Keyboard */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">Keyboard First</div>
            <h3 className="text-2xl font-medium text-white mb-2">Navigate your entire inbox without ever touching your mouse.</h3>
          </div>
          <div className="aspect-[21/9] rounded-2xl bg-[#121212] border border-white/5 relative overflow-hidden flex items-center justify-center p-8">
             {/* Abstract visual for keyboard */}
             <div className="grid grid-cols-10 gap-2 w-full max-w-lg opacity-50">
               {Array.from({ length: 40 }).map((_, i) => (
                 <div key={i} className={`h-8 rounded bg-white/5 border border-white/10 ${i === 24 ? 'bg-white/20 border-white/30 text-center text-xs flex items-center justify-center text-white/50 font-mono' : ''}`}>
                    {i === 24 ? 'J' : ''}
                 </div>
               ))}
               <div className="col-span-10 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center mt-2">
                 <span className="text-xs text-white/30 font-mono">Space</span>
               </div>
             </div>
          </div>
        </div>

        {/* Feature 3: AI */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">Intelligence</div>
            <h3 className="text-2xl font-medium text-white mb-2">Instantly extract the core message from long email threads.</h3>
          </div>
          <div className="aspect-[21/9] rounded-2xl bg-[#121212] border border-white/5 relative overflow-hidden flex items-center justify-center">
             <div className="flex gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Sparkle size={20} weight="fill" className="text-purple-400" />
                <div className="flex flex-col gap-2 w-48">
                  <div className="h-2 w-full bg-white/20 rounded-full"></div>
                  <div className="h-2 w-3/4 bg-white/20 rounded-full"></div>
                </div>
             </div>
          </div>
        </div>

        {/* Feature 4: Search */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">Deep Search</div>
            <h3 className="text-2xl font-medium text-white mb-2">Find exactly what you are looking for instantly.</h3>
          </div>
          <div className="aspect-[21/9] rounded-2xl bg-[#121212] border border-white/5 relative overflow-hidden flex items-center justify-center">
             <div className="w-64 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center px-4 gap-3 text-gray-500">
               <MagnifyingGlass size={18} />
               <div className="h-4 w-[2px] bg-white/50 animate-pulse"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Sign Up Section */}
      <section className="py-32 px-6 text-center border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111] -z-10 pointer-events-none"></div>
        <h2 className="text-4xl font-medium text-white mb-6">Sign up today.</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Fly through your inbox and reclaim hours of your week with Vela.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 border border-white/10 text-white px-6 py-3 rounded-full hover:bg-white/20 transition">
          Get Started
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-sm text-gray-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-medium text-gray-400">
            <EnvelopeSimple size={16} weight="fill" />
            Vela
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-300 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
      
      {/* Global Animation Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
