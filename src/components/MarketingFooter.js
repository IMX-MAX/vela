"use client";

import Link from "next/link";
import { PaperPlaneTilt } from "@phosphor-icons/react";

export default function MarketingFooter() {
  return (
    <footer className="py-24 w-full">
      <div className="max-w-[1400px] mx-auto px-12 md:px-24 flex flex-col md:flex-row justify-between items-end gap-12">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3 text-[#1e2a3b] opacity-60">
          <span className="font-medium text-4xl tracking-tight">vela</span>
        </div>
        
        {/* Right: Links & Copyright */}
        <div className="flex flex-col items-end gap-12">
          <div className="flex flex-col items-end gap-1 text-[15px] font-medium text-[#1e2a3b]/70">
            <Link href="/login" className="hover:text-[#1e2a3b] transition-colors">log in</Link>
            <Link href="/pricing" className="hover:text-[#1e2a3b] transition-colors">pricing</Link>
            <Link href="/resources/vs-the-world" className="hover:text-[#1e2a3b] transition-colors">vela vs the world</Link>
          </div>
          <div className="text-[13px] text-[#1e2a3b]/50 font-medium">
            © vela email 2026 - based in Canada
          </div>
        </div>
        
      </div>
    </footer>
  );
}
