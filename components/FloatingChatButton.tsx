'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { Sparkles, MessageCircle } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick: () => void;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick }) => {
  const { isTeacher } = useApp();

  return (
    <div className="fixed bottom-20 right-4 z-40 pointer-events-auto">
      <button
        type="button"
        onClick={onClick}
        className="group relative flex items-center gap-2 py-2 px-3.5 rounded-full bg-gradient-to-r from-[#85152F] via-[#9B1838] to-[#B9193F] text-white shadow-[0_8px_25px_rgba(133,21,47,0.45),0_2px_8px_rgba(0,0,0,0.2)] border-2 border-[#F8CF72] hover:scale-105 active:scale-95 transition-all cursor-pointer overflow-hidden"
        title="Open Bhavani AI Assistant"
        aria-label="Open Bhavani AI Assistant"
      >
        {/* Shimmer light effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

        {/* Bhavani Official Logo Avatar */}
        <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#F8CF72] flex-shrink-0 shadow-xs bg-[#FFFDF7]">
          <Image
            src="/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png"
            alt="Bhavani Science Classes"
            fill
            sizes="28px"
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex flex-col items-start leading-none">
          <span className="text-[11px] font-black tracking-tight text-[#FFFDF7] flex items-center gap-1">
            <span>Bhavani AI</span>
            <Sparkles className="w-3 h-3 text-[#F8CF72]" />
          </span>
          <span className="text-[8px] text-[#F8CF72] font-bold uppercase tracking-wider mt-0.5">
            {isTeacher ? 'Faculty Copilot' : 'Study Assistant'}
          </span>
        </div>
      </button>
    </div>
  );
};
