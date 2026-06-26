"use client";

import Link from "next/link";
import { ArrowLeft, EnvelopeSimple } from "@phosphor-icons/react";

export default function UnsubscribePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#eceae6] text-[#1e1e1e] font-[Inter]">
      <div className="h-14 border-b border-[#dddcdc] flex items-center px-4 sticky top-0 bg-[#eceae6]/90 backdrop-blur-sm z-10">
        <Link href="/" className="p-2 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#dddcdc]/50">
          <ArrowLeft size={18} />
        </Link>
        <div className="ml-2 font-medium text-[#2b323b]">Unsubscribe</div>
      </div>
      
      <div className="max-w-md mx-auto w-full px-8 py-24 flex flex-col items-center text-center">
        <div className="bg-[#dddcdc] p-4 rounded-full mb-6 text-[#194060]">
          <EnvelopeSimple size={48} weight="duotone" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-[#2b323b]">You've been unsubscribed</h1>
        <p className="text-[#1e2a3b]/80 mb-8 text-lg">
          We've updated your preferences. You will no longer receive marketing or promotional emails from Vela.
        </p>
        <Link 
          href="/" 
          className="bg-[#194060] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#194060]/90 transition-colors shadow-sm"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
