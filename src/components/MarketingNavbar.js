"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PaperPlaneRight, CaretDown } from "@phosphor-icons/react";

export default function MarketingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 w-full z-50 flex justify-center pointer-events-none px-4">
      <nav className={`pointer-events-auto flex items-center justify-between px-3 py-2 rounded-full w-full max-w-[480px] transition-all duration-500 ${isScrolled ? 'bg-black/20 backdrop-blur-xl shadow-lg border border-white/10' : 'bg-[#9eaead]/30 backdrop-blur-md border border-white/10'}`}>
        <div className="flex items-center pl-1">
          <Link href="/" className="flex items-center text-white hover:opacity-80 transition-opacity">
            <PaperPlaneRight weight="bold" className="w-5 h-5" />
          </Link>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/pricing" className="text-[12px] font-medium text-white hover:text-white/80 transition-colors">Pricing</Link>
          <div className="relative group">
            <button className="text-[12px] font-medium text-white hover:text-white/80 transition-colors flex items-center gap-1 py-4">
              Resources <CaretDown weight="bold" className="w-3 h-3 opacity-80" />
            </button>
            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 w-[180px] shadow-xl flex flex-col gap-1">
                <Link href="/resources/vs-the-world" className="text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                  Vela vs The World
                </Link>
                <Link href="/resources/blog" className="text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                  Blog
                </Link>
                <Link href="/resources/help" className="text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-2 sm:ml-0">
          <Link href="/login" className="hidden sm:block text-[12px] font-semibold text-white hover:text-white/80 transition-colors">
            Log in
          </Link>
          <Link href="https://tally.so/r/Meg52p" target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-gray-100 text-[#414a48] px-4 py-1.5 rounded-full text-[12px] font-semibold transition-colors shadow-sm">
            Join the waitlist
          </Link>
        </div>
      </nav>
    </div>
  );
}
