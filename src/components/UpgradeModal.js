import React from 'react';
import { Sparkle, X } from '@phosphor-icons/react';
import Link from 'next/link';

export default function UpgradeModal({ onClose }) {
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
          <h2 className="text-2xl font-bold text-white mb-2">Usage Limit Reached</h2>
          <p className="text-[#c7d4ce] text-[15px] leading-relaxed">
            You've hit your free AI action limit for the month. Upgrade to Pro to get 40 actions every single day.
          </p>
        </div>
        
        <div className="p-6 bg-[#fbfbfc]">
          <ul className="space-y-3 mb-8 text-[14px] text-gray-700">
            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[10px]">✓</div>
              40 AI actions per day
            </li>
            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[10px]">✓</div>
              Advanced contextual drafting
            </li>
            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[10px]">✓</div>
              General AI assistant access
            </li>
          </ul>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-[14px] hover:bg-gray-50 transition"
            >
              Maybe later
            </button>
            <Link 
              href="/inbox/settings"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#2b323b] text-white font-medium text-[14px] hover:bg-[#50686c] transition flex items-center justify-center"
            >
              View Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
