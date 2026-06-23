"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState, useRef } from "react";
import { CaretDown } from "@phosphor-icons/react";

export default function MarketingNavbar() {
  const { user, loading, checkAuth } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    checkAuth();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [checkAuth]);

  const ctaLink = !loading && user ? "/inbox" : "/login";
  const ctaText = !loading && user ? "Open Inbox" : "Get Started";

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? "bg-[#2b323b]/90 backdrop-blur-xl border-b border-white/[0.06] py-3" : "bg-transparent py-5"}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-medium text-base tracking-tight text-white">
            <img src="/logo.svg" alt="Vela Logo" className="h-7 w-auto rounded-lg bg-white p-1 shadow-sm" />
            <span className="font-semibold">Vela</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 mt-0.5 ml-4">
            <Link href="/pricing" className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/[0.05] transition">Pricing</Link>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/[0.05] transition flex items-center gap-1"
              >
                Resources <CaretDown size={12} weight="bold" className={`transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {isResourcesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#2b323b] border border-white/[0.08] shadow-xl rounded-xl py-1.5 overflow-hidden animate-fade-in-up origin-top-left z-50">
                  <Link 
                    href="/resources/vs-the-world" 
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition"
                    onClick={() => setIsResourcesOpen(false)}
                  >
                    Vela vs The World
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={ctaLink} className="text-xs font-medium bg-white text-[#2b323b] px-5 py-2 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-sm">
            {ctaText}
          </Link>
        </div>
      </div>
    </nav>
  );
}
