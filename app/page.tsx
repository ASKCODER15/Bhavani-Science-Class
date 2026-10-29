'use client';

import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { AuthScreen } from '@/components/AuthScreen';
import { StudentDashboard } from '@/components/StudentDashboard';
import { TimetableScreen } from '@/components/TimetableScreen';
import { LecturesScreen } from '@/components/LecturesScreen';
import { TestResultsScreen } from '@/components/TestResultsScreen';
import { TeacherHubScreen } from '@/components/TeacherHubScreen';
import { TeacherDailyHubScreen } from '@/components/TeacherDailyHubScreen';
import { ProfileScreen } from '@/components/ProfileScreen';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { AppHeaderSkeleton, StudentDashboardSkeleton } from '@/components/skeletons';
import { BhavaniAIChatModal } from '@/components/BhavaniAIChatModal';
import { FloatingChatButton } from '@/components/FloatingChatButton';

function MainApp() {
  const { activeTab, isTeacher } = useApp();
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  React.useEffect(() => {
    const handleOpenChat = () => setIsChatOpen(true);
    window.addEventListener('open-bhavani-chat', handleOpenChat);
    return () => window.removeEventListener('open-bhavani-chat', handleOpenChat);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7EE] dark:bg-[#120E16] text-[#2D211D] dark:text-[#F5EFE6] flex flex-col justify-between selection:bg-[#85152F] selection:text-white relative transition-colors duration-200">
      <OfflineIndicator />
      <AppHeader onOpenChat={() => setIsChatOpen(true)} />

      <main className="flex-1 w-full max-w-md mx-auto relative pt-safe pb-28 sm:pb-32 z-10">
        {activeTab === 'home' && (isTeacher ? <TeacherDailyHubScreen /> : <StudentDashboard />)}
        {activeTab === 'timetable' && <TimetableScreen />}
        {activeTab === 'lectures' && <LecturesScreen />}
        {activeTab === 'results_fees' && <TestResultsScreen />}
        {activeTab === 'teacher_hub' && <TeacherHubScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>

      {/* 24/7 AI Chatbot for Students & Teachers */}
      <FloatingChatButton onClick={() => setIsChatOpen(true)} />
      <BhavaniAIChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <BottomNav />
    </div>
  );
}

function RootComponent() {
  const { isLoggedIn, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] via-[#FAF5FF] to-[#FFFDF7] dark:from-[#090D16] dark:via-[#0F172A] dark:to-[#111827] text-[#1E1B4B] dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative transition-colors duration-200">
        <AppHeaderSkeleton />
        <main className="flex-1 w-full max-w-md mx-auto relative pt-safe pb-28 sm:pb-32 z-10">
          <StudentDashboardSkeleton />
        </main>
        <nav className="fixed bottom-3 left-3 right-3 max-w-md mx-auto z-40">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-md flex items-center justify-around">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center justify-center py-1.5 px-2 flex-1">
                <div className="w-5 h-5 rounded-md skeleton-shimmer" />
                <div className="w-8 h-2 rounded mt-1 skeleton-shimmer" />
              </div>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <>
      {!isLoggedIn ? (
        <AuthScreen />
      ) : (
        <MainApp />
      )}
    </>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <RootComponent />
    </AppProvider>
  );
}
