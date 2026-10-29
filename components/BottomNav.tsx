'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import {
  Home,
  Calendar,
  PlayCircle,
  Award,
  GraduationCap,
  User,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { language, activeTab, setActiveTab, isTeacher } = useApp();
  const t = translations[language];

  const navItems = [
    {
      id: 'home' as const,
      label: isTeacher ? 'Daily Hub' : t.navHome,
      icon: Home,
    },
    {
      id: 'timetable' as const,
      label: t.navTimetable,
      icon: Calendar,
    },
    {
      id: 'lectures' as const,
      label: t.navLectures,
      icon: PlayCircle,
    },
    ...(isTeacher
      ? [
          {
            id: 'teacher_hub' as const,
            label: 'Faculty',
            icon: GraduationCap,
          },
        ]
      : [
          {
            id: 'results_fees' as const,
            label: 'Results',
            icon: Award,
          },
        ]),
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 px-2 pb-2 pt-1 pointer-events-none">
      <div className="relative pointer-events-auto bg-gradient-to-b from-[#6E1228] via-[#590D1E] to-[#420815] border-t-2 border-[#E5A332]/50 rounded-3xl p-1.5 shadow-[0_-4px_24px_rgba(69,9,22,0.4),0_8px_20px_rgba(0,0,0,0.3)] flex items-center justify-around overflow-hidden">
        {/* Subtle decorative gold filigree corner accents */}
        <div className="absolute top-0 left-2 w-8 h-1 bg-gradient-to-r from-transparent via-[#F8CF72] to-transparent opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-2 w-8 h-1 bg-gradient-to-r from-transparent via-[#F8CF72] to-transparent opacity-40 pointer-events-none" />

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl transition-all cursor-pointer flex-1 relative ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-[#E8D5C4]/80 hover:text-white font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-white/12 text-[#F8CF72]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-[#F8CF72]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 leading-none ${isActive ? 'text-white font-bold' : 'text-[#E8D5C4]/80'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-6 h-1 rounded-full bg-[#F8CF72] mt-1 shadow-[0_0_8px_rgba(248,207,114,0.9)] animate-in fade-in zoom-in-75 duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
