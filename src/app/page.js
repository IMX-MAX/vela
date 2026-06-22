"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { EnvelopeSimple, Sparkle, Lightning, ShieldCheck, Keyboard, MagnifyingGlass, Strategy, HandPointing } from "@phosphor-icons/react";

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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-600 mb-8 animate-fade-in-up">
          <Sparkle size={14} weight="fill" className="text-purple-500" />
          Powered by Mistral AI
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight mb-6 max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
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
        <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl p-2 relative overflow-hidden">
          <div className="rounded-xl overflow-hidden border border-gray-100 bg-white flex aspect-[16/10]">
            <div className="w-64 border-r border-gray-100 bg-[#f9f9f8] p-4 flex flex-col gap-4">
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
              <div className="space-y-2 mt-4">
                <div className="h-8 w-full bg-gray-200 rounded-md"></div>
                <div className="h-8 w-full bg-transparent border border-gray-100 rounded-md"></div>
                <div className="h-8 w-full bg-transparent border border-gray-100 rounded-md"></div>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col gap-4 bg-[#fdfdfc]">
               <div className="border-b border-gray-100 pb-4 mb-2 flex justify-between">
                  <div className="h-5 w-40 bg-gray-200 rounded"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
               </div>
               <div className="h-16 w-full bg-[#f9f9f8] border border-gray-100 rounded-lg"></div>
               <div className="h-16 w-full bg-[#f9f9f8] border border-gray-100 rounded-lg"></div>
               <div className="h-16 w-full bg-[#f9f9f8] border border-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Everything you need to reach inbox zero.</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Vela is built from the ground up to eliminate the friction of modern email.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            <div className="flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-5 text-gray-800">
                <Lightning size={24} weight="bold" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Blazing Fast</h3>
              <p className="text-gray-500 leading-relaxed">Built on a highly optimized modern stack. Interactions are instantaneous, eliminating loading spinners so you can move as fast as you think.</p>
            </div>

            <div className="flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-5 text-gray-800">
                <Sparkle size={24} weight="bold" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mistral AI Summaries</h3>
              <p className="text-gray-500 leading-relaxed">Instantly extract the core message from long email threads with one click. Our AI distills paragraphs into actionable bullet points.</p>
            </div>

            <div className="flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-5 text-gray-800">
                <HandPointing size={24} weight="bold" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Intelligent Drafting</h3>
              <p className="text-gray-500 leading-relaxed">Tell the AI what you want to say in a few words, and watch it generate a perfectly formatted, professional email response automatically.</p>
            </div>

            <div className="flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-5 text-gray-800">
                <Keyboard size={24} weight="bold" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Keyboard First</h3>
              <p className="text-gray-500 leading-relaxed">Navigate your entire inbox, compose emails, and trigger AI actions without ever touching your mouse. True power-user efficiency.</p>
            </div>

            <div className="flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-5 text-gray-800">
                <MagnifyingGlass size={24} weight="bold" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deep Search</h3>
              <p className="text-gray-500 leading-relaxed">Find exactly what you are looking for with instantaneous search powered directly by the Gmail API, bringing up results as you type.</p>
            </div>

            <div className="flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-5 text-gray-800">
                <ShieldCheck size={24} weight="bold" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure by Default</h3>
              <p className="text-gray-500 leading-relaxed">Your data is secured by Appwrite and Google OAuth. We act as a lightning-fast client for your existing secure Gmail inbox.</p>
            </div>
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
