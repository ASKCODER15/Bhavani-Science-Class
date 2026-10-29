'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { LectureNote } from '@/lib/types';
import {
  User,
  Moon,
  Sun,
  LogOut,
  Calendar,
  Phone,
  ShieldCheck,
  MessageSquare,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  Edit3,
  ShieldAlert,
  Crown,
  X,
  FileText,
  Clock,
  PlayCircle,
  Bookmark,
  Copy,
  Trash2,
  Search,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';

export const ProfileScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    activeStudent,
    user,
    role,
    isTeacher,
    isSuperAdmin,
    superAdminProfile,
    updateSuperAdminProfile,
    currentAcademicYear,
    selectedAcademicYear,
    setSelectedAcademicYear,
    availableAcademicYears,
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    logout,
    setActiveTab,
    isDataLoading,
    studentNotes,
    deleteLectureNote,
    setTargetLectureToPlay,
    showToast,
  } = useApp();
  const t = translations[language];

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState(superAdminProfile);
  const [notesSubjectFilter, setNotesSubjectFilter] = useState<string>('All');
  const [notesSearchQuery, setNotesSearchQuery] = useState<string>('');

  if (isDataLoading) {
    return <ProfileSkeleton />;
  }

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
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-black text-[#5D1025] dark:text-[#F8CF72] tracking-tight">
            {isTeacher ? 'Teacher Profile' : 'Student Profile'}
          </h2>
          <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] font-medium">
            {isTeacher
              ? 'Faculty credentials & center workspace settings'
              : 'Student identity & application preferences'}
          </p>
        </div>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2 rounded-xl border border-[#EFCF98] dark:border-[#4A162B] bg-[#FFFCF4] dark:bg-[#1A1322] text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1.5 cursor-pointer text-xs font-bold hover:bg-[#FFF0D0] dark:hover:bg-[#2A1E2E] transition-colors shadow-xs"
        >
          {isDarkMode ? (
            <Sun className="w-3.5 h-3.5 text-[#F8CF72]" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-[#85152F]" />
          )}
          <span>{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Main Profile Card: Teacher or Student */}
      {isTeacher ? (
        <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#E5A332] dark:border-[#7A4B1A] rounded-3xl p-5 space-y-4 shadow-[0_8px_24px_rgba(229,163,50,0.12)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-[#85152F] text-[#F8CF72] border-2 border-[#F8CF72] flex items-center justify-center font-black text-xl shadow-xs font-serif">
                  {superAdminProfile.avatarInitials || 'AD'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#25844F] border-2 border-[#FFFCF4] dark:border-[#1A1322] flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black text-[#5D1025] dark:text-[#F8CF72] uppercase bg-[#FFF0D0] dark:bg-[#2A1E2E] px-2.5 py-0.5 rounded-md border border-[#EFCF98] dark:border-[#5D1025]">
                    Teacher
                  </span>
                  <span className="text-[10px] font-bold text-[#25844F] dark:text-[#34D399] bg-[#E8F5E9] dark:bg-[#1B3828] px-2 py-0.5 rounded-md">
                    Active Faculty
                  </span>
                </div>

                <h3 className="text-base font-serif font-black text-[#5D1025] dark:text-white">
                  {superAdminProfile.name.replace(/Director\s*\/\s*/i, '')}
                </h3>

                <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] font-bold">
                  {superAdminProfile.designation.replace(/Founder\s*&\s*Academic Director/i, 'Head Faculty')}
                </p>

                <p className="text-[11px] text-[#79685E] dark:text-[#A8988C]">
                  {superAdminProfile.email} • {superAdminProfile.phone}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAdminForm(superAdminProfile);
                setShowEditAdminModal(true);
              }}
              className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] font-black text-xs flex items-center gap-1.5 shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex-shrink-0 border border-[#F8CF72]/40"
              title="Edit Teacher Profile"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#F8CF72]" />
              <span>Edit</span>
            </button>
          </div>

          {/* Bio & Visiting Hours */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28] text-xs space-y-2">
            <p className="text-[#2D211D] dark:text-[#F5EFE6] leading-relaxed italic">
              &ldquo;{superAdminProfile.bio}&rdquo;
            </p>
            <div className="flex items-center justify-between pt-1.5 border-t border-[#EFCF98]/50 dark:border-stone-800 text-[11px]">
              <span className="text-[#79685E] dark:text-[#BFAFA3] font-medium">Visiting / Consultation:</span>
              <span className="font-bold text-[#5D1025] dark:text-[#F8CF72]">
                {superAdminProfile.officeHours}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-5 space-y-4 shadow-[0_8px_24px_rgba(133,21,47,0.06)]">
          <div className="flex items-start gap-3.5">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] flex items-center justify-center font-bold text-lg font-serif shadow-xs">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#25844F] border-2 border-white dark:border-[#1A1322] flex items-center justify-center">
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#85152F] dark:text-[#F8CF72] uppercase bg-[#FFF0D0] dark:bg-[#2B1B2C] px-2 py-0.5 rounded-md border border-[#EFCF98]">
                  {activeStudent?.class || 'Class 12'}
                </span>
                <span className="text-xs text-[#EFCF98]">•</span>
                <span className="text-xs text-[#79685E] dark:text-[#C5B7A8] font-bold">
                  Roll #{activeStudent?.rollNo || '042'}
                </span>
              </div>

              <h3 className="text-base font-serif font-black text-[#5D1025] dark:text-white truncate">
                {activeStudent?.name || user?.displayName || 'Aryan Deshmukh'}
              </h3>

              <p className="text-xs text-[#79685E] dark:text-[#A8988C] truncate">
                {activeStudent?.email || user?.email || 'student@bhavaniscience.edu'}
              </p>
            </div>
          </div>

          {/* Batch & Session */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28] flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#79685E] dark:text-[#BFAFA3] uppercase block">Enrolled Batch</span>
              <span className="font-bold text-[#2D211D] dark:text-[#F5EFE6]">
                {activeStudent?.batchName || '12th JEE Main & Adv - Elite'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-[#79685E] dark:text-[#BFAFA3] uppercase block">Academic Session</span>
              <span className="font-bold text-[#85152F] dark:text-[#F8CF72]">
                {selectedAcademicYear}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* My Saved Lecture Notes Section (Persisted to student profile) */}
      <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-1 border-b border-[#EFCF98]/40 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center border border-[#EFCF98]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-serif font-black text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1.5">
                <span>{t.myLectureNotes || 'My Saved Lecture Notes'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#85152F] text-[#F8CF72] font-black">
                  {studentNotes.length}
                </span>
              </h3>
              <p className="text-[10px] text-[#79685E] dark:text-[#C5B7A8]">
                Timestamped study points &amp; formulas from class lectures
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('lectures')}
            className="text-[11px] font-bold text-[#85152F] dark:text-[#F8CF72] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Lectures</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Chips & Search if notes exist */}
        {studentNotes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'].map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setNotesSubjectFilter(subj)}
                  className={`py-1 px-2.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    notesSubjectFilter === subj
                      ? 'bg-[#85152F] text-[#FFFDF7] shadow-xs'
                      : 'bg-[#FFF0D0]/60 dark:bg-[#2A1E2E] text-[#79685E] dark:text-[#C5B7A8] hover:bg-[#FFF0D0]'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            {/* Quick Search inside notes */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#79685E]" />
              <input
                type="text"
                value={notesSearchQuery}
                onChange={(e) => setNotesSearchQuery(e.target.value)}
                placeholder="Search formulas or concepts in your notes..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#EFCF98] dark:border-[#4A162B] bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white placeholder:text-[#79685E]/70 focus:outline-none focus:border-[#85152F] font-medium"
              />
            </div>
          </div>
        )}

        {/* Notes List or Empty State */}
        {(() => {
          const filteredNotes = studentNotes.filter((note) => {
            const matchesSub =
              notesSubjectFilter === 'All' ||
              note.subject.toLowerCase() === notesSubjectFilter.toLowerCase();
            const query = notesSearchQuery.toLowerCase();
            const matchesQuery =
              !query ||
              note.text.toLowerCase().includes(query) ||
              note.lectureTitle.toLowerCase().includes(query);
            return matchesSub && matchesQuery;
          });

          if (filteredNotes.length === 0) {
            return (
              <div className="p-4 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28] text-center space-y-2">
                <Bookmark className="w-5 h-5 text-[#E5A332] mx-auto opacity-70" />
                <p className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72]">
                  {studentNotes.length === 0
                    ? 'No lecture notes saved yet'
                    : 'No notes match your filter'}
                </p>
                <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8] max-w-xs mx-auto">
                  Watch official video lectures and click &ldquo;Take Notes&rdquo; to save timestamped formulas and doubts directly to your profile.
                </p>
                {studentNotes.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('lectures')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] font-bold text-xs hover:brightness-105 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>Browse Lectures</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          }

          return (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28] space-y-2 group hover:border-[#85152F] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#FFF0D0] text-[#85152F] border border-[#EFCF98]">
                        {note.subject}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetLectureToPlay({
                            lectureId: note.lectureId,
                            timestampSeconds: note.timestampSeconds,
                          });
                          setActiveTab('lectures');
                          showToast(`Opening lecture at ${note.timestampFormatted}...`, 'info');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#85152F] text-[#F8CF72] hover:bg-[#5D1025] transition-colors cursor-pointer"
                        title="Jump straight to this moment in video"
                      >
                        <PlayCircle className="w-3 h-3 text-[#F8CF72]" />
                        <span>{note.timestampFormatted}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const textToCopy = `[${note.timestampFormatted}] ${note.lectureTitle} (${note.subject}): ${note.text}`;
                          if (typeof navigator !== 'undefined' && navigator.clipboard) {
                            navigator.clipboard.writeText(textToCopy);
                            showToast('Note copied to clipboard!', 'success');
                          }
                        }}
                        className="p-1 rounded-lg text-[#79685E] hover:text-[#2D211D] dark:hover:text-white cursor-pointer"
                        title="Copy note text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteLectureNote(note.id)}
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] font-bold text-[#2D211D] dark:text-white truncate">
                    {note.lectureTitle}
                  </p>

                  <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] font-medium leading-relaxed whitespace-pre-wrap bg-[#FFFCF4] dark:bg-[#1A1322] p-2.5 rounded-xl border border-[#EFCF98]/50 dark:border-stone-800">
                    {note.text}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-[#79685E] font-medium">
                    <span>
                      {new Date(note.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetLectureToPlay({
                          lectureId: note.lectureId,
                          timestampSeconds: note.timestampSeconds,
                        });
                        setActiveTab('lectures');
                        showToast(`Opening lecture at ${note.timestampFormatted}...`, 'info');
                      }}
                      className="text-[#85152F] dark:text-[#F8CF72] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Play in Video Player</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Preferences Section */}
      <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 space-y-3.5 shadow-xs">
        <h4 className="text-[11px] font-black text-[#85152F] dark:text-[#F8CF72] uppercase tracking-wider px-1">
          Preferences &amp; Appearance
        </h4>

        {/* Academic Year Switcher */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2D211D] dark:text-white">Academic Session</p>
              <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8]">Switch current or past records</p>
            </div>
          </div>

          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="text-xs font-bold bg-[#FFF0D0] dark:bg-[#2A1E2E] text-[#85152F] dark:text-[#F8CF72] py-1.5 px-3 rounded-xl border border-[#EFCF98] focus:outline-none cursor-pointer"
          >
            {availableAcademicYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr} {yr === currentAcademicYear ? '• Current' : '• Past'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Tools Shortcut (Only if teacher / super admin) */}
      {isTeacher && (
        <div className="bg-[#FFF0D0]/80 dark:bg-[#221626] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#85152F] dark:text-[#F8CF72]" />
              <h4 className="text-xs font-serif font-black text-[#5D1025] dark:text-[#F8CF72]">
                Faculty Workspace
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#85152F] text-[#F8CF72] text-[10px] font-black uppercase">
              Teacher
            </span>
          </div>
          <p className="text-xs text-[#79685E] dark:text-[#C5B7A8]">
            Manage timetable slots, lecture links, marks, announcements &amp; student batches.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('teacher_hub')}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1 shadow-xs"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Open Faculty Hub</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Support & Desk Contact */}
      <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 space-y-2.5 shadow-xs">
        <h4 className="text-[11px] font-black text-[#85152F] dark:text-[#F8CF72] uppercase tracking-wider px-1">
          Institute Helpdesk
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <a
            href="https://wa.me/919168925687"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-2xl bg-[#E8F5E9] dark:bg-[#192D21] border border-[#25844F]/40 text-[#25844F] dark:text-[#34D399] flex items-center gap-2 font-bold hover:brightness-105 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-[#25844F]" />
            <span>WhatsApp Desk</span>
          </a>

          <a
            href="tel:+919168925687"
            className="p-2.5 rounded-2xl bg-[#FFF0D0] dark:bg-[#2B1B2C] border border-[#EFCF98] text-[#85152F] dark:text-[#F8CF72] flex items-center gap-2 font-bold hover:brightness-105 transition-colors"
          >
            <Phone className="w-4 h-4 text-[#B9193F]" />
            <span>Call Virar Office</span>
          </a>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-2">
        {!showConfirmLogout ? (
          <button
            type="button"
            onClick={() => setShowConfirmLogout(true)}
            className="w-full py-3.5 rounded-2xl text-xs font-black text-[#85152F] dark:text-rose-400 bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-rose-900/50 hover:bg-[#FFF0EE] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Portal</span>
          </button>
        ) : (
          <div className="p-4 rounded-3xl border-2 border-[#E97562]/60 bg-[#FFF0EE] dark:bg-[#2A141A] space-y-2.5 text-center shadow-xs">
            <p className="text-xs font-bold text-[#5D1025] dark:text-[#FFE0D6]">
              Are you sure you want to sign out?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmLogout(false)}
                className="py-2.5 rounded-xl bg-[#FFFCF4] dark:bg-stone-800 border border-[#EFCF98] dark:border-stone-700 text-xs font-bold text-[#79685E] dark:text-stone-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={logout}
                className="py-2.5 rounded-xl bg-[#85152F] text-xs font-black text-white hover:bg-[#5D1025] cursor-pointer shadow-xs"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Edit Teacher Profile */}
      {showEditAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] text-[#85152F] flex items-center justify-center border border-[#EFCF98]">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-serif font-black text-[#5D1025] dark:text-white">
                  Edit Teacher Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditAdminModal(false)}
                className="p-1.5 rounded-xl text-[#79685E] hover:text-[#2D211D] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateSuperAdminProfile(adminForm);
                setShowEditAdminModal(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">
                  Full Name &amp; Title *
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="Director / Prof. A. R. Deshmukh"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-[#EFCF98] bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white font-bold focus:outline-none focus:border-[#85152F]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">
                  Designation / Role *
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.designation}
                  onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
                  placeholder="Founder & Academic Director (Physics)"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-[#EFCF98] bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white font-bold focus:outline-none focus:border-[#85152F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                    placeholder="+91 98200 45678"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-[#EFCF98] bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white font-bold focus:outline-none focus:border-[#85152F]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">
                    Avatar Initials
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={adminForm.avatarInitials}
                    onChange={(e) => setAdminForm({ ...adminForm, avatarInitials: e.target.value.toUpperCase() })}
                    placeholder="AD"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-[#EFCF98] bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white font-black text-center uppercase focus:outline-none focus:border-[#85152F]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">
                  Root Admin Email (Account Fixed)
                </label>
                <input
                  type="email"
                  value={adminForm.email}
                  disabled
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EFCF98] bg-[#FFF0D0]/50 text-[#79685E] font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">
                  Visiting / Office Hours
                </label>
                <input
                  type="text"
                  value={adminForm.officeHours}
                  onChange={(e) => setAdminForm({ ...adminForm, officeHours: e.target.value })}
                  placeholder="e.g. Mon-Sat: 10:00 AM - 02:00 PM"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-[#EFCF98] bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white font-bold focus:outline-none focus:border-[#85152F]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">
                  Bio / Message to Students
                </label>
                <textarea
                  rows={3}
                  value={adminForm.bio}
                  onChange={(e) => setAdminForm({ ...adminForm, bio: e.target.value })}
                  placeholder="Inspiring quote or guidance for students..."
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-[#EFCF98] bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white font-medium focus:outline-none focus:border-[#85152F]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditAdminModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EFCF98] text-[#79685E] font-bold hover:bg-[#FFF0D0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#85152F] to-[#B9193F] text-white font-black shadow-xs cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
