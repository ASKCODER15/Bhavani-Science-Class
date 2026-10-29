'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Calendar,
  Award,
  BookOpen,
  HelpCircle,
  TrendingUp,
  FileText,
  AlertCircle,
  Minimize2,
  Maximize2,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface BhavaniAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BhavaniAIChatModal: React.FC<BhavaniAIChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    isTeacher,
    activeStudent,
    students,
    batches,
    timetable,
    testResults,
    feeRecords,
    notices,
    currentAcademicYear,
    approvedTeachers,
    lectures,
    showToast,
  } = useApp();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isTeacher) {
      return [
        {
          id: 'welcome-teacher',
          role: 'model',
          text: `Namaste Faculty! I am **Bhavani Faculty AI Copilot**.\n\nI have complete, live access to:\n• **All Students**: Rosters, roll numbers, attendance, test performance, and fee status\n• **All Faculty & Teachers**: Contacts, subjects, and timetables\n• **Lectures & Class Topics**: Everything going on across batches at Virar (W)\n\nAsk me anything — e.g., *"Show me all teachers"*, *"Give me Aryan's marks and fee dues"*, or *"What is today's schedule?"*`,
          timestamp: timeStr,
        },
      ];
    } else {
      const studentName = activeStudent?.name ? activeStudent.name.split(' ')[0] : 'there';
      return [
        {
          id: 'welcome-student',
          role: 'model',
          text: `Namaste ${studentName}! I am **Bhavani Student AI** — your 24/7 personal academic guide.\n\nYou can ask me:\n• **What is going on in class & lectures** today or this week\n• **Your test scores, rank & percentile**\n• **Instant doubt solving** in Physics, Chemistry, Maths & Biology\n• Formulas, revision checklists, and homework tips\n\nWhat would you like to know or learn today?`,
          timestamp: timeStr,
        },
      ];
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Build real-time context payload
  const buildContextPayload = useCallback(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const displayDay = todayName === 'Sunday' ? 'Monday' : todayName;

    if (isTeacher) {
      const activeCount = students.filter((s) => s.status === 'active' || s.active !== false).length;
      const todaySlots = timetable.filter((s) => s.dayOfWeek === displayDay);
      const topScores = [...testResults]
        .sort((a, b) => b.totalMarks - a.totalMarks)
        .slice(0, 10)
        .map((r) => ({
          student: r.studentName,
          rollNo: r.studentRoll,
          batch: r.batchId,
          test: r.testTitle,
          score: `${r.totalMarks}/${r.maxMarks}`,
          percentile: `${r.percentile}%ile`,
          rank: `#${r.rank}`,
        }));

      return {
        role: 'teacher',
        academicYear: currentAcademicYear,
        todayDay: displayDay,
        totalEnrolledStudents: students.length,
        activeStudentsCount: activeCount,
        // Complete data of all teachers
        allTeachers: approvedTeachers.map((t) => ({
          name: t.name,
          subject: t.subject,
          email: t.email,
          phone: t.phone,
          qualification: t.qualification || 'Senior Faculty',
        })),
        // Complete data of all students
        allStudents: students.map((s) => {
          const sFee = feeRecords.find((f) => f.studentId === s.id);
          const studentTests = testResults.filter((r) => r.studentId === s.id || r.studentName === s.name);
          const latestTest = studentTests[0];
          return {
            id: s.id,
            name: s.name,
            rollNo: s.rollNo,
            batchId: s.batchId,
            status: s.status,
            phone: s.phone,
            parentPhone: s.parentPhone,
            attendanceRate: s.attendanceRate ? `${s.attendanceRate}%` : '92%',
            feeSummary: sFee
              ? `Paid: ₹${sFee.paidFee} / Total: ₹${sFee.totalFee} (Pending Due: ₹${sFee.pendingFee})`
              : 'Fee record pending',
            latestScore: latestTest
              ? `${latestTest.testTitle}: ${latestTest.totalMarks}/${latestTest.maxMarks} (${latestTest.percentile}%ile)`
              : 'No test yet',
          };
        }),
        batchesSummary: batches.map((b) => ({
          id: b.id,
          name: b.name,
          stream: b.stream,
          timing: b.timing,
          room: b.room,
        })),
        todaysLectures: todaySlots.map((s) => ({
          batchId: s.batchId,
          time: s.time,
          subject: s.subject,
          topic: s.topic,
          teacher: s.teacher,
          room: s.room,
        })),
        allClassLectures: lectures.slice(0, 15).map((l) => ({
          title: l.title,
          subject: l.subject,
          batchId: l.batchId,
          date: l.dateAdded,
          teacher: l.teacherName,
          topic: l.chapter || l.title,
        })),
        recentTestToppers: topScores,
        activeNotices: notices.slice(0, 6).map((n) => ({
          title: n.title,
          message: n.content,
          date: n.date,
        })),
      };
    } else {
      const studentBatchId = activeStudent?.batchId || 'jee-2025-a';
      const studentBatch = batches.find((b) => b.id === studentBatchId);
      const studentTodaysSlots = timetable.filter(
        (s) => s.dayOfWeek === displayDay && (s.batchId === studentBatchId || s.batchId === 'all')
      );
      const batchLectures = lectures
        .filter((l) => l.batchId === studentBatchId || l.batchId === 'all')
        .slice(0, 10);
      const myResults = testResults
        .filter((r) => r.studentId === activeStudent?.id || r.studentName === activeStudent?.name)
        .slice(0, 5)
        .map((r) => ({
          test: r.testTitle,
          score: `${r.totalMarks}/${r.maxMarks}`,
          rank: `#${r.rank}`,
          percentile: `${r.percentile}%ile`,
          date: r.date,
        }));

      return {
        role: 'student',
        studentName: activeStudent?.name || 'Aryan Deshmukh',
        rollNo: activeStudent?.rollNo || 'BSC-2025-012',
        batchName: studentBatch?.name || 'Class 12 - Advanced JEE Batch',
        stream: studentBatch?.stream || 'JEE (Mains + Advanced)',
        todayDay: displayDay,
        // What is going on in class today & lectures
        todaysClassSchedule: studentTodaysSlots.map((s) => ({
          time: s.time,
          subject: s.subject,
          topic: s.topic,
          teacher: s.teacher,
          room: s.room,
        })),
        recentClassLectures: batchLectures.map((l) => ({
          title: l.title,
          subject: l.subject,
          date: l.dateAdded,
          teacher: l.teacherName,
          topicSummary: l.chapter || 'Core concept discussion & problem solving',
        })),
        recentTestScores: myResults,
        activeClassNotices: notices.slice(0, 4).map((n) => ({
          title: n.title,
          content: n.content,
          date: n.date,
        })),
      };
    }
  }, [
    isTeacher,
    students,
    timetable,
    testResults,
    currentAcademicYear,
    approvedTeachers,
    batches,
    lectures,
    notices,
    activeStudent,
    feeRecords,
  ]);

  const messageCounterRef = useRef(1);

  const handleSend = useCallback(
    async (messageText?: string) => {
      const textToSend = (messageText || input).trim();
      if (!textToSend || isLoading) return;

      messageCounterRef.current += 1;
      const userMsgId = `user-${messageCounterRef.current}`;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: 'user',
        text: textToSend,
        timestamp: timeStr,
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput('');
      setIsLoading(true);

      try {
        const contextData = buildContextPayload();
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              text: m.text,
            })),
            role: isTeacher ? 'teacher' : 'student',
            context: contextData,
          }),
        });

        const data = await res.json();
        const replyText =
          data.text || 'I have noted your question. How else may I assist you with Bhavani Science Classes?';

        messageCounterRef.current += 1;
        const botMsg: ChatMessage = {
          id: `bot-${messageCounterRef.current}`,
          role: 'model',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        console.error('Chat error:', err);
        messageCounterRef.current += 1;
        const errMsg: ChatMessage = {
          id: `err-${messageCounterRef.current}`,
          role: 'model',
          text: 'I apologize, there was an issue communicating with the server. Please check your internet connection or try again shortly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, isTeacher, buildContextPayload]
  );

  const handleClearHistory = useCallback(() => {
    messageCounterRef.current += 1;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const welcome: ChatMessage = {
      id: `welcome-${messageCounterRef.current}`,
      role: 'model',
      text: isTeacher
        ? `Chat cleared. Ready for your faculty operational and student inquiries!`
        : `Chat history cleared. What topic or class schedule would you like to review?`,
      timestamp: timeStr,
    };
    setMessages([welcome]);
    showToast('Chat history cleared', 'info');
  }, [isTeacher, showToast]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick suggestion chips tailored to roles
  const teacherPrompts = [
    'Show me all faculty teachers & contact details',
    'Give me data of all students and fee status',
    "What is today's lecture schedule across batches?",
    'Who are the top performers in the latest test?',
    'What lectures were uploaded recently?',
    'Draft a student notice for upcoming Sunday test',
  ];

  const studentPrompts = [
    'What is going on in class and lectures today?',
    'What were the latest lecture topics taught?',
    'How did I perform in my latest test?',
    "Explain Lenz's Law with practical examples",
    'Formulas revision sheet for Physics & Chemistry',
    'When is my next doubt solving session?',
  ];

  const suggestedPrompts = isTeacher ? teacherPrompts : studentPrompts;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D0A14]/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-t-2 sm:border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-t-3xl sm:rounded-3xl w-full max-w-lg h-[92vh] sm:h-[680px] flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(93,16,37,0.4)]">
        
        {/* Chat Header with Official Bhavani Logo */}
        <div className="bg-gradient-to-r from-[#5D1025] via-[#75142E] to-[#85152F] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-[#EFCF98]/30 shadow-xs flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden border-2 border-[#F8CF72] shadow-sm flex-shrink-0 bg-[#FFFDF7]">
              <Image
                src="/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png"
                alt="Bhavani Science Classes Logo"
                fill
                sizes="40px"
                className="object-cover"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-black text-sm sm:text-base text-[#FFFDF7] tracking-tight">
                  {isTeacher ? 'Bhavani Faculty AI' : 'Bhavani Student AI'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#E5A332]/25 text-[#F8CF72] text-[9px] font-black uppercase tracking-wider border border-[#E5A332]/40">
                  {isTeacher ? 'Faculty' : 'Student'}
                </span>
              </div>
              <p className="text-[10px] text-[#E8D5C4] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                <span>Concept First • Live Assistant</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-[#E8D5C4] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#E8D5C4] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF7EE]/60 dark:bg-[#150F1C]/60">
          {messages.map((m) => {
            const isBot = m.role === 'model';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[88%] ${isBot ? 'self-start mr-auto' : 'self-end ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`relative w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs overflow-hidden ${
                    isBot
                      ? 'bg-[#FFFDF7] border border-[#EFCF98]'
                      : 'bg-gradient-to-r from-[#85152F] to-[#B9193F] text-white border border-[#F8CF72]/40'
                  }`}
                >
                  {isBot ? (
                    <Image
                      src="/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png"
                      alt="Bhavani Logo"
                      fill
                      sizes="28px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1 min-w-0">
                  <div
                    className={`p-3.5 rounded-3xl text-xs leading-relaxed shadow-xs relative group ${
                      isBot
                        ? 'bg-[#FFFCF4] dark:bg-[#201729] text-[#2D211D] dark:text-[#F5EFE6] border border-[#EFCF98] dark:border-[#4A162B] rounded-tl-sm'
                        : 'bg-gradient-to-r from-[#85152F] to-[#B9193F] text-white rounded-tr-sm shadow-[0_4px_14px_rgba(133,21,47,0.2)]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>

                    {isBot && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(m.id, m.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[#79685E] dark:text-[#C5B7A8] cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-[#25844F]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  <span
                    className={`text-[9px] text-[#79685E] dark:text-[#A8988C] block px-1 ${
                      isBot ? 'text-left' : 'text-right'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 max-w-[85%] self-start mr-auto animate-in fade-in">
              <div className="relative w-7 h-7 rounded-xl bg-[#FFFDF7] border border-[#EFCF98] flex items-center justify-center flex-shrink-0 shadow-xs overflow-hidden">
                <Image
                  src="/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png"
                  alt="Bhavani Logo"
                  fill
                  sizes="28px"
                  className="object-cover animate-pulse"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3.5 rounded-3xl rounded-tl-sm bg-[#FFFCF4] dark:bg-[#201729] border border-[#EFCF98] dark:border-[#4A162B] shadow-xs flex items-center gap-1.5 text-xs text-[#85152F] dark:text-[#F8CF72] font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking &amp; analyzing class records...</span>
                <span className="flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#85152F] dark:bg-[#F8CF72] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#85152F] dark:bg-[#F8CF72] animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#85152F] dark:bg-[#F8CF72] animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-3.5 py-2 bg-[#FFFCF4] dark:bg-[#1A1322] border-t border-[#EFCF98]/50 dark:border-[#381F28] overflow-x-auto no-scrollbar flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-black text-[#85152F] dark:text-[#F8CF72] uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Try:</span>
          </span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#FFF0D0] dark:bg-[#2A1E2E] text-[#85152F] dark:text-[#F8CF72] border border-[#EFCF98] dark:border-[#521927] hover:bg-[#FFE6B3] whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-[#FFFCF4] dark:bg-[#1A1322] border-t-2 border-[#EFCF98] dark:border-[#4A162B] flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isTeacher
                  ? 'Ask about students, marks, batches, or lecture timetable...'
                  : 'Ask about today\'s classes, test marks, or science concepts...'
              }
              disabled={isLoading}
              className="flex-1 bg-[#FFFDF7] dark:bg-[#241B2E] border border-[#EFCF98] dark:border-[#521927] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#2D211D] dark:text-white placeholder:text-[#A8988C] focus:outline-none focus:border-[#85152F] disabled:opacity-50 shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-[#85152F] to-[#B9193F] hover:from-[#701026] hover:to-[#9F1334] text-white shadow-xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center flex-shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[9px] text-center text-[#79685E] dark:text-[#A8988C] mt-1.5 font-medium">
            Powered by Bhavani AI • Real-time database sync • Concept First
          </p>
        </div>

      </div>
    </div>
  );
};
