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
          <Link href="/resources/vs-the-world" className="text-[12px] font-medium text-white hover:text-white/80 transition-colors flex items-center gap-1">
            Resources <CaretDown weight="bold" className="w-3 h-3 opacity-80" />
          </Link>
        </div>
        <Link href="/login" className="bg-white hover:bg-gray-100 text-[#414a48] px-4 py-1.5 rounded-full text-[12px] font-semibold transition-colors shadow-sm ml-2 sm:ml-0">
          Get started
        </Link>
      </nav>
    </div>
  );
}
