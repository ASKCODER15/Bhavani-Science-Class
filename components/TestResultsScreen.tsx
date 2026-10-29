'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { FeePaymentScreen } from './FeePaymentScreen';
import { TestResult } from '@/lib/types';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  Award,
  CreditCard,
  Share2,
  Sparkles,
  MessageSquare,
  Download,
  X,
  Copy,
  QrCode,
  CheckCircle,
} from 'lucide-react';
import { TestResultsSkeleton } from '@/components/skeletons/TestResultsSkeleton';

export const TestResultsScreen: React.FC = () => {
  const {
    language,
    currentStudentResults,
    currentStudentFee,
    activeStudent,
    selectedAcademicYear,
    isDataLoading,
  } = useApp();

  const t = translations[language];

  const [activeSection, setActiveSection] = useState<'results' | 'fees'>('results');
  const [selectedTestToShare, setSelectedTestToShare] = useState<TestResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (isDataLoading) {
    return <TestResultsSkeleton />;
  }

  // Trigger confetti when student shares score
  const handleShareStory = (test: TestResult) => {
    setSelectedTestToShare(test);
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#85152F', '#E5A332', '#25844F', '#F8CF72'],
      });
    } catch {
      // Ignore if unavailable
    }
  };

  const handleCopyShareText = (test: TestResult) => {
    const text = `🏆 Bhavani Science Classes (Virar West) Official Result Card!\nStudent: ${activeStudent?.name || 'Aryan Deshmukh'}\nBatch: ${activeStudent?.batchName || '12th JEE Elite'}\nExam: ${test.testTitle}\nRank: #${test.rank} of ${test.totalStudents} (${test.percentile}%ile)\nScore: ${test.totalMarks} / ${test.maxMarks}\nConcept First, Excellence Forever!`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (activeSection === 'fees') {
    return (
      <div className="space-y-4">
        {/* Top Minimal Switcher */}
        <div className="max-w-md mx-auto px-4 pt-3">
          <div className="bg-[#FFF0D0]/70 dark:bg-[#201525] p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 border border-[#EFCF98] dark:border-[#4A162B]">
            <button
              type="button"
              onClick={() => setActiveSection('results')}
              className="py-2.5 text-xs font-bold rounded-xl text-[#79685E] dark:text-[#C5B7A8] hover:text-[#2D211D] dark:hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Test Marks &amp; Rank</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('fees')}
              className="bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] font-bold shadow-xs py-2.5 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Fees &amp; Receipts</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#E5A332] text-[#2D211D] font-black uppercase">
                UPI
              </span>
            </button>
          </div>
        </div>

        <FeePaymentScreen />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Top Switcher */}
      <div className="bg-[#FFF0D0]/70 dark:bg-[#201525] p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 border border-[#EFCF98] dark:border-[#4A162B]">
        <button
          type="button"
          onClick={() => setActiveSection('results')}
          className="bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] font-bold shadow-xs py-2.5 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Award className="w-4 h-4" />
          <span>Test Marks &amp; Rank</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('fees')}
          className="py-2.5 text-xs font-bold rounded-xl text-[#79685E] dark:text-[#C5B7A8] hover:text-[#2D211D] dark:hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay Fees &amp; Receipts</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] font-black uppercase border border-[#EFCF98]">
            UPI
          </span>
        </button>
      </div>

      {/* Quick Pay Fees Alert Banner if dues exist */}
      {currentStudentFee && currentStudentFee.pendingFee > 0 && (
        <div className="bg-[#FFF0D0] dark:bg-[#291A25] border-2 border-[#E5A332] dark:border-[#7A4B1A] rounded-3xl p-4 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(229,163,50,0.12)]">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5A332] animate-pulse flex-shrink-0" />
              <span className="text-xs font-serif font-black text-[#5D1025] dark:text-[#F8CF72] uppercase tracking-wide">
                Installment Due: ₹{currentStudentFee.pendingFee.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-[#79685E] dark:text-[#D5C2B4] truncate">
              {currentStudentFee.currentInstallmentTitle || 'Installment 2'} • Scan GPay / PhonePe / Paytm QR
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveSection('fees')}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] font-bold text-xs flex items-center gap-1.5 shadow-xs hover:brightness-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer border border-[#F8CF72]/30"
          >
            <QrCode className="w-3.5 h-3.5 text-[#F8CF72]" />
            <span>Pay Fee</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-[#85152F] dark:text-[#F8CF72] uppercase tracking-widest block">
            Academic Scorecard
          </span>
          <h2 className="text-2xl font-serif font-black text-[#5D1025] dark:text-[#F8CF72] tracking-tight">
            {t.testResultsTitle}
          </h2>
          <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] font-medium">
            {activeStudent?.name} • Roll #{activeStudent?.rollNo} • Session {selectedAcademicYear}
          </p>
        </div>

        <div className="w-9 h-9 rounded-2xl bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#E5A332] flex items-center justify-center border border-[#EFCF98] dark:border-[#4A162B] shadow-xs">
          <Award className="w-4 h-4" />
        </div>
      </div>

      {/* Test Results Cards */}
      <div className="space-y-4">
        {currentStudentResults.length > 0 ? (
          currentStudentResults.map((test) => {
            const percentage = (test.totalMarks / test.maxMarks) * 100;
            const formattedPercentage = percentage.toFixed(1);
            const radius = 30;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            return (
              <div
                key={test.id}
                className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-5 space-y-4 shadow-[0_6px_20px_rgba(133,21,47,0.06)]"
              >
                {/* Top Row: Test Title, Date, and Rank Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <span className="font-mono text-[10px] text-[#79685E] dark:text-[#C5B7A8] font-bold block">
                      {test.date} • {test.academicYear}
                    </span>
                    <h3 className="text-base font-serif font-black text-[#5D1025] dark:text-white leading-snug">
                      {test.testTitle}
                    </h3>
                  </div>

                  {/* Rank Badge */}
                  <div className="px-3 py-1.5 rounded-2xl bg-[#FFF0D0] dark:bg-[#2A1E2E] border-2 border-[#E5A332] text-center flex-shrink-0 shadow-xs">
                    <span className="text-[9px] font-black uppercase text-[#85152F] dark:text-[#F8CF72] block tracking-wider">
                      Rank
                    </span>
                    <span className="text-base font-black font-serif text-[#5D1025] dark:text-[#F8CF72]">
                      #{test.rank}
                    </span>
                    <span className="text-[9px] text-[#79685E] dark:text-[#BFAFA3] block">
                      of {test.totalStudents}
                    </span>
                  </div>
                </div>

                {/* Score Showcase */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28] flex items-center justify-around gap-4">
                  {/* Circular Progress Ring */}
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-[#FFF0D0] dark:text-[#381F28]"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="#85152F"
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold font-serif text-[#5D1025] dark:text-[#F8CF72] leading-none">
                        {formattedPercentage}%
                      </span>
                      <span className="text-[9px] text-[#79685E] uppercase font-bold tracking-tight mt-0.5">
                        Score
                      </span>
                    </div>
                  </div>

                  {/* Total Marks & Percentile Details */}
                  <div className="space-y-1.5 flex-1">
                    <div>
                      <span className="text-[10px] font-bold text-[#79685E] dark:text-[#BFAFA3] uppercase tracking-wider block">
                        Total Marks Scored
                      </span>
                      <div className="text-2xl font-serif font-black text-[#5D1025] dark:text-white">
                        {test.totalMarks}{' '}
                        <span className="text-xs font-normal font-sans text-[#79685E] dark:text-[#BFAFA3]">
                          / {test.maxMarks}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#E8F5E9] dark:bg-[#1B3828] text-[#25844F] dark:text-[#34D399] text-xs font-bold border border-[#25844F]/30">
                        {test.percentile}%ile Score
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject-Wise Bars */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[10px] font-black text-[#85152F] dark:text-[#F8CF72] uppercase tracking-wider block px-1">
                    {t.subjectWiseBreakdown}
                  </span>
                  {test.subjects.map((sub, sIdx) => {
                    const subPct = Math.round((sub.marks / sub.max) * 100);
                    return (
                      <div key={sIdx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#2D211D] dark:text-[#F5EFE6]">{sub.name}</span>
                          <span className="font-mono text-[#5D1025] dark:text-[#F8CF72]">
                            {sub.marks} / {sub.max} ({subPct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#FFF0D0] dark:bg-[#2A1D2B] overflow-hidden border border-[#EFCF98]/40">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#85152F] to-[#E5A332]"
                            style={{ width: `${subPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Faculty Remarks if present */}
                {test.remarks && (
                  <div className="p-3 rounded-2xl bg-[#FFF0D0] dark:bg-[#2A1E20] border border-[#EFCF98] dark:border-[#5D1025] text-xs text-[#5D1025] dark:text-[#F8CF72] flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#B9193F] flex-shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed font-medium">{test.remarks}</p>
                  </div>
                )}

                {/* Share Button */}
                <button
                  type="button"
                  onClick={() => handleShareStory(test)}
                  className="w-full py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-[#85152F] via-[#9E1B38] to-[#5D1025] hover:from-[#5D1025] hover:to-[#85152F] text-[#FFFDF7] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_4px_12px_rgba(133,21,47,0.25)] border border-[#F8CF72]/40 active:scale-[0.99]"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#F8CF72]" />
                  <span>Share My Result Story</span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-8 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0D0] dark:bg-[#2A1E2E] mx-auto flex items-center justify-center text-[#E5A332]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-black text-[#5D1025] dark:text-white">
              No test scores published for {selectedAcademicYear}
            </h3>
            <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] max-w-xs mx-auto">
              Exam marks are evaluated and uploaded directly by subject teachers.
            </p>
          </div>
        )}
      </div>

      {/* Share Result Story Modal with Downloadable Card */}
      {selectedTestToShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] p-5 shadow-2xl text-[#2D211D] dark:text-white space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E5A332]" />
                <h3 className="font-serif font-black text-sm text-[#5D1025] dark:text-[#F8CF72]">
                  Shareable Story Card
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTestToShare(null)}
                className="p-1.5 rounded-xl text-[#79685E] hover:text-[#2D211D] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Regal Indian Academic Story Card (WhatsApp / Instagram Stories) */}
            <div
              id="story-card"
              className="rounded-3xl p-5 bg-gradient-to-b from-[#5D1025] via-[#450A19] to-[#2D0610] text-[#FFFDF7] shadow-xl relative overflow-hidden space-y-4 border-2 border-[#E5A332]/60"
            >
              {/* Subtle gold filigree accent on corners */}
              <div className="absolute top-2 right-2 w-12 h-12 rounded-full border border-[#F8CF72]/20 pointer-events-none" />

              {/* Card Header with Class Crest */}
              <div className="flex items-center justify-between relative z-10 border-b border-[#F8CF72]/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-[#F8CF72] shadow-xs bg-[#FFFCF4] flex-shrink-0">
                    <Image
                      src="/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png"
                      alt="Bhavani Logo"
                      fill
                      sizes="44px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-serif font-black tracking-tight text-[#FFFDF7]">
                      BHAVANI SCIENCE CLASSES
                    </h4>
                    <p className="text-[10px] text-[#F8CF72] font-semibold">
                      Virar West • XI, XII, IIT-JEE &amp; NEET
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-[#E5A332] text-[#2D0610] text-[9px] font-black uppercase">
                  Verified Score
                </span>
              </div>

              {/* Student Identification */}
              <div className="relative z-10 space-y-0.5">
                <span className="text-[9px] font-bold text-[#F8CF72] uppercase tracking-wider block">
                  Candidate Score Card
                </span>
                <h3 className="text-xl font-serif font-black text-[#FFFDF7]">
                  {activeStudent?.name || 'Aryan Deshmukh'}
                </h3>
                <p className="text-xs text-[#E8D5C4]">
                  Roll #{activeStudent?.rollNo || '042'} • {activeStudent?.batchName || '12th JEE Main & Advanced - Elite'}
                </p>
              </div>

              {/* Score & Rank Highlight */}
              <div className="relative z-10 p-3.5 rounded-2xl bg-white/10 border border-[#F8CF72]/40 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-[#E8D5C4] uppercase tracking-wider block">
                    Total Marks
                  </span>
                  <div className="text-2xl font-serif font-black text-[#FFFDF7]">
                    {selectedTestToShare.totalMarks}{' '}
                    <span className="text-xs text-[#E8D5C4] font-normal font-sans">
                      / {selectedTestToShare.maxMarks}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#4ADE80]">
                    {selectedTestToShare.percentile}%ile Score
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold text-[#E8D5C4] uppercase tracking-wider block">
                    Institute Rank
                  </span>
                  <div className="text-2xl font-serif font-black text-[#F8CF72]">
                    #{selectedTestToShare.rank}
                  </div>
                  <span className="text-[10px] text-[#E8D5C4]">
                    among {selectedTestToShare.totalStudents} students
                  </span>
                </div>
              </div>

              {/* Subject Breakdown Badges */}
              <div className="relative z-10 grid grid-cols-3 gap-1.5 text-center text-xs">
                {selectedTestToShare.subjects.map((sub, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-2 rounded-xl bg-white/10 border border-white/10 space-y-0.5"
                  >
                    <span className="text-[9px] text-[#E8D5C4] block truncate font-medium">
                      {sub.name}
                    </span>
                    <span className="font-mono font-bold text-[#F8CF72] text-xs">
                      {sub.marks}/{sub.max}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card Footer */}
              <div className="relative z-10 pt-2.5 border-t border-[#F8CF72]/20 flex items-center justify-between text-[10px] text-[#E8D5C4]">
                <span className="truncate">{selectedTestToShare.testTitle}</span>
                <span className="font-mono flex-shrink-0 font-bold">{selectedTestToShare.date}</span>
              </div>
            </div>

            {/* Sharing Action Buttons */}
            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🎉 My results from Bhavani Science Classes (Virar West)!\nStudent: ${
                    activeStudent?.name || 'Aryan Deshmukh'
                  }\nExam: ${selectedTestToShare.testTitle}\nRank: #${
                    selectedTestToShare.rank
                  } of ${selectedTestToShare.totalStudents}\nScore: ${
                    selectedTestToShare.totalMarks
                  }/${selectedTestToShare.maxMarks} (${selectedTestToShare.percentile}%ile)\nConcept First, Excellence Forever!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share to WhatsApp Status / Chat</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyShareText(selectedTestToShare)}
                  className="py-2.5 rounded-2xl text-xs font-bold border-2 border-[#EFCF98] dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-850 text-[#5D1025] dark:text-stone-200 hover:bg-[#FFF0D0] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#85152F]" />
                  <span>{copiedLink ? 'Copied!' : 'Copy Summary'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="py-2.5 rounded-2xl text-xs font-bold border-2 border-[#EFCF98] dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-850 text-[#5D1025] dark:text-stone-200 hover:bg-[#FFF0D0] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#85152F]" />
                  <span>Print Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
