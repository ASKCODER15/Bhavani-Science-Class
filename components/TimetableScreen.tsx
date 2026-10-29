'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  BookOpen,
} from 'lucide-react';
import { TimetableSkeleton } from '@/components/skeletons/TimetableSkeleton';

export const TimetableScreen: React.FC = () => {
  const {
    language,
    activeStudent,
    currentStudentTimetable,
    isDataLoading,
  } = useApp();

  const t = translations[language];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const todayIndex = new Date().getDay();
  const todayName = todayIndex === 0 ? 'Monday' : daysOfWeek[todayIndex - 1] || 'Monday';
  const [selectedDay, setSelectedDay] = useState<string>(todayName);

  if (isDataLoading) {
    return <TimetableSkeleton />;
  }

  const filteredSlots = currentStudentTimetable.filter(
    (slot) => slot.dayOfWeek === selectedDay
  );

  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('phys')) return Atom;
    if (s.includes('chem')) return FlaskConical;
    if (s.includes('math')) return Calculator;
    if (s.includes('bio')) return Dna;
    return BookOpen;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-black text-[#5D1025] dark:text-[#F8CF72] tracking-tight">
            {t.weeklyTimetable}
          </h2>
          <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] font-medium">
            {activeStudent?.batchName || '12th JEE Main & Advanced - Elite'}
          </p>
        </div>

        <div className="w-9 h-9 rounded-2xl bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center border border-[#EFCF98] dark:border-[#4A162B] shadow-xs">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      {/* Horizontal Day Selector */}
      <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] p-1.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {daysOfWeek.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = day === todayName;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-1 text-center ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] shadow-xs scale-[1.02]'
                    : 'text-[#79685E] dark:text-[#C5B7A8] hover:bg-[#FFF0D0]/50 dark:hover:bg-[#2B1B2C]'
                }`}
              >
                <span>{day.slice(0, 3)}</span>
                {isToday && (
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ml-1 ${
                      isSelected ? 'bg-[#F8CF72]' : 'bg-[#85152F]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Info */}
      <div className="flex items-center justify-between px-1 text-xs text-[#79685E] dark:text-[#C5B7A8] font-semibold">
        <span>{selectedDay}&apos;s Schedule ({filteredSlots.length} sessions)</span>
        {selectedDay === todayName && (
          <span className="text-xs font-bold text-[#85152F] dark:text-[#F8CF72] px-2 py-0.5 rounded-full bg-[#FFF0D0] dark:bg-[#2B1B2C] border border-[#EFCF98]">
            Today
          </span>
        )}
      </div>

      {/* Class Cards List */}
      <div className="space-y-3">
        {filteredSlots.length > 0 ? (
          filteredSlots.map((slot, index) => {
            const SubIcon = getSubjectIcon(slot.subject);
            return (
              <div
                key={slot.id || index}
                className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 space-y-3 shadow-[0_4px_16px_rgba(133,21,47,0.05)]"
              >
                {/* Header row: Subject, Icon, Time */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FFF0D0] dark:bg-[#2C1D2A] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center flex-shrink-0 border border-[#EFCF98] dark:border-[#4A162B]">
                      <SubIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#85152F] dark:text-[#F8CF72]">
                        Lecture #{index + 1}
                      </span>
                      <h3 className="text-base font-serif font-black text-[#5D1025] dark:text-[#FFFDF7]">
                        {slot.subject}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#85152F] dark:text-[#F8CF72] bg-[#FFF0D0]/80 dark:bg-[#2B1B2C] px-2.5 py-1 rounded-xl border border-[#EFCF98]/70">
                    <Clock className="w-3.5 h-3.5 text-[#B9193F]" />
                    <span>{slot.time}</span>
                  </div>
                </div>

                {/* Topic Title */}
                <div className="p-3 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28]">
                  <span className="text-[10px] font-black text-[#79685E] dark:text-[#BFAFA3] uppercase tracking-wider block">
                    Syllabus Topic
                  </span>
                  <p className="text-xs font-bold text-[#2D211D] dark:text-[#F5EFE6]">
                    {slot.topic}
                  </p>
                </div>

                {/* Footer: Faculty & Room */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#EFCF98]/50 dark:border-[#381F28]">
                  <div className="flex items-center gap-1.5 text-[#5D1025] dark:text-[#F8CF72] font-semibold">
                    <User className="w-3.5 h-3.5 text-[#85152F]" />
                    <span>{slot.teacher}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#79685E] dark:text-[#C5B7A8] bg-[#FFF0D0] dark:bg-[#2A1E2E] px-2.5 py-0.5 rounded-lg border border-[#EFCF98]">
                    <MapPin className="w-3 h-3 text-[#B9193F]" />
                    <span>{slot.room}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-8 text-center space-y-2.5 shadow-xs">
            <Calendar className="w-8 h-8 text-[#E5A332] mx-auto" />
            <h3 className="text-base font-serif font-black text-[#5D1025] dark:text-[#F8CF72]">
              No classes scheduled for {selectedDay}
            </h3>
            <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] max-w-xs mx-auto leading-relaxed">
              Self-study revision day or dedicated mock test series. Watch your recorded video lectures in the Lectures tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
