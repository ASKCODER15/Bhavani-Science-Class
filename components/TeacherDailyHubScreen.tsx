'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { FacultyHeroIllustration } from '@/components/ScienceIllustrations';
import {
  Activity,
  Users,
  Calendar,
  Award,
  Video,
  Plus,
  Clock,
  Sparkles,
  Copy,
  MessageCircle,
  CheckCircle2,
  Bell,
  MapPin,
  ArrowRight,
  TrendingUp,
  CreditCard,
  ChevronRight,
  UserCheck,
  Send,
  X,
} from 'lucide-react';

export const TeacherDailyHubScreen: React.FC = () => {
  const {
    language,
    students,
    batches,
    timetable,
    notices,
    testResults,
    currentAcademicYear,
    setActiveTab,
    postNotice,
    showToast,
  } = useApp();

  const t = translations[language];

  // Selected batch filter for today's schedule
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || 'jee-2025-a');
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'exam_alert',
    targetBatch: 'all',
  });

  // Calculate day of week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const todayDay = daysOfWeek[new Date().getDay()];
  const displayDay = todayDay === 'Sunday' ? 'Monday' : todayDay;

  // Today's timetable slots
  const todaysSlots = timetable.filter(
    (slot) => slot.dayOfWeek === displayDay && (selectedBatchId === 'all' || slot.batchId === selectedBatchId)
  );

  // Center metrics
  const activeStudentsCount = students.filter((s) => s.status === 'active' || s.active !== false).length;
  const todaysAllSlotsCount = timetable.filter((slot) => slot.dayOfWeek === displayDay).length;
  const totalTestsPublished = testResults.length;

  const handleCopyDailyBriefing = () => {
    const text = `📊 *BHAVANI SCIENCE CLASSES — DAILY ACADEMIC HUB*\n📍 Virar West Campus | Academic Session: ${currentAcademicYear}\n🗓 Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}\n\n👥 Active Enrolled Students: ${activeStudentsCount}\n📚 Today's Scheduled Lectures: ${todaysAllSlotsCount}\n📝 Evaluated Test Records: ${totalTestsPublished}\n\nConcept First • Excellence in XI, XII, JEE, NEET & MHT-CET.`;
    navigator.clipboard.writeText(text);
    showToast('Daily briefing copied to clipboard!', 'success');
  };

  const handleShareWhatsAppBriefing = () => {
    const text = `📊 *BHAVANI SCIENCE CLASSES — DAILY ACADEMIC HUB*\n📍 Virar West Campus | Academic Session: ${currentAcademicYear}\n🗓 Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}\n\n👥 Active Students: ${activeStudentsCount}\n📚 Today's Lectures: ${todaysAllSlotsCount}\n📝 Evaluated Tests: ${totalTestsPublished}\n\nConcept First • Excellence in XI, XII, JEE & NEET.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePostNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      showToast('Please enter title and notice content.', 'error');
      return;
    }
    await postNotice({
      title: newNotice.title.trim(),
      content: newNotice.content.trim(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: newNotice.type,
      batchId: newNotice.targetBatch || 'all',
      academicYear: currentAcademicYear,
      isHoliday: false,
      priority: 'normal',
      postedBy: 'Faculty Desk',
    });
    setShowAddNoticeModal(false);
    setNewNotice({ title: '', content: '', type: 'general', targetBatch: 'all' });
    showToast('Announcement posted successfully!', 'success');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Top Academic Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden border-2 border-[#EFCF98] dark:border-[#4A162B] shadow-xs bg-[#FFFCF4] dark:bg-[#1A1322] flex-shrink-0">
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
          <div>
            <h2 className="text-xl font-serif font-black text-[#5D1025] dark:text-[#F8CF72] tracking-tight">
              Teacher Daily Hub
            </h2>
            <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8] font-bold">
              Session {currentAcademicYear} • Daily Operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] text-[10px] font-black uppercase tracking-wider shadow-xs border border-[#F8CF72]/40">
            Teacher
          </span>
        </div>
      </div>

      {/* Hero Executive Card with Warm Artwork and Live Status */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#5D1025] via-[#480B1C] to-[#2B040E] text-[#FFFDF7] shadow-[0_10px_28px_rgba(93,16,37,0.25)] border-2 border-[#E5A332]/50 space-y-3.5">
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E5A332]/20 text-[#F8CF72] text-[10px] font-black border border-[#E5A332]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25844F] animate-pulse" />
              <span>Virar (W) Center Operational Live</span>
            </div>
            <h3 className="text-lg font-serif font-black tracking-tight text-[#FFFDF7] flex items-center gap-2">
              <span>Daily Executive Briefing</span>
              <Sparkles className="w-4 h-4 text-[#F8CF72] flex-shrink-0" />
            </h3>
            <p className="text-xs text-[#E8D5C4] font-medium">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyDailyBriefing}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer active:scale-95"
              title="Copy formatted daily report"
            >
              <Copy className="w-3 h-3 text-[#F8CF72]" />
              <span>Copy</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsAppBriefing}
              className="px-2.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white text-[10px] font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Share report on WhatsApp"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Counters in 3D Claymorphic Panels */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#F8CF72]/20 text-center relative z-10">
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-[#F8CF72] uppercase font-bold tracking-wider block">Students</span>
            <span className="text-xl font-serif font-black text-[#FFFDF7]">{activeStudentsCount}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-[#F8CF72] uppercase font-bold tracking-wider block">Today Slots</span>
            <span className="text-xl font-serif font-black text-[#FFFDF7]">{todaysAllSlotsCount}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-[#F8CF72] uppercase font-bold tracking-wider block">Batches</span>
            <span className="text-xl font-serif font-black text-[#FFFDF7]">{batches.length}</span>
          </div>
        </div>
      </div>

      {/* Bhavani Faculty AI Copilot Card */}
      <div
        onClick={() => {
          const event = new CustomEvent('open-bhavani-chat');
          window.dispatchEvent(event);
        }}
        className="rounded-3xl p-4 bg-gradient-to-r from-[#5D1025] via-[#75142E] to-[#85152F] text-white border-2 border-[#E5A332]/60 shadow-[0_8px_20px_rgba(93,16,37,0.25)] flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all group"
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
              <span className="text-xs font-serif font-black text-[#FFFDF7]">Bhavani Faculty AI</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#E5A332]/30 text-[#F8CF72] text-[9px] font-black uppercase">Copilot</span>
            </div>
            <p className="text-[11px] text-[#F8CF72] font-semibold truncate">
              Query all student data, teacher contacts &amp; lectures
            </p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#F8CF72]" />
        </div>
      </div>

      {/* Quick Action Shortcuts (Claymorphic Warm Tiles) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Shortcut 1: Manage Students */}
        <button
          type="button"
          onClick={() => setActiveTab('teacher_hub')}
          className="p-3.5 rounded-3xl bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] text-left hover:border-[#85152F] transition-all cursor-pointer shadow-[0_4px_12px_rgba(133,21,47,0.04)] group"
        >
          <div className="flex items-center justify-between text-[#85152F] dark:text-[#F8CF72]">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] dark:bg-[#2A1E2E] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#85152F] dark:text-[#F8CF72]" />
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-serif font-black text-sm text-[#5D1025] dark:text-white mt-2">
            Faculty Portal
          </h4>
          <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8]">
            Students, marks, fees &amp; batches
          </p>
        </button>

        {/* Shortcut 2: Post Announcement */}
        <button
          type="button"
          onClick={() => setShowAddNoticeModal(true)}
          className="p-3.5 rounded-3xl bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] text-left hover:border-[#85152F] transition-all cursor-pointer shadow-[0_4px_12px_rgba(133,21,47,0.04)] group"
        >
          <div className="flex items-center justify-between text-[#E5A332]">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] dark:bg-[#2A1E2E] flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#E5A332]" />
            </div>
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
          <h4 className="font-serif font-black text-sm text-[#5D1025] dark:text-white mt-2">
            Post Notice
          </h4>
          <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8]">
            Exam alerts &amp; announcements
          </p>
        </button>
      </div>

      {/* Today's Teaching Schedule Card */}
      <section className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-5 space-y-3.5 shadow-[0_6px_20px_rgba(133,21,47,0.06)]">
        <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base text-[#5D1025] dark:text-[#F8CF72]">
                Today&apos;s Class Schedule
              </h3>
              <span className="text-[10px] text-[#79685E] dark:text-[#C5B7A8] font-bold">
                {displayDay} • {todaysSlots.length} lecture{todaysSlots.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Batch Selector */}
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="text-xs font-bold bg-[#FFF0D0] dark:bg-[#2A1E2E] text-[#85152F] dark:text-[#F8CF72] py-1 px-2.5 rounded-xl border border-[#EFCF98] focus:outline-none cursor-pointer"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name.split(' - ')[0]}
              </option>
            ))}
          </select>
        </div>

        {todaysSlots.length > 0 ? (
          <div className="space-y-2.5">
            {todaysSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28] flex items-start justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFF0D0] text-[#85152F] border border-[#EFCF98]">
                      {slot.subject}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#5D1025] dark:text-[#F8CF72]">
                      {slot.time}
                    </span>
                    <span className="text-[10px] text-[#79685E] dark:text-[#BFAFA3]">
                      Room: <strong>{slot.room}</strong>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#2D211D] dark:text-white truncate">
                    {slot.topic}
                  </h4>

                  <p className="text-[11px] text-[#79685E] dark:text-[#A8988C]">
                    Faculty: <strong>{slot.teacher}</strong> • Batch: {batches.find((b) => b.id === slot.batchId)?.name.split(' - ')[0] || slot.batchId}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => showToast(`Attendance marked for ${slot.subject} (${slot.room})`, 'success')}
                  className="px-2.5 py-1.5 rounded-xl bg-[#25844F] hover:bg-[#1E6B3F] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors flex-shrink-0 cursor-pointer"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Check-in</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border-2 border-dashed border-[#EFCF98]/70 dark:border-[#381F28] rounded-2xl space-y-1.5">
            <Calendar className="w-6 h-6 text-[#E5A332] mx-auto" />
            <p className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72]">
              No lectures scheduled for {displayDay}
            </p>
            <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8]">
              Check full week batches or schedule new class slots in the Timetable tab.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('timetable')}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-[#85152F] dark:text-[#F8CF72] hover:bg-[#FFF0D0] dark:hover:bg-[#2B1B2C] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Open Full Schedule Planner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Recent Institute Announcements Card */}
      <section className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-5 space-y-3.5 shadow-[0_6px_20px_rgba(133,21,47,0.06)]">
        <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-black text-base text-[#5D1025] dark:text-[#F8CF72]">
              Recent Announcements
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddNoticeModal(true)}
            className="text-[11px] font-bold text-[#85152F] dark:text-[#F8CF72] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>New Notice</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {notices.slice(0, 3).map((notice) => (
            <div
              key={notice.id}
              className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#381F28] space-y-1 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                  notice.type === 'exam_alert'
                    ? 'bg-[#FFF0EE] text-[#85152F] border-[#B9193F]/40'
                    : 'bg-[#FFF0D0] text-[#5D1025] border-[#E5A332]/50'
                }`}>
                  {notice.type === 'exam_alert' ? 'Exam Alert' : 'Announcement'}
                </span>
                <span className="text-[10px] font-mono text-[#79685E] dark:text-[#A8988C]">
                  {notice.date}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#2D211D] dark:text-white leading-snug">
                {notice.title}
              </h4>
              <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8] leading-relaxed line-clamp-2">
                {notice.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL: Post New Notice */}
      {showAddNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] text-[#85152F] flex items-center justify-center border border-[#EFCF98]">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-black text-sm text-[#5D1025] dark:text-white">
                  Post Announcement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddNoticeModal(false)}
                className="p-1.5 rounded-xl text-[#79685E] hover:text-[#2D211D] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostNoticeSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="e.g. JEE Main Mock Test 04 Schedule"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-[#EFCF98] bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white font-bold focus:outline-none focus:border-[#85152F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">
                    Notice Type
                  </label>
                  <select
                    value={newNotice.type}
                    onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-[#EFCF98] bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white font-bold focus:outline-none focus:border-[#85152F]"
                  >
                    <option value="general">General Notice</option>
                    <option value="exam_alert">Exam Alert</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">
                    Target Batch
                  </label>
                  <select
                    value={newNotice.targetBatch}
                    onChange={(e) => setNewNotice({ ...newNotice, targetBatch: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-[#EFCF98] bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white font-bold focus:outline-none focus:border-[#85152F]"
                  >
                    <option value="all">All Batches</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name.split(' - ')[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">
                  Notice Content *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  placeholder="Type announcement details for students..."
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-[#EFCF98] bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white font-medium focus:outline-none focus:border-[#85152F]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoticeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EFCF98] text-[#79685E] font-bold hover:bg-[#FFF0D0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#85152F] to-[#B9193F] text-white font-black shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#F8CF72]" />
                  <span>Publish Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
