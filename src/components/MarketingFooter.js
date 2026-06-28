"use client";

import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="py-12 md:py-24 w-full border-t border-transparent">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center md:items-end gap-10 md:gap-12">
        
        {/* Left: Logo */}
        <div className="flex items-center text-gray-400 hover:text-black transition-colors md:mb-0">
          <Link href="/" className="font-semibold text-[22px] tracking-tight">vela</Link>
        </div>
        
        {/* Right: Links & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-6 md:gap-8">
          <div className="flex flex-col items-center md:items-end gap-1.5 text-[12px] font-medium text-gray-500 lowercase">
            <Link href="/login" className="hover:text-black transition-colors">log in</Link>
            <Link href="/pricing" className="hover:text-black transition-colors">pricing</Link>
            <Link href="/resources/vs-the-world" className="hover:text-black transition-colors">vela vs the world</Link>
            <Link href="/privacy-policy" className="hover:text-black transition-colors">privacy policy</Link>
            <Link href="/terms-of-service" className="hover:text-black transition-colors">terms of service</Link>
          </div>
          <div className="text-[10px] text-gray-400 font-medium tracking-wide lowercase">
            © vela email 2026 - based in canada
          </div>
        </div>
        
      </div>
    </footer>
  );
}
