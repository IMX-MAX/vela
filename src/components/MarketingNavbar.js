"use client";

import Link from "next/link";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export default function MarketingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? "bg-white/40 backdrop-blur-xl border-b border-black/[0.04] py-4" : "bg-transparent py-8"}`}>
      <div className="max-w-[1400px] mx-auto px-12 md:px-24 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 text-[#1e2a3b] opacity-80 hover:opacity-100 transition-opacity">
          <PaperPlaneTilt size={24} weight="bold" />
          <span className="font-semibold text-xl tracking-tight mt-0.5">vela</span>
        </Link>
        
        {/* Right: Links */}
        <div className="flex items-center gap-8">
          <Link href="/pricing" className="text-[15px] font-medium text-[#1e2a3b]/70 hover:text-[#1e2a3b] transition-colors">pricing</Link>
          <Link href="/resources/vs-the-world" className="text-[15px] font-medium text-[#1e2a3b]/70 hover:text-[#1e2a3b] transition-colors">resources</Link>
          <Link href="/login" className="px-6 py-2.5 rounded-full bg-[#305a7d] hover:bg-[#194060] text-white text-[15px] font-medium transition-colors ml-2 shadow-lg shadow-black/5">
            sign in
          </Link>
        </div>
        
      </div>
    </nav>
  );
}
