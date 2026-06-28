"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MarketingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 w-full z-50 flex justify-center pointer-events-none">
      <nav className={`pointer-events-auto flex items-center justify-between px-2 py-1.5 rounded-full transition-all duration-500 ${isScrolled ? 'bg-black/60 backdrop-blur-xl shadow-lg border border-white/10' : 'bg-black/20 backdrop-blur-md border border-white/5'}`}>
        <div className="flex items-center gap-3 sm:gap-6 px-3 sm:px-4">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <span className="font-semibold text-[15px] tracking-tight">vela</span>
          </Link>
          <div className="hidden sm:flex items-center gap-5">
            <Link href="/pricing" className="text-[13px] font-medium text-white/80 hover:text-white transition-colors">Pricing</Link>
            <Link href="/resources/vs-the-world" className="text-[13px] font-medium text-white/80 hover:text-white transition-colors">Resources</Link>
          </div>
        </div>
        <Link href="/login" className="bg-white hover:bg-gray-100 text-black px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm ml-2 sm:ml-4">
          Get started
        </Link>
      </nav>
    </div>
  );
}
