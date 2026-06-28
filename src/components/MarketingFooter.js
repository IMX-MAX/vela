"use client";

import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="py-12 md:py-24 w-full border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center md:items-end gap-10 md:gap-12 text-center md:text-left">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 text-gray-500 hover:text-black transition-colors">
          <Link href="/" className="font-semibold text-xl tracking-tight">vela</Link>
        </div>
        
        {/* Right: Links & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-8 md:gap-10">
          <div className="flex flex-col items-center md:items-end gap-2 text-[13px] font-medium text-gray-500">
            <Link href="/login" className="hover:text-black transition-colors">Log in</Link>
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/resources/vs-the-world" className="hover:text-black transition-colors">Vela vs the world</Link>
            <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy policy</Link>
            <Link href="/terms-of-service" className="hover:text-black transition-colors">Terms of service</Link>
          </div>
          <div className="text-[11px] text-gray-400 font-medium tracking-wide">
            © vela email 2026 - based in Canada
          </div>
        </div>
        
      </div>
    </footer>
  );
}
