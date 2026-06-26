import React from 'react';
import { Sparkle, X } from '@phosphor-icons/react';
import Link from 'next/link';

export default function WelcomeUpgradeModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-[#2b323b] to-[#1a1f24] p-8 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition"
          >
            <X size={20} weight="bold" />
          </button>
          
          <div className="mx-auto w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Sparkle size={28} weight="fill" className="text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Ready to go Pro?</h2>
          <p className="text-[#c7d4ce] text-[15px] leading-relaxed">
            Welcome to Vela! Since you clicked "Get Pro", you can upgrade your account directly from your settings.
          </p>
        </div>
        
        <div className="p-6 bg-[#fbfbfc]">
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-[14px] hover:bg-gray-50 transition"
            >
              Maybe later
            </button>
            <Link 
              href="/inbox/settings/billing"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#2b323b] text-white font-medium text-[14px] hover:bg-[#50686c] transition flex items-center justify-center"
            >
              Go to Billing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
