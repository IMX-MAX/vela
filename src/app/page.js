"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { EnvelopeSimple, Sparkle, Lightning, ShieldCheck } from "@phosphor-icons/react";

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
    <div className="min-h-screen bg-[#fdfdfc] text-[#1e1e1e] font-[Inter] selection:bg-black selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[#fdfdfc]/80 backdrop-blur-md border-b border-gray-200 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="bg-black text-white p-1.5 rounded-lg">
              <EnvelopeSimple size={20} weight="fill" />
            </div>
            Vela
          </div>
          <div className="flex items-center gap-4">
            {!loading && user ? (
              <Link href="/inbox" className="text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                Go to Inbox
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                Log in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-purple-200/40 via-blue-100/40 to-pink-100/40 blur-3xl -z-10 rounded-full opacity-70"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-600 mb-8 animate-fade-in-up">
          <Sparkle size={14} weight="fill" className="text-purple-500" />
          Powered by Mistral AI
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-black to-gray-700 leading-tight mb-6 max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          The fastest email experience ever made.
        </h1>
        
        <p className="text-xl text-gray-500 mb-10 max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Fly through your inbox with keyboard shortcuts, AI-powered summaries, and instantaneous intelligent drafting. Reclaim hours of your week.
        </p>
        
        <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {!loading && user ? (
            <Link href="/inbox" className="text-base font-medium bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Open your Inbox
            </Link>
          ) : (
            <Link href="/login" className="text-base font-medium bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Get Started for Free
            </Link>
          )}
        </div>
      </section>

      {/* Mock UI Preview */}
      <section className="px-6 max-w-5xl mx-auto pb-32 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-xl shadow-2xl p-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-10"></div>
          <div className="rounded-xl overflow-hidden border border-gray-100 bg-white flex aspect-[16/10]">
            <div className="w-64 border-r border-gray-100 bg-[#f9f9f8] p-4 flex flex-col gap-4">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2 mt-4">
                <div className="h-8 w-full bg-gray-200/60 rounded-md"></div>
                <div className="h-8 w-full bg-transparent rounded-md"></div>
                <div className="h-8 w-full bg-transparent rounded-md"></div>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col gap-4 bg-[#fdfdfc]">
               <div className="border-b border-gray-100 pb-4 mb-2 flex justify-between">
                  <div className="h-5 w-40 bg-gray-200 rounded"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
               </div>
               <div className="h-16 w-full bg-gray-100 rounded-lg"></div>
               <div className="h-16 w-full bg-gray-100 rounded-lg"></div>
               <div className="h-16 w-full bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#f9f9f8] border-t border-gray-200 py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-6 text-black">
              <Lightning size={28} weight="fill" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Blazing Fast</h3>
            <p className="text-gray-500">Built on modern architecture ensuring every action is instantaneous. Say goodbye to loading spinners.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-6 text-purple-600">
              <Sparkle size={28} weight="fill" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Intelligence</h3>
            <p className="text-gray-500">Automatically summarize long threads and draft professional replies with the power of Mistral AI.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-6 text-blue-600">
              <ShieldCheck size={28} weight="fill" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
            <p className="text-gray-500">Your emails remain yours. We use official Google APIs and enterprise-grade security to protect your inbox.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <EnvelopeSimple size={20} weight="fill" />
            Vela
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-black transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-black transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
      
      {/* Global Animation Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
