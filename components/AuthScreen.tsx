'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { LoginNewtonHeroIllustration } from '@/components/ScienceIllustrations';
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Star,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Mail,
  BookOpen,
  User,
  Calendar,
  Award,
  Building2,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const {
    language,
    signInWithGoogle,
    loginWithEmailAndCategory,
    selectedLoginCategory,
    setSelectedLoginCategory,
    authError,
    setAuthError,
    checkUserHasCompletedProfile,
    saveStudentOnboarding,
    saveTeacherOnboarding,
  } = useApp();
  const t = translations[language];

  const [inputEmail, setInputEmail] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showDemoLogins, setShowDemoLogins] = useState(true);

  // 2-Step Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const [onboardingTarget, setOnboardingTarget] = useState<{
    email: string;
    role: 'student' | 'teacher';
    name?: string;
  } | null>(null);

  // Student Step 2 Form
  const [studentForm, setStudentForm] = useState({
    name: '',
    age: 17,
    dob: '2008-05-15',
    class: 'Class 12',
    targetExam: 'IIT-JEE (Main + Advanced)',
    phone: '',
    parentName: '',
    parentPhone: '',
    schoolCollege: '',
    addressArea: 'Virar West',
  });

  // Teacher Step 2 Form
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    age: 38,
    experienceYears: 12,
    subject: 'Physics',
    qualification: 'M.Sc (Physics), B.Ed',
    phone: '',
    bio: '',
    assignedBatches: ['jee-2025-a'],
  });

  // Ensure public role selector is strictly 'student' or 'teacher'
  const activeRole: 'student' | 'teacher' =
    selectedLoginCategory === 'teacher' || selectedLoginCategory === 'super_admin'
      ? 'teacher'
      : 'student';

  const handleSelectRole = (role: 'student' | 'teacher') => {
    setSelectedLoginCategory(role);
    setAuthError(null);
  };

  // Step 1: Google Click
  const handleGoogleClick = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogle(activeRole);
      if (res) {
        if (res.profileCompleted) {
          // Already has complete profile; system logs them straight into dashboard
        } else {
          // Step 2 Required: trigger details collection
          const initialName = res.displayName || res.email.split('@')[0].replace(/[._-]+/g, ' ');
          setOnboardingTarget({
            email: res.email,
            role: activeRole,
            name: initialName,
          });
          if (activeRole === 'student') {
            setStudentForm((prev) => ({ ...prev, name: initialName }));
          } else {
            setTeacherForm((prev) => ({ ...prev, name: initialName.startsWith('Prof.') ? initialName : `Prof. ${initialName}` }));
          }
          setOnboardingStep(2);
        }
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Step 1: Email Submit
  const handleEmailSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError('Please enter your registered Gmail or institutional email ID.');
      return;
    }

    const isCompleted = checkUserHasCompletedProfile(cleanEmail, activeRole);
    if (isCompleted) {
      setIsSigningIn(true);
      try {
        await loginWithEmailAndCategory(cleanEmail, activeRole);
      } finally {
        setIsSigningIn(false);
      }
    } else {
      // Step 2 Required for this email
      const fallbackName = cleanEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      setOnboardingTarget({
        email: cleanEmail,
        role: activeRole,
        name: fallbackName,
      });
      if (activeRole === 'student') {
        setStudentForm((prev) => ({ ...prev, name: fallbackName }));
      } else {
        setTeacherForm((prev) => ({ ...prev, name: `Prof. ${fallbackName}` }));
      }
      setOnboardingStep(2);
    }
  };

  // Direct Quick Login (Demo profiles with pre-completed records)
  const handleQuickLogin = async (email: string, category: 'student' | 'teacher') => {
    setSelectedLoginCategory(category);
    setInputEmail(email);
    setIsSigningIn(true);
    try {
      await loginWithEmailAndCategory(email, category);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Step 2 Submission: Save to database & State
  const handleStepTwoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingTarget) return;

    setIsSigningIn(true);
    try {
      if (onboardingTarget.role === 'student') {
        if (!studentForm.name.trim() || !studentForm.phone.trim() || !studentForm.parentName.trim()) {
          setAuthError('Please complete all required student details (Name, Contact & Parent Name).');
          return;
        }
        await saveStudentOnboarding({
          email: onboardingTarget.email,
          name: studentForm.name.trim(),
          age: Number(studentForm.age) || 17,
          dob: studentForm.dob,
          class: studentForm.class,
          targetExam: studentForm.targetExam,
          phone: studentForm.phone.trim(),
          parentName: studentForm.parentName.trim(),
          parentPhone: studentForm.parentPhone.trim() || studentForm.phone.trim(),
          schoolCollege: studentForm.schoolCollege.trim() || 'Coaching Division, Virar (W)',
          addressArea: studentForm.addressArea.trim(),
        });
      } else {
        if (!teacherForm.name.trim() || !teacherForm.phone.trim() || !teacherForm.subject.trim()) {
          setAuthError('Please fill in required faculty details (Full Name, Subject & Phone).');
          return;
        }
        await saveTeacherOnboarding({
          email: onboardingTarget.email,
          name: teacherForm.name.trim(),
          age: Number(teacherForm.age) || 38,
          experienceYears: Number(teacherForm.experienceYears) || 10,
          subject: teacherForm.subject.trim(),
          qualification: teacherForm.qualification.trim(),
          phone: teacherForm.phone.trim(),
          bio: teacherForm.bio.trim() || 'Faculty member at Bhavani Science Classes, Virar West.',
          assignedBatches: teacherForm.assignedBatches,
        });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Skip step 2 and proceed with default profile
  const handleSkipStepTwo = async () => {
    if (!onboardingTarget) return;
    setIsSigningIn(true);
    try {
      await loginWithEmailAndCategory(onboardingTarget.email, onboardingTarget.role);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] dark:bg-[#120E16] text-[#2D211D] dark:text-[#F5EFE6] flex flex-col justify-between py-5 px-4 max-w-md mx-auto transition-colors duration-200">
      <div className="space-y-4">
        {/* Top institutional verified badge */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF0D0] dark:bg-[#2A1E17] text-[#85152F] dark:text-[#F8CF72] font-semibold text-[11px] border border-[#EFCF98]/70 dark:border-[#5D1025]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#85152F] dark:text-[#E5A332]" />
            <span>Official Institute Portal</span>
          </div>
          <span className="text-[11px] text-[#79685E] dark:text-[#C5B7A8] font-medium tracking-tight">
            Virar (W) Center • Est. 2012
          </span>
        </div>

        {/* Institute Brand & Header with Official Logo (Fitted to Frame) */}
        <header className="flex flex-col items-center text-center space-y-2 pt-1">
          <div className="relative group">
            <div className="relative w-20 h-20 rounded-3xl overflow-hidden border-2 border-[#EFCF98] dark:border-[#4A162B] shadow-[0_8px_24px_rgba(133,21,47,0.12)] bg-[#FFFCF4] dark:bg-[#1C1524]">
              <Image
                src="/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png"
                alt="Bhavani Science Classes"
                fill
                sizes="80px"
                className="object-cover"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 -right-1 bg-[#85152F] text-[#F8CF72] text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs border border-[#F8CF72]/40 tracking-wider">
              STEM
            </div>
          </div>

          <div className="space-y-0.5">
            <h1 className="text-2xl font-serif font-black text-[#5D1025] dark:text-[#F8CF72] tracking-tight">
              {t.instituteName}
            </h1>
            <p className="text-xs text-[#79685E] dark:text-[#CBBBB0] max-w-[300px] font-medium">
              Concept First • Excellence in XI, XII, JEE, NEET &amp; MHT-CET
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0D0]/80 dark:bg-[#201525] text-[11px] text-[#5D1025] dark:text-[#E9D5C3] border border-[#EFCF98] dark:border-[#5D1025]">
            <MapPin className="w-3 h-3 text-[#B9193F]" />
            <span className="font-semibold">{t.location}</span>
            <span className="text-[#EFCF98] dark:text-stone-700">•</span>
            <span className="inline-flex items-center gap-1 font-bold text-[#E5A332]">
              <Star className="w-3 h-3 fill-[#E5A332] text-[#E5A332]" /> {t.rating} Verified
            </span>
          </div>
        </header>

        {/* Error notification banner if any */}
        {authError && (
          <div className="rounded-2xl border border-[#E97562]/40 p-3.5 space-y-2.5 bg-[#FFF0EE] dark:bg-[#2F151B] text-[#5D1025] dark:text-[#F8CF72] animate-in fade-in duration-200 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#B9193F] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <h3 className="text-xs font-bold text-[#5D1025] dark:text-[#FFE0D6]">
                  {authError}
                </h3>
                <p className="text-[11px] text-[#79685E] dark:text-[#D8B9B0] leading-relaxed">
                  Please review your details or contact the institute helpdesk below.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EFCF98]/50 dark:border-rose-900/40 flex gap-2">
              <a
                href="tel:09168925687"
                className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-[#85152F] hover:bg-[#5D1025] text-[#FFFCF4] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Phone className="w-3 h-3 text-[#F8CF72]" />
                <span>Call Desk: 091689 25687</span>
              </a>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                className="py-1.5 px-3 rounded-xl text-xs font-medium text-[#79685E] dark:text-stone-300 bg-[#FFFCF4] dark:bg-stone-900 border border-[#EFCF98] dark:border-stone-800 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ----------------- STEP 1: AUTHENTICATION ----------------- */}
        {onboardingStep === 1 && (
          <>
            {/* Animated Interactive Science Centerpiece */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#EFCF98] dark:border-[#4A162B] bg-gradient-to-b from-[#FFFDF7] via-[#FFF9ED] to-[#FFF0D0] dark:from-[#1B1422] dark:to-[#2A1B28] shadow-[0_10px_28px_rgba(133,21,47,0.12)] p-1.5 transition-all">
              <LoginNewtonHeroIllustration className="w-full h-auto rounded-2xl" />
            </div>

            {/* Main Portal Card with Role Selector and Sign In */}
            <section className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-5 space-y-4 shadow-[0_12px_36px_rgba(133,21,47,0.08)]">
              {/* Step indicator bar */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-[#85152F] dark:text-[#F8CF72] uppercase tracking-wider">
                  Select Your Role
                </span>
                <span className="text-[10px] text-[#79685E] dark:text-[#BFAFA3] font-bold px-2 py-0.5 rounded-full bg-[#FFF0D0] dark:bg-[#2A1E2E]">
                  Step 1 of 2
                </span>
              </div>

              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#FFF0D0]/60 dark:bg-[#251A2C] rounded-2xl border border-[#EFCF98] dark:border-[#4A162B]">
                <button
                  type="button"
                  onClick={() => handleSelectRole('student')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeRole === 'student'
                      ? 'bg-gradient-to-r from-[#85152F] via-[#9E1B38] to-[#B9193F] text-[#FFFDF7] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.4),0_3px_10px_rgba(133,21,47,0.35)] scale-[1.02]'
                      : 'text-[#79685E] dark:text-[#C5B7A8] hover:text-[#2D211D] dark:hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('teacher')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeRole === 'teacher'
                      ? 'bg-gradient-to-r from-[#85152F] via-[#9E1B38] to-[#B9193F] text-[#FFFDF7] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.4),0_3px_10px_rgba(133,21,47,0.35)] scale-[1.02]'
                      : 'text-[#79685E] dark:text-[#C5B7A8] hover:text-[#2D211D] dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Teacher</span>
                </button>
              </div>

              {/* Role guidance caption */}
              <p className="text-[11px] text-center text-[#79685E] dark:text-[#C5B7A8] pt-0.5">
                {activeRole === 'student' ? (
                  <span>Access syllabus lectures, test results, attendance &amp; batch schedule.</span>
                ) : (
                  <span>Manage timetable slots, lecture links, marks, announcements &amp; batches.</span>
                )}
              </p>

              {/* Direct Registered Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center justify-between">
                    <span>
                      {activeRole === 'student' ? 'Student Gmail / Email ID' : 'Teacher / Faculty Email ID'}
                    </span>
                    <span className="text-[10px] text-[#25844F] dark:text-[#34D399] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Auto-Verified
                    </span>
                  </label>

                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#79685E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      placeholder={
                        activeRole === 'student'
                          ? 'Enter student Gmail (e.g. aryan.jee@gmail.com)'
                          : 'Enter teacher Gmail (e.g. deshmukh.physics@gmail.com)'
                      }
                      className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white pl-10 pr-3.5 py-3 rounded-2xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] placeholder:text-[#79685E]/70 focus:outline-none focus:border-[#85152F] dark:focus:border-[#F8CF72] shadow-inner"
                    />
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-3.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 border border-[#EFCF98]/40 disabled:opacity-60 bg-gradient-to-r from-[#85152F] via-[#9E1B38] to-[#5D1025] hover:from-[#5D1025] hover:to-[#85152F] text-[#FFFDF7] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.4),0_4px_14px_rgba(133,21,47,0.35)]"
                >
                  <span>
                    {isSigningIn
                      ? 'Verifying & Connecting...'
                      : activeRole === 'student'
                      ? 'Continue as Student'
                      : 'Continue as Teacher'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F8CF72]" />
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center pt-1">
                <div className="border-t border-[#EFCF98] dark:border-[#381F28] w-full" />
                <span className="bg-[#FFFCF4] dark:bg-[#1A1322] px-3 text-[10px] font-black text-[#79685E] dark:text-[#A8988C] uppercase tracking-wider relative">
                  OR
                </span>
              </div>

              {/* Continue with Google Flow */}
              <button
                type="button"
                disabled={isSigningIn}
                onClick={handleGoogleClick}
                className="w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2.5 bg-[#FFFDF7] dark:bg-[#231A2D] hover:bg-[#FFF0D0]/50 dark:hover:bg-[#2C1F38] text-[#2D211D] dark:text-[#F5EFE6] border-2 border-[#EFCF98] dark:border-[#4A162B] shadow-xs cursor-pointer active:scale-[0.99] transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>
                  {isSigningIn
                    ? 'Connecting to Google...'
                    : `Continue with Google (${activeRole === 'student' ? 'Student' : 'Teacher'})`}
                </span>
              </button>
            </section>

            {/* Authorized Student & Teacher Test Profiles */}
            <section className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1.5">
                  <span>Quick Verified Profiles</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF0D0] dark:bg-[#341F28] text-[#85152F] dark:text-[#F8CF72] font-semibold">
                    1-Tap
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowDemoLogins(!showDemoLogins)}
                  className="text-[11px] text-[#85152F] dark:text-[#F8CF72] font-bold hover:underline cursor-pointer"
                >
                  {showDemoLogins ? 'Hide' : 'Show'}
                </button>
              </div>

              {showDemoLogins && (
                <div className="space-y-2 pt-0.5 text-xs">
                  {/* Student Profile 1 */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('aryan.jee@gmail.com', 'student')}
                    className="w-full p-2.5 rounded-2xl border border-[#EFCF98] dark:border-[#381F28] bg-[#FFFDF7] dark:bg-[#201729] hover:bg-[#FFF0D0]/50 dark:hover:bg-[#2B1B2C] flex items-center justify-between transition-colors text-left cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#25844F]" />
                        <span className="font-bold text-[#2D211D] dark:text-white group-hover:text-[#85152F]">
                          Aryan Deshmukh
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#FFF0D0] dark:bg-[#2A1E17] text-[#85152F] dark:text-[#F8CF72] font-bold">
                          Student
                        </span>
                      </div>
                      <span className="text-[11px] text-[#79685E] dark:text-[#BFAFA3] block">
                        aryan.jee@gmail.com • 12th JEE Elite
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#79685E] group-hover:text-[#85152F] transition-colors" />
                  </button>

                  {/* Student Profile 2 */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('sneha.neet@gmail.com', 'student')}
                    className="w-full p-2.5 rounded-2xl border border-[#EFCF98] dark:border-[#381F28] bg-[#FFFDF7] dark:bg-[#201729] hover:bg-[#FFF0D0]/50 dark:hover:bg-[#2B1B2C] flex items-center justify-between transition-colors text-left cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#25844F]" />
                        <span className="font-bold text-[#2D211D] dark:text-white group-hover:text-[#85152F]">
                          Sneha Patil
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#FFF0D0] dark:bg-[#2A1E17] text-[#85152F] dark:text-[#F8CF72] font-bold">
                          Student
                        </span>
                      </div>
                      <span className="text-[11px] text-[#79685E] dark:text-[#BFAFA3] block">
                        sneha.neet@gmail.com • 12th NEET Medical
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#79685E] group-hover:text-[#85152F] transition-colors" />
                  </button>

                  {/* Teacher Profile */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('deshmukh.physics@gmail.com', 'teacher')}
                    className="w-full p-2.5 rounded-2xl border-2 border-[#EFCF98] dark:border-[#4A162B] bg-[#FFF0D0]/40 dark:bg-[#261A2D] hover:bg-[#FFF0D0]/80 dark:hover:bg-[#341F3A] flex items-center justify-between transition-colors text-left cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#85152F]" />
                        <span className="font-bold text-[#5D1025] dark:text-[#F8CF72]">
                          Prof. A. R. Deshmukh
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#85152F] text-[#F8CF72] font-black">
                          Teacher
                        </span>
                      </div>
                      <span className="text-[11px] text-[#79685E] dark:text-[#C5B7A8] block">
                        deshmukh.physics@gmail.com • Physics &amp; Mechanics Head
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#85152F] dark:text-[#F8CF72]" />
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {/* ----------------- STEP 2: DETAILS COLLECTION ----------------- */}
        {onboardingStep === 2 && onboardingTarget && (
          <section className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_12px_36px_rgba(133,21,47,0.1)] animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Step 2 Progress Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#85152F] dark:text-[#F8CF72] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Gmail</span>
                </button>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#25844F]/10 text-[#25844F] dark:text-[#34D399] border border-[#25844F]/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Step 2 of 2
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#FFF0D0] dark:bg-[#2A1E2E] h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#85152F] to-[#25844F] h-full w-full rounded-full transition-all duration-500" />
              </div>

              <div className="pt-1">
                <h2 className="text-xl font-serif font-black text-[#5D1025] dark:text-[#F8CF72]">
                  {onboardingTarget.role === 'student' ? 'Student Registration Details' : 'Faculty Profile & Qualifications'}
                </h2>
                <p className="text-xs text-[#79685E] dark:text-[#C5B7A8]">
                  Please enter your profile information so your records, marks, and batches are personalized in the database.
                </p>
              </div>

              {/* Verified Gmail Chip */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FFF0D0]/80 dark:bg-[#201525] border border-[#EFCF98] dark:border-[#521927] text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-white dark:bg-[#2A1E2E] flex items-center justify-center flex-shrink-0 shadow-xs border border-[#EFCF98]">
                    <Mail className="w-3.5 h-3.5 text-[#85152F] dark:text-[#F8CF72]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#79685E] dark:text-[#BFAFA3] block">
                      Authenticated Gmail
                    </span>
                    <span className="font-bold text-[#2D211D] dark:text-white truncate block">
                      {onboardingTarget.email}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#25844F] dark:text-[#34D399] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>

            {/* Details Form: Student vs Teacher */}
            <form onSubmit={handleStepTwoSubmit} className="space-y-4">
              {onboardingTarget.role === 'student' ? (
                <>
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>Student Full Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      placeholder="e.g. Aryan Sanjay Deshmukh"
                      className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3.5 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                    />
                  </div>

                  {/* Age & Date of Birth */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72]">
                        Age (Years) *
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="24"
                        required
                        value={studentForm.age}
                        onChange={(e) => setStudentForm({ ...studentForm, age: Number(e.target.value) })}
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Date of Birth</span>
                      </label>
                      <input
                        type="date"
                        value={studentForm.dob}
                        onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                      />
                    </div>
                  </div>

                  {/* Class / Standard & Target Exam */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Standard *</span>
                      </label>
                      <select
                        value={studentForm.class}
                        onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-semibold border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F] cursor-pointer"
                      >
                        <option value="Class 8">Class 8 (Foundation)</option>
                        <option value="Class 9">Class 9 (Foundation)</option>
                        <option value="Class 10">Class 10 (Board + NTSE)</option>
                        <option value="Class 11">Class 11 Science</option>
                        <option value="Class 12">Class 12 Science</option>
                        <option value="Repeater">JEE / NEET Dropper</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Target Exam *</span>
                      </label>
                      <select
                        value={studentForm.targetExam}
                        onChange={(e) => setStudentForm({ ...studentForm, targetExam: e.target.value })}
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-semibold border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F] cursor-pointer"
                      >
                        <option value="IIT-JEE (Main + Advanced)">IIT-JEE Main &amp; Adv</option>
                        <option value="NEET-UG Medical">NEET-UG Medical</option>
                        <option value="MHT-CET (Engineering)">MHT-CET Engineering</option>
                        <option value="Board Exams & Foundation">HSC / CBSE Board</option>
                      </select>
                    </div>
                  </div>

                  {/* Student WhatsApp Contact */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Student WhatsApp Phone *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      placeholder="e.g. 9820144521"
                      className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3.5 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                    />
                  </div>

                  {/* Parent Details */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72]">
                        Parent / Guardian *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentForm.parentName}
                        onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                        placeholder="e.g. Mr. Sanjay Deshmukh"
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72]">
                        Parent Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        value={studentForm.parentPhone}
                        onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                        placeholder="e.g. 9820144520"
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                      />
                    </div>
                  </div>

                  {/* School / College Name & Locality */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>School / College</span>
                      </label>
                      <input
                        type="text"
                        value={studentForm.schoolCollege}
                        onChange={(e) => setStudentForm({ ...studentForm, schoolCollege: e.target.value })}
                        placeholder="e.g. Viva College / Vartak"
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Residential Area</span>
                      </label>
                      <select
                        value={studentForm.addressArea}
                        onChange={(e) => setStudentForm({ ...studentForm, addressArea: e.target.value })}
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-semibold border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F] cursor-pointer"
                      >
                        <option value="Virar West">Virar West</option>
                        <option value="Virar East">Virar East</option>
                        <option value="Bolinj">Bolinj, Virar (W)</option>
                        <option value="Agashi / Arnala">Agashi / Arnala</option>
                        <option value="Nalasopara West">Nalasopara West</option>
                        <option value="Vasai West">Vasai West</option>
                        <option value="Other">Other Region</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Faculty Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>Faculty Full Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                      placeholder="e.g. Prof. A. R. Deshmukh"
                      className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3.5 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                    />
                  </div>

                  {/* Subject Specialization & Qualifications */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Teaching Subject *</span>
                      </label>
                      <select
                        value={teacherForm.subject}
                        onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-semibold border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F] cursor-pointer"
                      >
                        <option value="Physics">Physics &amp; Mechanics</option>
                        <option value="Chemistry">Chemistry (Inorganic &amp; Organic)</option>
                        <option value="Mathematics">Mathematics &amp; Calculus</option>
                        <option value="Biology">Biology (Botany &amp; Zoology)</option>
                        <option value="Foundation Science">Foundation Science (8-10)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Qualification *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherForm.qualification}
                        onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}
                        placeholder="e.g. M.Sc Physics, B.Ed"
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                      />
                    </div>
                  </div>

                  {/* Age & Experience */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72]">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        min="21"
                        max="75"
                        value={teacherForm.age}
                        onChange={(e) => setTeacherForm({ ...teacherForm, age: Number(e.target.value) })}
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72]">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={teacherForm.experienceYears}
                        onChange={(e) => setTeacherForm({ ...teacherForm, experienceYears: Number(e.target.value) })}
                        className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Contact / WhatsApp Phone *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                      placeholder="e.g. 09168925687"
                      className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3.5 py-2.5 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5D1025] dark:text-[#F8CF72]">
                      Faculty Bio / Teaching Philosophy
                    </label>
                    <textarea
                      rows={2}
                      value={teacherForm.bio}
                      onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })}
                      placeholder="Specializing in concept mastery and problem-solving techniques for JEE & NEET."
                      className="w-full bg-[#FFFDF7] dark:bg-[#201729] text-[#2D211D] dark:text-white px-3.5 py-2 rounded-xl text-xs font-medium border-2 border-[#EFCF98] dark:border-[#4A162B] focus:outline-none focus:border-[#85152F]"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-3.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 border border-[#EFCF98]/40 disabled:opacity-60 bg-gradient-to-r from-[#85152F] via-[#9E1B38] to-[#5D1025] hover:from-[#5D1025] hover:to-[#85152F] text-[#FFFDF7] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.4),0_4px_14px_rgba(133,21,47,0.35)]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#F8CF72]" />
                  <span>
                    {isSigningIn ? 'Saving to Database...' : 'Save Profile & Enter Portal (विवरण सहेजें)'}
                  </span>
                </button>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className="text-[#79685E] dark:text-[#C5B7A8] hover:underline cursor-pointer"
                  >
                    ← Back to Step 1
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipStepTwo}
                    className="text-[#85152F] dark:text-[#F8CF72] font-bold hover:underline cursor-pointer"
                  >
                    Skip for now &amp; explore →
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}
      </div>

      {/* Bottom Footer Helpdesk & Verified Center Details */}
      <footer className="pt-5 text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-[#85152F] dark:text-[#F8CF72]">
          <a
            href="https://wa.me/919168925687"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:underline"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#25844F]" />
            <span>WhatsApp Admissions</span>
          </a>
          <span className="text-[#EFCF98] dark:text-stone-700">•</span>
          <a href="tel:09168925687" className="flex items-center gap-1.5 hover:underline">
            <Phone className="w-3.5 h-3.5 text-[#B9193F]" />
            <span>091689 25687</span>
          </a>
        </div>
        <p className="text-[11px] text-[#79685E] dark:text-[#BFAFA3] max-w-xs mx-auto leading-relaxed">
          3rd Floor, Magnet Mall, Station Road, Virar West, Maharashtra 401303
        </p>
      </footer>
    </div>
  );
};
