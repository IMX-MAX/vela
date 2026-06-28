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
      <nav className={`pointer-events-auto flex items-center justify-between px-2 py-1.5 rounded-full border transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-gray-200 shadow-sm' : 'bg-white/50 backdrop-blur-sm border-gray-200/50'}`}>
        <div className="flex items-center gap-6 px-4">
          <Link href="/" className="flex items-center gap-2 text-black hover:opacity-80 transition-opacity">
            <span className="font-semibold text-[15px] tracking-tight">vela</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/pricing" className="text-[13px] font-medium text-gray-500 hover:text-black transition-colors">Pricing</Link>
            <Link href="/resources/vs-the-world" className="text-[13px] font-medium text-gray-500 hover:text-black transition-colors">Resources</Link>
          </div>
        </div>
        <Link href="/login" className="bg-white border border-gray-200 hover:bg-gray-50 text-black px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm ml-4">
          Get started
        </Link>
      </nav>
    </div>
  );
}
