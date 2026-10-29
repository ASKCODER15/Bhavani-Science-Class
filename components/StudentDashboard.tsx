'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import {
  Calendar,
  PlayCircle,
  Award,
  CreditCard,
  Bell,
  ArrowRight,
  Clock,
  MapPin,
  CalendarX,
  History,
  RotateCcw,
  ChevronDown,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  BookOpen,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  PrismRayOpticsIllustration,
  ChemistryMoleculesIllustration,
  MathsIntegrationIllustration,
  BotanicalFlourish,
} from '@/components/ScienceIllustrations';
import { StudentDashboardSkeleton } from '@/components/skeletons/StudentDashboardSkeleton';

export const StudentDashboard: React.FC = () => {
  const {
    language,
    activeStudent,
    currentStudentFee,
    currentStudentResults,
    currentStudentLectures,
    currentStudentTimetable,
    currentStudentNotices,
    setActiveTab,
    currentAcademicYear,
    selectedAcademicYear,
    setSelectedAcademicYear,
    availableAcademicYears,
    isDataLoading,
  } = useApp();

  if (isDataLoading) {
    return <StudentDashboardSkeleton />;
  }
  const t = translations[language];

  const isViewingPastYear = selectedAcademicYear !== currentAcademicYear;

  const latestResult = currentStudentResults[0];
  const installmentDue = currentStudentFee?.installmentAmount || 0;

  // Day of week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const todayDay = days[new Date().getDay()];
  const todaysSlots = currentStudentTimetable.filter(
    (slot) => slot.dayOfWeek === (todayDay === 'Sunday' ? 'Monday' : todayDay)
  );

  const holidayNotice = currentStudentNotices.find((n) => n.isHoliday);
  const continueLecture = currentStudentLectures[0];

  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('phys')) return Atom;
    if (s.includes('chem')) return FlaskConical;
    if (s.includes('math')) return Calculator;
    if (s.includes('bio')) return Dna;
    return BookOpen;
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Academic Year Switcher Bar */}
      <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-[0_2px_8px_rgba(133,21,47,0.04)]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#85152F] dark:text-[#F8CF72]" />
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#79685E] dark:text-[#C5B7A8] font-medium">{t.academicYearLabel}:</span>
            <span className="font-bold text-[#2D211D] dark:text-[#FFFDF7]">
              {selectedAcademicYear}
            </span>
            {selectedAcademicYear === currentAcademicYear && (
              <span className="text-[10px] text-[#25844F] dark:text-[#34D399] font-bold bg-[#E8F5E9] dark:bg-[#1B3828] px-2 py-0.5 rounded-full border border-[#25844F]/30">
                Active
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="appearance-none bg-[#FFF0D0]/80 dark:bg-[#2A1E2E] hover:bg-[#FFF0D0] text-[#5D1025] dark:text-[#F8CF72] font-bold text-xs py-1.5 pl-3 pr-7 rounded-xl border border-[#EFCF98] dark:border-[#4A162B] focus:outline-none cursor-pointer shadow-xs"
          >
            {availableAcademicYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr} {yr === currentAcademicYear ? '• Current' : '• Past Archive'}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#85152F] dark:text-[#F8CF72] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Past Year Archive Alert Banner */}
      {isViewingPastYear && (
        <div className="p-3.5 rounded-2xl bg-[#FFF0D0] dark:bg-[#2F2119] border-2 border-[#E5A332]/60 dark:border-[#7A4B1A] flex items-center justify-between text-xs text-[#5D1025] dark:text-[#F8CF72] shadow-sm">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#E5A332]" />
            <span>Viewing archived session: <strong>{selectedAcademicYear}</strong></span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedAcademicYear(currentAcademicYear)}
            className="text-[11px] font-bold text-[#85152F] dark:text-[#F8CF72] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* Student Welcome Hero Card with Warm Texture & Science Details */}
      <section className="relative overflow-hidden bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-5 space-y-4 shadow-[0_8px_24px_rgba(133,21,47,0.06)]">
        {/* Subtle background art */}
        <div className="absolute right-0 top-0 opacity-15 pointer-events-none transform translate-x-4 -translate-y-2">
          <PrismRayOpticsIllustration className="w-28 h-28" />
        </div>

        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <span className="text-[11px] font-black text-[#85152F] dark:text-[#F8CF72] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E5A332]" />
              {greeting}
            </span>
            <h2 className="text-2xl font-serif font-black text-[#5D1025] dark:text-[#F8CF72] tracking-tight">
              {activeStudent?.name || 'Aryan Deshmukh'}
            </h2>
            <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] font-medium">
              Roll #{activeStudent?.rollNo || '101'} • {activeStudent?.class || 'Class 12'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] text-xs font-bold shadow-xs truncate max-w-[160px] border border-[#F8CF72]/30">
              {activeStudent?.batchName?.split(' - ')[0] || activeStudent?.batch || '12th JEE Elite'}
            </span>
          </div>
        </div>

        {/* Holiday Banner if present */}
        {holidayNotice && (
          <div className="p-3 rounded-2xl bg-[#FFF0D0] dark:bg-[#2D1F1C] border border-[#EFCF98] dark:border-[#5D1025] flex items-center gap-2.5 text-xs text-[#5D1025] dark:text-[#F8CF72]">
            <CalendarX className="w-4 h-4 text-[#B9193F] flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-bold block truncate">{holidayNotice.title}</span>
              <span className="text-[11px] text-[#79685E] dark:text-[#D5C2B4]">{holidayNotice.holidayDates || holidayNotice.date}</span>
            </div>
          </div>
        )}
      </section>

      {/* Quick Overview Grid: Next Test & Fees Chip */}
      <section className="grid grid-cols-2 gap-3">
        {/* Next Test / Latest Rank Card */}
        <button
          type="button"
          onClick={() => setActiveTab('results_fees')}
          className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] p-4 rounded-2xl text-left hover:border-[#85152F] dark:hover:border-[#F8CF72] transition-colors flex flex-col justify-between cursor-pointer shadow-[0_4px_12px_rgba(133,21,47,0.04)] group"
        >
          <div className="flex items-center justify-between text-[#79685E] dark:text-[#C5B7A8]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#85152F] dark:text-[#F8CF72]">
              {t.latestRank}
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#FFF0D0] dark:bg-[#2A1E2E] flex items-center justify-center text-[#E5A332]">
              <Award className="w-3.5 h-3.5 text-[#E5A332]" />
            </div>
          </div>
          <div className="mt-2.5 space-y-0.5">
            {latestResult ? (
              <>
                <div className="text-xl font-bold font-serif text-[#5D1025] dark:text-white">
                  #{latestResult.rank}{' '}
                  <span className="text-xs font-normal text-[#79685E] dark:text-[#BFAFA3]">
                    / {latestResult.totalStudents}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#25844F] dark:text-[#34D399] truncate">
                  {latestResult.percentile}%ile Score
                </p>
              </>
            ) : (
              <span className="text-xs text-[#79685E] block py-1">No test score</span>
            )}
          </div>
        </button>

        {/* Pending Fee Chip Card */}
        <button
          type="button"
          onClick={() => setActiveTab('results_fees')}
          className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] p-4 rounded-2xl text-left hover:border-[#85152F] dark:hover:border-[#F8CF72] transition-colors flex flex-col justify-between cursor-pointer shadow-[0_4px_12px_rgba(133,21,47,0.04)] group"
        >
          <div className="flex items-center justify-between text-[#79685E] dark:text-[#C5B7A8]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#85152F] dark:text-[#F8CF72]">
              {t.pendingFees}
            </span>
            <div className="w-6 h-6 rounded-lg bg-[#FFF0D0] dark:bg-[#2A1E2E] flex items-center justify-center text-[#85152F] dark:text-[#F8CF72]">
              <CreditCard className="w-3.5 h-3.5 text-[#85152F] dark:text-[#F8CF72]" />
            </div>
          </div>
          <div className="mt-2.5 space-y-0.5">
            <div className="text-xl font-bold font-serif text-[#5D1025] dark:text-white">
              ₹{installmentDue.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-bold text-[#85152F] dark:text-[#F8CF72] flex items-center gap-1 truncate">
              <span>{currentStudentFee?.currentInstallmentTitle || 'Installment Due'}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </button>
      </section>

      {/* Bhavani AI Study Assistant Card */}
      <div
        onClick={() => {
          const event = new CustomEvent('open-bhavani-chat');
          window.dispatchEvent(event);
        }}
        className="rounded-3xl p-4 bg-gradient-to-r from-[#691124] via-[#85152F] to-[#B9193F] text-white border-2 border-[#F8CF72]/50 shadow-[0_8px_20px_rgba(133,21,47,0.3)] flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-[#F8CF72] flex-shrink-0 shadow-xs bg-[#FFFDF7]">
            <Image
              src="/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png"
              alt="Bhavani Logo"
              fill
              sizes="40px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-serif font-black text-[#FFFDF7]">Bhavani Student AI</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#E5A332]/30 text-[#F8CF72] text-[9px] font-black uppercase">24/7 Guide</span>
            </div>
            <p className="text-[11px] text-[#F8CF72] font-semibold truncate">
              What is going on in class today? Ask lectures &amp; doubts
            </p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#F8CF72]" />
        </div>
      </div>

      {/* Today's Class / Schedule Card */}
      <section className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-5 space-y-3.5 shadow-[0_8px_24px_rgba(133,21,47,0.06)]">
        <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-serif font-black text-[#5D1025] dark:text-[#F8CF72]">
              {t.todaysSchedule}
            </h3>
          </div>
          <span className="text-xs font-bold text-[#85152F] dark:text-[#F8CF72] px-2.5 py-0.5 rounded-full bg-[#FFF0D0] dark:bg-[#2A1E2E] border border-[#EFCF98]">
            {todayDay}
          </span>
        </div>

        {todaysSlots.length > 0 ? (
          <div className="space-y-2.5">
            {todaysSlots.slice(0, 3).map((slot) => {
              const SubIcon = getSubjectIcon(slot.subject);
              return (
                <div
                  key={slot.id}
                  className="p-3 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28] flex items-start justify-between gap-3 text-xs shadow-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] dark:bg-[#2C1D2A] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <SubIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#2D211D] dark:text-white truncate">
                          {slot.subject}
                        </span>
                        <span className="text-[10px] text-[#79685E] dark:text-[#BFAFA3] font-medium">
                          ({slot.room})
                        </span>
                      </div>
                      <p className="text-xs text-[#5D1025] dark:text-[#F8CF72] font-semibold truncate">
                        {slot.topic}
                      </p>
                      <p className="text-[11px] text-[#79685E] dark:text-[#A8988C]">
                        {slot.teacher}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-[#85152F] dark:text-[#F8CF72] flex-shrink-0 bg-[#FFF0D0]/60 dark:bg-[#2B1B2C] px-2 py-1 rounded-lg border border-[#EFCF98]/60">
                    {slot.time.split(' - ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#79685E] dark:text-[#BFAFA3] py-4 text-center font-medium">
            {t.noLecturesToday}
          </p>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('timetable')}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-[#85152F] dark:text-[#F8CF72] hover:bg-[#FFF0D0] dark:hover:bg-[#2B1B2C] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View Full Week Timetable</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* "Continue Watching" Lecture Card */}
      {continueLecture && (
        <section className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-5 space-y-3.5 shadow-[0_8px_24px_rgba(133,21,47,0.06)]">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center">
                <PlayCircle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-serif font-black text-[#5D1025] dark:text-[#F8CF72]">
                Continue Watching
              </h3>
            </div>
            <span className="text-xs font-bold text-[#85152F] dark:text-[#F8CF72]">
              {continueLecture.subject}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('lectures')}
            className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28] hover:border-[#85152F] dark:hover:border-[#F8CF72] cursor-pointer transition-colors space-y-3 group shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <h4 className="text-xs font-bold text-[#2D211D] dark:text-white truncate group-hover:text-[#85152F] dark:group-hover:text-[#F8CF72] transition-colors">
                  {continueLecture.title}
                </h4>
                <p className="text-[11px] text-[#79685E] dark:text-[#A8988C]">
                  {continueLecture.teacherName} • {continueLecture.duration}
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] flex items-center justify-center flex-shrink-0 shadow-xs">
                <PlayCircle className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#79685E] dark:text-[#BFAFA3] font-bold">
                <span>32m / 48m</span>
                <span className="text-[#85152F] dark:text-[#F8CF72]">68% completed</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#FFF0D0] dark:bg-[#2D1F2D] overflow-hidden border border-[#EFCF98]/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#85152F] to-[#E5A332]"
                  style={{ width: '68%' }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Notices Timeline Card */}
      <section className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-5 space-y-3.5 shadow-[0_8px_24px_rgba(133,21,47,0.06)]">
        <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-serif font-black text-[#5D1025] dark:text-[#F8CF72]">
              {t.recentAnnouncements}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#79685E] dark:text-[#BFAFA3]">
            {currentStudentNotices.length} updates
          </span>
        </div>

        <div className="space-y-3">
          {currentStudentNotices.map((notice, idx) => {
            const isExam = notice.type === 'exam_alert';
            const isHoliday = notice.isHoliday;

            const tagColor = isExam
              ? 'text-[#85152F] bg-[#FFF0EE] border-[#B9193F]/40 dark:text-[#F8CF72] dark:bg-[#2D161F]'
              : isHoliday
              ? 'text-[#5D1025] bg-[#FFF0D0] border-[#E5A332]/50 dark:text-[#F8CF72] dark:bg-[#2B1E19]'
              : 'text-[#25844F] bg-[#E8F5E9] border-[#25844F]/40 dark:text-[#34D399] dark:bg-[#192D21]';

            const tagLabel = isExam ? 'Exam Alert' : isHoliday ? 'Holiday' : 'Notice';

            return (
              <div
                key={notice.id || idx}
                className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28] space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${tagColor}`}>
                    {tagLabel}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#79685E] dark:text-[#A8988C]">
                    {notice.date}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#2D211D] dark:text-white leading-snug">
                  {notice.title}
                </h4>

                <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] leading-relaxed">
                  {notice.content}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
