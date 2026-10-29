'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Moon,
  Sun,
  Bell,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface AppHeaderProps {
  onOpenChat?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenChat }) => {
  const {
    language,
    setLanguage,
    user,
    isTeacher,
    isSuperAdmin,
    superAdminProfile,
    activeStudent,
    isDarkMode,
    toggleDarkMode,
    setActiveTab,
  } = useApp();
  const t = translations[language];

  const initials = isSuperAdmin
    ? (superAdminProfile.avatarInitials || 'AD')
    : activeStudent?.name
    ? activeStudent.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <header className="sticky top-0 z-40 bg-[#FEF8ED]/95 dark:bg-[#140A0F]/95 backdrop-blur-md border-b border-[#F0DFC8] dark:border-[#38111C] transition-colors">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Brand with Class Logo & Serif Title */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
        >
          <div className="relative flex-shrink-0 w-10 h-10 rounded-2xl overflow-hidden border border-[#EFCF98] dark:border-[#521927] shadow-[0_2px_6px_rgba(133,21,47,0.08)] group-hover:scale-105 transition-transform bg-[#FFFBF2] dark:bg-[#251019]">
            <Image
              src="/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png"
              alt="Bhavani Science Classes"
              fill
              sizes="40px"
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="min-w-0">
            <h1 className="font-serif text-[13px] sm:text-sm font-extrabold tracking-tight truncate leading-tight text-[#2D211D] dark:text-[#FFFDF9]">
              {t.instituteName}
            </h1>
            <p className="text-[10px] text-[#79685E] dark:text-[#CBB5A7] font-medium truncate">
              Virar (W) • {isTeacher ? 'Faculty workspace' : 'Student portal'}
            </p>
          </div>
        </div>

        {/* Right side controls matching screenshot: Bell with red dot + AD burgundy avatar with dropdown */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <PWAInstallButton />

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#79685E] dark:text-[#E8D5C4] hover:bg-[#FCEAD2] dark:hover:bg-[#2A111A] transition-all cursor-pointer"
            title="Toggle theme"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-[#F8CF72]" />
            ) : (
              <Moon className="w-4 h-4 text-[#79685E]" />
            )}
          </button>

          {/* Bhavani AI Assistant Quick Button */}
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="h-8 px-2.5 rounded-full bg-gradient-to-r from-[#85152F] via-[#9B1838] to-[#B9193F] text-white flex items-center gap-1.5 shadow-xs border border-[#F8CF72] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Open Bhavani AI Assistant"
              aria-label="Open Bhavani AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F8CF72]" />
              <span className="text-[11px] font-bold text-[#FFFDF7]">AI</span>
            </button>
          )}

          {/* Notification Bell with red dot */}
          <button
            type="button"
            onClick={() => setActiveTab(isTeacher ? 'teacher_hub' : 'results_fees')}
            className="w-8 h-8 rounded-full bg-[#FFF5E6] dark:bg-[#230F17] border border-[#F2DEBF] dark:border-[#4A1724] text-[#2D211D] dark:text-[#E8D5C4] flex items-center justify-center relative hover:bg-[#FDE7C7] transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#2D211D] dark:text-[#E8D5C4]" />
            <span className="w-2 h-2 rounded-full bg-[#B9193F] absolute top-1.5 right-1.5 ring-2 ring-[#FFF5E6] dark:ring-[#230F17]" />
          </button>

          {/* User profile avatar in rich burgundy with dropdown arrow */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="h-8 px-2.5 rounded-full bg-gradient-to-r from-[#7A1E2D] to-[#5D1025] text-white font-bold text-xs flex items-center gap-1 shadow-[0_2px_8px_rgba(93,16,37,0.35)] hover:from-[#8B2334] hover:to-[#6E132C] active:scale-95 transition-all cursor-pointer border border-[#E5A332]/40"
            title="Profile"
            aria-label="Open Profile"
          >
            <span>{initials}</span>
            <ChevronDown className="w-3 h-3 text-[#F8CF72]" />
          </button>
        </div>
      </div>
    </header>
  );
};
