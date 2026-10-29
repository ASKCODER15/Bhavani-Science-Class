'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testConnection,
} from '@/lib/firebase';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import {
  Language,
  UserRole,
  SuperAdminProfile,
  Student,
  Batch,
  FeeRecord,
  TestResult,
  Lecture,
  TimetableSlot,
  Notice,
  ApprovedTeacher,
  FeeReceipt,
  LectureUploadSettings,
  StudentPromotionAction,
  LectureNote,
} from '@/lib/types';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import {
  INITIAL_TEACHERS,
  INITIAL_BATCHES,
  INITIAL_STUDENTS,
  INITIAL_FEE_RECORDS,
  INITIAL_TEST_RESULTS,
  INITIAL_LECTURES,
  INITIAL_TIMETABLE,
  INITIAL_NOTICES,
  INITIAL_LECTURE_NOTES,
} from '@/lib/seedData';
import { appCache } from '@/lib/cache';

export interface StudentOnboardingData {
  email: string;
  name: string;
  age?: number;
  dob?: string;
  class: string;
  targetExam?: string;
  phone: string;
  parentName: string;
  parentPhone?: string;
  schoolCollege?: string;
  addressArea?: string;
}

export interface TeacherOnboardingData {
  email: string;
  name: string;
  age?: number;
  experienceYears?: number;
  subject: string;
  qualification?: string;
  phone: string;
  bio?: string;
  assignedBatches?: string[];
}

export function deduplicateStudents(list: Student[]): Student[] {
  const seenEmails = new Set<string>();
  const seenIds = new Set<string>();
  const seenRolls = new Set<string>();
  const seenNames = new Set<string>();
  const result: Student[] = [];

  for (const s of list) {
    const emailKey = s.email ? s.email.trim().toLowerCase() : null;
    const idKey = s.id ? s.id.trim() : null;
    const rollKey = s.rollNo ? s.rollNo.trim().toUpperCase() : null;
    const normName = s.name
      ? s.name.toLowerCase().replace(/^student\s+/i, '').replace(/[^a-z0-9]/g, '')
      : null;

    if (emailKey && seenEmails.has(emailKey)) continue;
    if (idKey && seenIds.has(idKey)) continue;
    if (rollKey && seenRolls.has(rollKey)) continue;
    if (normName && normName.length > 3 && seenNames.has(normName)) {
      continue;
    }

    if (emailKey) seenEmails.add(emailKey);
    if (idKey) seenIds.add(idKey);
    if (rollKey) seenRolls.add(rollKey);
    if (normName && normName.length > 3) seenNames.add(normName);
    result.push(s);
  }
  return result;
}

export function deduplicateTestResults(list: TestResult[]): TestResult[] {
  const seen = new Set<string>();
  const result: TestResult[] = [];
  for (const t of list) {
    const normTitle = (t.testTitle || '').trim().toLowerCase();
    const normName = (t.studentName || '')
      .toLowerCase()
      .replace(/^student\s+/i, '')
      .replace(/[^a-z0-9]/g, '');
    const normEmail = (t.studentEmail || '').trim().toLowerCase();
    const normRoll = (t.studentRoll || '').trim().toUpperCase();

    // Group test results by test title and student identity (email, roll, or normalized name)
    const studentIdent = normEmail || normRoll || normName || (t.studentId || '').trim();
    const key = `${normTitle}|${studentIdent}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(t);
    }
  }
  return result;
}

export function createStudentId(safeEmailKey?: string): string {
  if (safeEmailKey) return `student-${safeEmailKey}`;
  return `student-${Date.now()}`;
}

export function createReceiptNumber(): string {
  return `BSC-RCP-${Date.now().toString().slice(-4)}`;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  simulatedUserEmail: string | null;
  authLoading: boolean;
  isLoggedIn: boolean;
  role: UserRole;
  setManualRole: (role: UserRole) => void;
  isTeacher: boolean;
  isSuperAdmin: boolean;
  isFaculty: boolean;
  superAdminEmail: string;
  superAdminProfile: SuperAdminProfile;
  updateSuperAdminProfile: (profile: Partial<SuperAdminProfile>) => Promise<void>;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  selectedLoginCategory: 'student' | 'teacher' | 'super_admin';
  setSelectedLoginCategory: (cat: 'student' | 'teacher' | 'super_admin') => void;
  loginWithEmailAndCategory: (
    email: string,
    category: 'student' | 'teacher' | 'super_admin'
  ) => Promise<boolean>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  activeTab: 'home' | 'timetable' | 'lectures' | 'results_fees' | 'profile' | 'teacher_hub';
  setActiveTab: (tab: 'home' | 'timetable' | 'lectures' | 'results_fees' | 'profile' | 'teacher_hub') => void;
  activeStudent: Student | null;
  setActiveStudent: (student: Student | null) => void;
  // Loading & Transitions
  isDataLoading: boolean;
  refreshData: () => Promise<void>;
  // Academic Years
  currentAcademicYear: string;
  selectedAcademicYear: string;
  setSelectedAcademicYear: (year: string) => void;
  availableAcademicYears: string[];
  // Data
  students: Student[];
  batches: Batch[];
  feeRecords: FeeRecord[];
  testResults: TestResult[];
  lectures: Lecture[];
  timetable: TimetableSlot[];
  notices: Notice[];
  approvedTeachers: ApprovedTeacher[];
  // Current Student Data (isolated & year-scoped)
  currentStudentFee: FeeRecord | null;
  currentStudentResults: TestResult[];
  currentStudentLectures: Lecture[];
  currentStudentTimetable: TimetableSlot[];
  currentStudentNotices: Notice[];
  // Actions
  signInWithGoogle: (category?: 'student' | 'teacher' | 'super_admin') => Promise<{ email: string; displayName?: string | null; profileCompleted: boolean } | null>;
  saveStudentOnboarding: (data: StudentOnboardingData) => Promise<void>;
  saveTeacherOnboarding: (data: TeacherOnboardingData) => Promise<void>;
  checkUserHasCompletedProfile: (email: string, role: 'student' | 'teacher') => boolean;
  simulateGoogleLogin: (email: string, category?: 'student' | 'teacher' | 'super_admin') => Promise<void>;
  simulateOtpLogin: (phone: string, targetRole: UserRole) => void;
  logout: () => Promise<void>;
  // Super Admin & Teacher Operations
  addTeacher: (teacher: Omit<ApprovedTeacher, 'id'>) => Promise<void>;
  removeTeacher: (teacherEmail: string) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  bulkAddStudents: (students: Omit<Student, 'id'>[]) => Promise<{ added: number; failed: number }>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<boolean>;
  toggleStudentStatus: (studentId: string) => Promise<void>;
  cleanDuplicateStudents: () => Promise<number>;
  startNewYear: (newYearLabel: string, promotions: StudentPromotionAction[], resetFees: boolean) => Promise<void>;
  addBatch: (batch: Batch) => Promise<void>;
  updateFeeRecord: (studentId: string, updates: Partial<FeeRecord>) => Promise<void>;
  addTestResult: (result: Omit<TestResult, 'id'>) => Promise<void>;
  uploadLecture: (lectureData: {
    title: string;
    subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';
    chapter: string;
    batchId: string;
    videoUrl: string;
    videoFileName?: string;
    fileSize?: string;
    duration?: string;
    teacherName?: string;
    notesUrl?: string;
    appOnly?: boolean;
  }) => Promise<void>;
  deleteLecture: (id: string) => Promise<void>;
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => Promise<void>;
  deleteTimetableSlot: (slotId: string) => Promise<void>;
  postNotice: (notice: Omit<Notice, 'id'>) => Promise<void>;
  deleteNotice: (noticeId: string) => Promise<void>;
  recordPayment: (studentId: string, amount: number, mode?: string) => Promise<FeeReceipt>;
  // Lecture upload & security settings
  lectureSettings: LectureUploadSettings;
  updateLectureSettings: (settings: Partial<LectureUploadSettings>) => void;
  // Student Timestamped Lecture Notes (persisting to student profile)
  studentNotes: LectureNote[];
  addLectureNote: (note: {
    lectureId: string;
    lectureTitle: string;
    subject: string;
    timestampSeconds: number;
    timestampFormatted: string;
    text: string;
  }) => Promise<LectureNote>;
  deleteLectureNote: (noteId: string) => Promise<void>;
  updateLectureNote: (noteId: string, newText: string) => Promise<void>;
  targetLectureToPlay: { lectureId: string; timestampSeconds?: number } | null;
  setTargetLectureToPlay: (target: { lectureId: string; timestampSeconds?: number } | null) => void;
  // In-app notifications
  toast: { message: string; type: 'success' | 'error' | 'info'; id: number } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [simulatedUserEmail, setSimulatedUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'timetable' | 'lectures' | 'results_fees' | 'profile' | 'teacher_hub'>('home');
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bsc_dark_mode');
      if (saved === 'true') return true;
      if (saved === 'false') return false;
      return false; // Default to clean light theme for Bhavani Science Classes
    }
    return false;
  });

  // Synchronize dark class to DOM when isDarkMode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('bsc_dark_mode', String(next));
      }
      return next;
    });
  };

  const setDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bsc_dark_mode', String(enabled));
    }
  };

  // Track if session was initiated by a faculty member or super admin
  const [authenticatedAsFaculty, setAuthenticatedAsFaculty] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bsc_is_faculty_session');
      return saved === 'true';
    }
    return false;
  });

  const setIsFacultySession = (isFac: boolean) => {
    setAuthenticatedAsFaculty(isFac);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bsc_is_faculty_session', String(isFac));
    }
  };

  // Super Admin Owner account configuration
  const superAdminEmail = 'ardgamer113@gmail.com';

  // Super Admin Profile State with local & firestore persistence
  const [superAdminProfile, setSuperAdminProfile] = useState<SuperAdminProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bsc_super_admin_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Error parsing super admin profile:', e);
        }
      }
    }
    return {
      name: 'Director / Prof. A. R. Deshmukh',
      email: 'ardgamer113@gmail.com',
      phone: '+91 98200 45678',
      designation: 'Founder & Academic Director (Physics)',
      bio: 'Leading JEE & NEET Physics preparation in Virar West for over 18 years. Alumnus IIT Bombay.',
      officeHours: 'Mon-Sat: 10:00 AM - 02:00 PM',
      avatarInitials: 'AD',
    };
  });

  const updateSuperAdminProfile = async (updates: Partial<SuperAdminProfile>) => {
    setSuperAdminProfile((prev) => {
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('bsc_super_admin_profile', JSON.stringify(updated));
      }
      return updated;
    });
    try {
      const docRef = doc(db, 'teachers', 'ardgamer113@gmail.com');
      await setDoc(docRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Super admin profile firestore sync:', e);
    }
    showToast('Faculty profile updated successfully!', 'success');
  };

  // Academic Years state
  const [currentAcademicYear, setCurrentAcademicYear] = useState<string>('2025-26');
  const [selectedAcademicYear, setSelectedAcademicYearState] = useState<string>('2025-26');
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>(['2024-25', '2025-26', '2026-27']);

  // Data Loading & Skeleton Transition state
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Transition data loading on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDataLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const setSelectedAcademicYear = (year: string) => {
    if (year === selectedAcademicYear) return;
    setIsDataLoading(true);
    setSelectedAcademicYearState(year);
    setTimeout(() => {
      setIsDataLoading(false);
    }, 450);
  };

  const refreshData = async () => {
    setIsDataLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setIsDataLoading(false);
  };

  // Login category selector on login screen
  const [selectedLoginCategory, setSelectedLoginCategory] = useState<'student' | 'teacher' | 'super_admin'>('student');

  // Core collections in state (fallback to seeds if offline or unseeded)
  const [students, setStudents] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bsc_students');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return deduplicateStudents(parsed);
        } catch (e) {
          console.warn('Failed to parse bsc_students:', e);
        }
      }
    }
    return deduplicateStudents(INITIAL_STUDENTS);
  });
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bsc_fee_records');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.warn('Failed to parse bsc_fee_records:', e);
        }
      }
    }
    return INITIAL_FEE_RECORDS;
  });
  const [testResults, setTestResults] = useState<TestResult[]>(() => deduplicateTestResults(INITIAL_TEST_RESULTS));
  const [lectures, setLectures] = useState<Lecture[]>(INITIAL_LECTURES);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [approvedTeachers, setApprovedTeachers] = useState<ApprovedTeacher[]>(INITIAL_TEACHERS);

  // Active student selection for student view
  const [selectedStudentId, setSelectedStudentId] = useState<string>('student-aryan-042');

  // Lecture Settings: default is teacher-only upload, app-only private playback
  const [lectureSettings, setLectureSettings] = useState<LectureUploadSettings>({
    teacherUploadOnly: true,
    appOnlyPlayback: true,
    antiPiracyWatermark: true,
    allowStudentUploads: false,
    videoOptimization: '720p_fast',
    defaultTargetBatch: 'all',
  });

  // In-app Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; id: number } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4500);
  };

  const updateLectureSettings = (partial: Partial<LectureUploadSettings>) => {
    setLectureSettings((prev) => {
      const updated = { ...prev, ...partial };
      showToast('Lecture security settings updated!', 'info');
      return updated;
    });
  };

  // Student Timestamped Lecture Notes with localStorage persistence
  const [studentNotes, setStudentNotes] = useState<LectureNote[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bsc_student_notes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Error reading bsc_student_notes:', e);
        }
      }
    }
    return INITIAL_LECTURE_NOTES;
  });

  const [targetLectureToPlay, setTargetLectureToPlay] = useState<{ lectureId: string; timestampSeconds?: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bsc_student_notes', JSON.stringify(studentNotes));
    }
  }, [studentNotes]);

  // Test Firestore connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser?.email) {
        setSimulatedUserEmail(currentUser.email);
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute Current Effective Email
  const effectiveEmail = useMemo(() => {
    return (user?.email || simulatedUserEmail || '').toLowerCase();
  }, [user, simulatedUserEmail]);

  // Compute Current Role & Super Admin status
  const isSuperAdmin = useMemo(() => {
    if (simulatedRole === 'super_admin') return true;
    if (!effectiveEmail) return false;
    if (effectiveEmail === superAdminEmail.toLowerCase()) return true;
    const found = approvedTeachers.find((t) => t.email.toLowerCase() === effectiveEmail);
    return Boolean(found?.isOwner);
  }, [effectiveEmail, superAdminEmail, approvedTeachers, simulatedRole]);

  const role: UserRole = useMemo(() => {
    if (simulatedRole) return simulatedRole;
    if (!effectiveEmail) return 'student';

    if (isSuperAdmin) return 'super_admin';

    const isTeacherEmail = approvedTeachers.some(
      (t) => t.email.toLowerCase() === effectiveEmail
    );
    if (isTeacherEmail) return 'teacher';

    return 'student';
  }, [effectiveEmail, simulatedRole, approvedTeachers, isSuperAdmin]);

  const isTeacher = role === 'teacher' || role === 'super_admin' || isSuperAdmin;
  const isLoggedIn = Boolean(user || simulatedUserEmail || simulatedRole);

  // Authenticated user is an actual faculty member or super admin (strictly false for students)
  const isFaculty = useMemo(() => {
    // 1. Direct check by Google user email
    if (user?.email) {
      const emailLower = user.email.toLowerCase();
      if (emailLower === superAdminEmail.toLowerCase()) return true;
      if (approvedTeachers.some((t) => t.email.toLowerCase() === emailLower)) return true;
      return false;
    }
    // 2. Direct check by simulated email (e.g. preview mode)
    if (simulatedUserEmail) {
      const simLower = simulatedUserEmail.toLowerCase();
      if (simLower === superAdminEmail.toLowerCase()) return true;
      if (approvedTeachers.some((t) => t.email.toLowerCase() === simLower)) return true;
    }
    // 3. Faculty session flag (persists when teacher tests student preview)
    if (authenticatedAsFaculty) return true;
    // 4. Fallback based on current role
    return role === 'teacher' || role === 'super_admin' || isSuperAdmin;
  }, [user, simulatedUserEmail, approvedTeachers, superAdminEmail, authenticatedAsFaculty, role, isSuperAdmin]);

  // Seed initial data to Firestore when a teacher is authenticated
  useEffect(() => {
    if (!isTeacher || !user) return;

    const seedDatabase = async () => {
      try {
        const batchSnap = await getDocs(collection(db, 'batches'));
        if (batchSnap.empty) {
          console.log('Seeding initial Bhavani Science Classes data into Firestore...');
          for (const b of INITIAL_BATCHES) {
            await setDoc(doc(db, 'batches', b.id), b);
          }
          for (const s of INITIAL_STUDENTS) {
            await setDoc(doc(db, 'students', s.id), s);
            if (s.email) {
              await setDoc(doc(db, 'students', s.email.toLowerCase()), s);
            }
          }
          for (const f of INITIAL_FEE_RECORDS) {
            await setDoc(doc(db, 'fee_records', f.id), f);
          }
          for (const r of INITIAL_TEST_RESULTS) {
            await setDoc(doc(db, 'test_results', r.id), r);
          }
          for (const l of INITIAL_LECTURES) {
            await setDoc(doc(db, 'lectures', l.id), l);
          }
          for (const t of INITIAL_TIMETABLE) {
            await setDoc(doc(db, 'timetables', t.id), t);
          }
          for (const n of INITIAL_NOTICES) {
            await setDoc(doc(db, 'notices', n.id), n);
          }
          for (const tea of INITIAL_TEACHERS) {
            await setDoc(doc(db, 'teachers', tea.email.toLowerCase()), tea);
            await setDoc(doc(db, 'approved_teachers', tea.email.toLowerCase()), tea);
          }
          console.log('Initial data seeded successfully by teacher.');
        }
      } catch (err) {
        console.warn('Seeding check:', err);
      }
    };

    seedDatabase();
  }, [isTeacher, user]);

  // Set up real-time listeners for public batches
  useEffect(() => {
    const unsubBatches = onSnapshot(
      collection(db, 'batches'),
      (snap) => {
        if (!snap.empty) {
          const list: Batch[] = [];
          snap.forEach((d) => list.push(d.data() as Batch));
          setBatches(list);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'batches');
        } catch (e) {
          console.warn('Batches listener:', e);
        }
      }
    );

    return () => unsubBatches();
  }, []);

  // Listen for teachers collection updates
  useEffect(() => {
    const unsubTeachers = onSnapshot(
      collection(db, 'teachers'),
      (snap) => {
        if (!snap.empty) {
          const list: ApprovedTeacher[] = [];
          snap.forEach((d) => list.push({ ...(d.data() as ApprovedTeacher), id: d.id }));
          setApprovedTeachers(list);
        }
      },
      (err) => {
        console.warn('Teachers listener:', err);
      }
    );

    return () => unsubTeachers();
  }, []);

  // Set up authenticated real-time listeners
  useEffect(() => {
    // Only subscribe to protected collections if user is signed in with Firebase Auth
    if (!user) {
      return;
    }

    const unsubs: (() => void)[] = [];

    if (isTeacher) {
      // Teacher has full read access across all student records and fee ledgers
      const unsubStudents = onSnapshot(
        collection(db, 'students'),
        (snap) => {
          if (!snap.empty) {
            const list: Student[] = [];
            snap.forEach((d) => list.push({ ...(d.data() as Student), id: d.id }));
            setStudents(deduplicateStudents(list));
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'students');
          } catch (e) {
            console.warn('Students listener:', e);
          }
        }
      );
      unsubs.push(unsubStudents);

      const unsubFees = onSnapshot(
        collection(db, 'fee_records'),
        (snap) => {
          if (!snap.empty) {
            const list: FeeRecord[] = [];
            snap.forEach((d) => list.push({ ...(d.data() as FeeRecord), id: d.id }));
            setFeeRecords(list);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'fee_records');
          } catch (e) {
            console.warn('Fees listener:', e);
          }
        }
      );
      unsubs.push(unsubFees);

      const unsubTests = onSnapshot(
        collection(db, 'test_results'),
        (snap) => {
          if (!snap.empty) {
            const list: TestResult[] = [];
            snap.forEach((d) => list.push({ ...(d.data() as TestResult), id: d.id }));
            setTestResults(deduplicateTestResults(list));
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'test_results');
          } catch (e) {
            console.warn('Tests listener:', e);
          }
        }
      );
      unsubs.push(unsubTests);
    } else {
      // Student: secure query matching rules
      const studentEmail = (user.email || '').toLowerCase();
      const unsubStudentFees = onSnapshot(
        query(collection(db, 'fee_records'), where('studentEmail', '==', studentEmail)),
        (snap) => {
          if (!snap.empty) {
            const list: FeeRecord[] = [];
            snap.forEach((d) => list.push({ ...(d.data() as FeeRecord), id: d.id }));
            setFeeRecords((prev) => [...list, ...prev.filter((p) => p.studentEmail !== studentEmail)]);
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'fee_records');
          } catch (e) {
            console.warn('Student fees listener:', e);
          }
        }
      );
      unsubs.push(unsubStudentFees);

      const unsubStudentTests = onSnapshot(
        query(collection(db, 'test_results'), where('studentEmail', '==', studentEmail)),
        (snap) => {
          if (!snap.empty) {
            const list: TestResult[] = [];
            snap.forEach((d) => list.push({ ...(d.data() as TestResult), id: d.id }));
            setTestResults((prev) => deduplicateTestResults([...list, ...prev.filter((p) => p.studentEmail !== studentEmail)]));
          }
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, 'test_results');
          } catch (e) {
            console.warn('Student tests listener:', e);
          }
        }
      );
      unsubs.push(unsubStudentTests);
    }

    // Common collections for authenticated active students and teachers
    const unsubLectures = onSnapshot(
      collection(db, 'lectures'),
      (snap) => {
        if (!snap.empty) {
          const list: Lecture[] = [];
          snap.forEach((d) => list.push({ ...(d.data() as Lecture), id: d.id }));
          setLectures(list);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'lectures');
        } catch (e) {
          console.warn('Lectures listener:', e);
        }
      }
    );
    unsubs.push(unsubLectures);

    const unsubTimetable = onSnapshot(
      collection(db, 'timetables'),
      (snap) => {
        if (!snap.empty) {
          const list: TimetableSlot[] = [];
          snap.forEach((d) => list.push({ ...(d.data() as TimetableSlot), id: d.id }));
          setTimetable(list);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'timetables');
        } catch (e) {
          console.warn('Timetable listener:', e);
        }
      }
    );
    unsubs.push(unsubTimetable);

    const unsubNotices = onSnapshot(
      collection(db, 'notices'),
      (snap) => {
        if (!snap.empty) {
          const list: Notice[] = [];
          snap.forEach((d) => list.push({ ...(d.data() as Notice), id: d.id }));
          setNotices(list);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'notices');
        } catch (e) {
          console.warn('Notices listener:', e);
        }
      }
    );
    unsubs.push(unsubNotices);

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user, isTeacher]);

  const setManualRole = (newRole: UserRole) => {
    setSimulatedRole(newRole);
    if (newRole === 'super_admin') {
      setSimulatedUserEmail(superAdminEmail);
      setActiveTab('teacher_hub');
      showToast('Switched to Teacher mode', 'info');
    } else if (newRole === 'teacher') {
      setSimulatedUserEmail('prof.deshmukh@bhavani.edu');
      setActiveTab('teacher_hub');
      showToast('Switched to Faculty mode', 'info');
    } else {
      setSimulatedUserEmail('aryan.deshmukh@gmail.com');
      setActiveTab('home');
      showToast('Switched to Student mode', 'info');
    }
  };

  // Resolve active student based on email or selection
  const activeStudent: Student | null = useMemo(() => {
    if (effectiveEmail) {
      const eff = effectiveEmail.trim().toLowerCase();
      const safeKey = eff.replace(/[^a-z0-9]/g, '_');
      const detId = `student-${safeKey}`;
      const found = students.find(
        (s) =>
          (s.email && s.email.trim().toLowerCase() === eff) ||
          s.id === eff ||
          s.uid === eff ||
          s.id === detId
      );
      if (found) return found;

      // Also check normalized name vs email prefix
      const prefix = eff.split('@')[0].replace(/[^a-z0-9]/g, '');
      const foundByName = students.find((s) => {
        const norm = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return norm === prefix || (prefix.length > 3 && norm.includes(prefix));
      });
      if (foundByName) return foundByName;
    }
    const foundById = students.find((s) => s.id === selectedStudentId);
    return foundById || students.find((s) => s.status === 'active') || students[0] || null;
  }, [effectiveEmail, students, selectedStudentId]);

  const setActiveStudent = (s: Student | null) => {
    if (s) {
      setSelectedStudentId(s.id);
    }
  };

  // Student-isolated & Academic Year scoped data
  const currentStudentFee = useMemo(() => {
    if (!activeStudent) return null;
    // Priority 1: Match student and selectedAcademicYear
    const matched = feeRecords.find(
      (f) => f.studentId === activeStudent.id && f.academicYear === selectedAcademicYear
    );
    if (matched) return matched;
    // Priority 2: Fallback to most recent fee record of this student
    return feeRecords.find((f) => f.studentId === activeStudent.id) || null;
  }, [activeStudent, feeRecords, selectedAcademicYear]);

  const currentStudentResults = useMemo(() => {
    if (!activeStudent) return [];
    const studentEmailLower = activeStudent.email ? activeStudent.email.trim().toLowerCase() : '';
    const studentRollUpper = activeStudent.rollNo ? activeStudent.rollNo.trim().toUpperCase() : '';
    const normStudentName = (activeStudent.name || '')
      .toLowerCase()
      .replace(/^student\s+/i, '')
      .replace(/[^a-z0-9]/g, '');

    const filtered = testResults.filter((r) => {
      const rEmail = r.studentEmail ? r.studentEmail.trim().toLowerCase() : '';
      const rRoll = r.studentRoll ? r.studentRoll.trim().toUpperCase() : '';
      const rName = (r.studentName || '')
        .toLowerCase()
        .replace(/^student\s+/i, '')
        .replace(/[^a-z0-9]/g, '');

      const matches =
        r.studentId === activeStudent.id ||
        (studentEmailLower && rEmail === studentEmailLower) ||
        (studentRollUpper && rRoll === studentRollUpper) ||
        (normStudentName && normStudentName.length > 3 && rName === normStudentName);

      if (!matches) return false;
      if (selectedAcademicYear && r.academicYear && r.academicYear !== selectedAcademicYear) {
        return false;
      }
      return true;
    });
    return deduplicateTestResults(filtered);
  }, [activeStudent, testResults, selectedAcademicYear]);

  const currentStudentLectures = useMemo(() => {
    if (!activeStudent) return lectures;
    return lectures.filter(
      (l) =>
        (l.batchId === 'all' || l.batchId === activeStudent.batchId) &&
        (!l.academicYear || l.academicYear === selectedAcademicYear)
    );
  }, [activeStudent, lectures, selectedAcademicYear]);

  const currentStudentTimetable = useMemo(() => {
    if (!activeStudent) return timetable;
    return timetable.filter((t) => t.batchId === activeStudent.batchId);
  }, [activeStudent, timetable]);

  const currentStudentNotices = useMemo(() => {
    if (!activeStudent) return notices;
    return notices.filter(
      (n) => n.batchId === 'all' || n.batchId === activeStudent.batchId
    );
  }, [activeStudent, notices]);

  const currentStudentNotes = useMemo(() => {
    if (!activeStudent) return studentNotes;
    const sId = activeStudent.id;
    const sEmail = (activeStudent.email || '').toLowerCase();
    return studentNotes.filter((n) => {
      if (n.studentId && n.studentId === sId) return true;
      if (n.studentEmail && sEmail && n.studentEmail.toLowerCase() === sEmail) return true;
      return false;
    });
  }, [activeStudent, studentNotes]);

  // Robust Login by Category and Email (Zero Denials for Students)
  const loginWithEmailAndCategory = async (
    rawEmail: string,
    category: 'student' | 'teacher' | 'super_admin'
  ): Promise<boolean> => {
    const email = rawEmail.trim().toLowerCase();
    if (!email) {
      const err = 'Please enter a valid Gmail or email address.';
      setAuthError(err);
      showToast(err, 'error');
      return false;
    }
    setAuthError(null);

    // 1. Super Admin Director Login
    if (category === 'super_admin' || email === superAdminEmail.toLowerCase()) {
      setIsFacultySession(true);
      setSimulatedUserEmail(email);
      setSimulatedRole('super_admin');
      setActiveTab('teacher_hub');
      showToast('Welcome, Director (Prof. Deshmukh)! Full institute management enabled.', 'success');
      return true;
    }

    // 2. Faculty / Teacher Login
    if (category === 'teacher') {
      setIsFacultySession(true);
      let foundTeacher = approvedTeachers.find((t) => t.email.toLowerCase() === email);
      if (!foundTeacher) {
        // Auto-approve faculty member on login so they are never blocked
        const emailPrefix = email.split('@')[0] || 'faculty';
        const cleanName = emailPrefix
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const newTeacher: ApprovedTeacher = {
          id: email,
          name: cleanName.length > 2 ? `Prof. ${cleanName}` : 'Faculty Member',
          email: email,
          subject: 'Science & Engineering',
          phone: '9820012345',
          addedAt: new Date().toISOString().split('T')[0],
          isOwner: false,
        };
        setApprovedTeachers((prev) => [
          ...prev.filter((t) => t.email.toLowerCase() !== email),
          newTeacher,
        ]);
        foundTeacher = newTeacher;
      }
      setSimulatedUserEmail(email);
      setSimulatedRole('teacher');
      setActiveTab('teacher_hub');
      showToast(`Welcome, ${foundTeacher.name}! Faculty Hub opened.`, 'success');
      return true;
    }

    // 3. Student Login - NEVER DENIED & STRICTLY DEDUPLICATED
    setIsFacultySession(false);
    const safeEmailKey = email.replace(/[^a-z0-9]/g, '_');
    const deterministicId = `student-${safeEmailKey}`;
    const emailPrefix = email.split('@')[0] || 'student';
    const cleanPrefix = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '');

    let targetStudent = students.find(
      (s) =>
        (s.email && s.email.trim().toLowerCase() === email) ||
        s.id === email ||
        s.uid === email ||
        s.id === deterministicId
    );

    // Also check by name matching the email prefix or user displayName
    if (!targetStudent) {
      targetStudent = students.find((s) => {
        if (!s.name) return false;
        const norm = s.name.toLowerCase().replace(/^student\s+/i, '').replace(/[^a-z0-9]/g, '');
        if (norm === cleanPrefix) return true;
        if (cleanPrefix.length > 3 && (norm.includes(cleanPrefix) || cleanPrefix.includes(norm))) return true;
        if (user?.displayName) {
          const normDisplay = user.displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (norm === normDisplay || norm.includes(normDisplay)) return true;
        }
        return false;
      });
    }

    // Also check localStorage if not in current memory state
    if (!targetStudent && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bsc_students');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            targetStudent = parsed.find(
              (s: Student) =>
                (s.email && s.email.trim().toLowerCase() === email) ||
                s.id === email ||
                s.id === deterministicId
            );
          }
        }
      } catch (e) {
        // ignore
      }
    }

    if (!targetStudent) {
      // Auto-create active student profile with deterministic ID & Roll Number
      const emailPrefix = email.split('@')[0] || 'student';
      const cleanName = emailPrefix
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const studentName = (user?.displayName && user.displayName.trim().length > 2)
        ? user.displayName.trim()
        : cleanName.length > 2 ? cleanName : `Student ${cleanName}`;

      let hash = 0;
      for (let i = 0; i < email.length; i++) {
        hash = (hash << 5) - hash + email.charCodeAt(i);
        hash |= 0;
      }
      const rollSuffix = Math.abs(hash % 900) + 100;
      const newRoll = `BSC-${(currentAcademicYear || '2025-26').slice(0, 4)}-JEE-${rollSuffix}`;
      const newId = deterministicId;

      const newStudent: Student = {
        id: newId,
        uid: newId,
        email: email,
        name: studentName,
        rollNo: newRoll,
        phone: `98201${Math.floor(10000 + Math.random() * 90000)}`,
        batch: '12th JEE Main & Advanced - Elite',
        batchId: 'jee-2025-a',
        batchName: '12th JEE Main & Advanced - Elite',
        class: 'Class 12',
        academicYear: currentAcademicYear || '2025-26',
        status: 'active',
        parentName: `Mr./Mrs. ${studentName.split(' ')[1] || studentName}`,
        parentPhone: `98201${Math.floor(10000 + Math.random() * 90000)}`,
        admissionDate: new Date().toISOString().split('T')[0],
        active: true,
      };

      const newFeeRecord: FeeRecord = {
        id: `fee-${newId}`,
        studentId: newId,
        studentRoll: newRoll,
        studentName: studentName,
        studentEmail: email,
        batchId: 'jee-2025-a',
        academicYear: currentAcademicYear || '2025-26',
        totalFee: 65000,
        paidFee: 35000,
        pendingFee: 30000,
        dueDate: '15 Nov 2025',
        currentInstallmentTitle: 'Term 2 Tuition & Science Lab Practicals',
        currentInstallmentNo: 2,
        totalInstallments: 3,
        installmentAmount: 15000,
        upiId: 'bhavaniscienceclasses@okhdfcbank',
        breakdown: [
          { label: 'Physics, Chemistry & Maths Coaching', amount: 12000 },
          { label: 'Weekly Mock Test Series & DPPs', amount: 2000 },
          { label: 'Digital Library & Recorded Lectures', amount: 1000 },
        ],
        pastReceipts: [
          {
            receiptNo: `BSC-RCP-2025-${rollSuffix}`,
            amount: 35000,
            date: '10 Jul 2025',
            mode: 'UPI / NPCI HDFC Gateway',
            title: 'Term 1 Foundation Course & Study Modules',
            status: 'PAID',
            transactionRef: `UPI/HDFC/50${rollSuffix}914`,
            academicYear: currentAcademicYear || '2025-26',
          },
        ],
      };

      // Check if student tests already exist before creating default tests
      const hasExistingTests = testResults.some(
        (r) => r.studentId === newId || (r.studentEmail && r.studentEmail.toLowerCase() === email)
      );

      if (!hasExistingTests) {
        const newTest1: TestResult = {
          id: `test-res-1-${newId}`,
          studentId: newId,
          studentRoll: newRoll,
          studentName: studentName,
          studentEmail: email,
          batchId: 'jee-2025-a',
          academicYear: currentAcademicYear || '2025-26',
          testTitle: 'JEE Advanced Physics & Maths Cumulative',
          date: '28 Sep 2025',
          totalMarks: 268,
          maxMarks: 300,
          percentile: 98.4,
          rank: 3,
          totalStudents: 45,
          subjects: [
            { name: 'Physics', marks: 92, max: 100 },
            { name: 'Chemistry', marks: 86, max: 100 },
            { name: 'Mathematics', marks: 90, max: 100 },
          ],
          remarks: 'Excellent problem solving in Mechanics & Electrostatics',
        };

        const newTest2: TestResult = {
          id: `test-res-2-${newId}`,
          studentId: newId,
          studentRoll: newRoll,
          studentName: studentName,
          studentEmail: email,
          batchId: 'jee-2025-a',
          academicYear: currentAcademicYear || '2025-26',
          testTitle: 'Chemistry Chemical Bonding & Kinetics Test',
          date: '05 Oct 2025',
          totalMarks: 258,
          maxMarks: 300,
          percentile: 97.2,
          rank: 4,
          totalStudents: 45,
          subjects: [
            { name: 'Physics', marks: 86, max: 100 },
            { name: 'Chemistry', marks: 88, max: 100 },
            { name: 'Mathematics', marks: 84, max: 100 },
          ],
          remarks: 'Good conceptual clarity in chemical kinetics',
        };

        setTestResults((prev) => deduplicateTestResults([newTest1, newTest2, ...prev]));
      }

      setStudents((prev) => {
        const next = deduplicateStudents([
          newStudent,
          ...prev.filter(
            (s) =>
              s.email?.toLowerCase() !== email &&
              s.id !== newId &&
              s.id !== email
          ),
        ]);
        if (typeof window !== 'undefined') {
          localStorage.setItem('bsc_students', JSON.stringify(next));
        }
        return next;
      });

      setFeeRecords((prev) => {
        const next = [newFeeRecord, ...prev.filter((f) => f.studentId !== newId)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('bsc_fee_records', JSON.stringify(next));
        }
        return next;
      });

      targetStudent = newStudent;

      try {
        // Save ONLY to single canonical document, NEVER duplicate to 'students/${email}'
        setDoc(doc(db, 'students', newId), newStudent).catch(() => {});
        setDoc(doc(db, 'fee_records', newFeeRecord.id), newFeeRecord).catch(() => {});
      } catch (err) {
        console.warn('Sync student record:', err);
      }
    } else {
      // Student already exists: reuse their canonical profile without creating duplicate entries
      const updates: Partial<Student> = {};
      if (targetStudent.status !== 'active' || !targetStudent.active) {
        updates.status = 'active';
        updates.active = true;
      }
      if (!targetStudent.email || targetStudent.email.trim().toLowerCase() !== email) {
        updates.email = email;
      }
      if (user?.displayName && user.displayName.trim().length > 2 && targetStudent.name.startsWith('Student ')) {
        updates.name = user.displayName.trim();
      }
      if (Object.keys(updates).length > 0) {
        targetStudent = { ...targetStudent, ...updates };
        setStudents((prev) => {
          const next = deduplicateStudents(
            prev.map((s) => (s.id === targetStudent!.id ? targetStudent! : s))
          );
          if (typeof window !== 'undefined') {
            localStorage.setItem('bsc_students', JSON.stringify(next));
          }
          return next;
        });
        try {
          setDoc(doc(db, 'students', targetStudent.id), targetStudent, { merge: true }).catch(() => {});
        } catch (e) {}
      }
    }

    setSelectedStudentId(targetStudent.id);
    setSimulatedUserEmail(email);
    setSimulatedRole('student');
    setActiveTab('home');
    showToast(`Welcome, ${targetStudent.name}! You are logged in as a Student.`, 'success');
    return true;
  };

  // Handle Google Email Verification & Role routing
  const verifyAndRouteGoogleUser = async (email: string, preferredCategory?: 'student' | 'teacher' | 'super_admin') => {
    const emailLower = email.toLowerCase().trim();
    const cat = preferredCategory || selectedLoginCategory;

    if (cat === 'super_admin' || emailLower === superAdminEmail.toLowerCase()) {
      await loginWithEmailAndCategory(emailLower, 'super_admin');
      return;
    }

    if (cat === 'teacher' || (!preferredCategory && approvedTeachers.some((t) => t.email.toLowerCase() === emailLower))) {
      await loginWithEmailAndCategory(emailLower, 'teacher');
      return;
    }

    // Default to student login
    await loginWithEmailAndCategory(emailLower, 'student');
  };

  const checkUserHasCompletedProfile = (email: string, role: 'student' | 'teacher'): boolean => {
    const emailLower = email.toLowerCase().trim();
    if (role === 'teacher') {
      const match = approvedTeachers.find((t) => t.email.toLowerCase() === emailLower);
      return Boolean(match && match.profileCompleted);
    } else {
      const match = students.find((s) => s.email && s.email.toLowerCase() === emailLower);
      return Boolean(match && match.profileCompleted);
    }
  };

  const saveStudentOnboarding = async (data: StudentOnboardingData) => {
    const emailLower = data.email.toLowerCase().trim();
    const safeEmailKey = emailLower.replace(/[^a-z0-9]/g, '_');
    const deterministicId = `student-${safeEmailKey}`;

    let matchedBatch = batches.find((b) => {
      if (data.targetExam?.includes('NEET')) return b.stream === 'NEET';
      if (data.targetExam?.includes('JEE')) return b.stream === 'JEE';
      if (data.targetExam?.includes('CET')) return b.stream === 'MHT-CET';
      return b.name.includes(data.class);
    }) || batches[0] || {
      id: 'jee-2025-a',
      name: '12th JEE Main & Advanced - Elite',
      stream: 'JEE',
      academicYear: currentAcademicYear || '2025-26',
    };

    const studentRecord: Student = {
      id: deterministicId,
      uid: deterministicId,
      email: emailLower,
      name: data.name.trim(),
      rollNo: `BSC-${(currentAcademicYear || '2025-26').slice(0, 4)}-${data.class.replace(/\s+/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      phone: data.phone.trim(),
      parentName: data.parentName.trim(),
      parentPhone: data.parentPhone?.trim() || data.phone.trim(),
      batch: matchedBatch.name,
      batchId: matchedBatch.id,
      batchName: matchedBatch.name,
      class: data.class,
      academicYear: currentAcademicYear || '2025-26',
      status: 'active',
      admissionDate: new Date().toISOString().split('T')[0],
      age: data.age,
      dob: data.dob,
      targetExam: data.targetExam,
      schoolCollege: data.schoolCollege,
      addressArea: data.addressArea,
      profileCompleted: true,
      active: true,
    };

    // Update students state
    setStudents((prev) => [
      ...prev.filter((s) => s.id !== deterministicId && s.email?.toLowerCase() !== emailLower),
      studentRecord,
    ]);
    setSelectedStudentId(studentRecord.id);
    setSimulatedUserEmail(emailLower);
    setSimulatedRole('student');
    setIsFacultySession(false);

    // Save to Firestore
    try {
      const studentDocRef = doc(db, 'students', deterministicId);
      await setDoc(studentDocRef, studentRecord, { merge: true });
    } catch (err) {
      console.warn('Firestore write student:', err);
    }

    // Cache locally
    appCache.set(`student_${deterministicId}`, studentRecord);
    try {
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('bsc_students') || '[]');
        const filtered = existing.filter((s: any) => s.id !== deterministicId && s.email?.toLowerCase() !== emailLower);
        localStorage.setItem('bsc_students', JSON.stringify([...filtered, studentRecord]));
      }
    } catch (e) {}

    setActiveTab('home');
    showToast(`Welcome to Bhavani Science Classes, ${data.name}! Your student registration is complete.`, 'success');
  };

  const saveTeacherOnboarding = async (data: TeacherOnboardingData) => {
    const emailLower = data.email.toLowerCase().trim();
    const teacherRecord: ApprovedTeacher = {
      id: emailLower,
      email: emailLower,
      name: data.name.trim(),
      subject: data.subject.trim(),
      qualification: data.qualification?.trim(),
      phone: data.phone.trim(),
      age: data.age,
      experienceYears: data.experienceYears,
      bio: data.bio?.trim(),
      assignedBatches: data.assignedBatches || ['jee-2025-a', 'neet-2025-b'],
      profileCompleted: true,
      addedAt: new Date().toISOString().split('T')[0],
      isOwner: emailLower === superAdminEmail.toLowerCase(),
    };

    setApprovedTeachers((prev) => [
      ...prev.filter((t) => t.email.toLowerCase() !== emailLower),
      teacherRecord,
    ]);
    setSimulatedUserEmail(emailLower);
    setSimulatedRole('teacher');
    setIsFacultySession(true);

    try {
      const teacherDocRef = doc(db, 'teachers', emailLower);
      await setDoc(teacherDocRef, teacherRecord, { merge: true });
    } catch (err) {
      console.warn('Firestore write teacher:', err);
    }

    appCache.set(`teacher_${emailLower}`, teacherRecord);

    setActiveTab('teacher_hub');
    showToast(`Welcome, ${data.name}! Faculty credentials verified and saved.`, 'success');
  };

  // Auth actions
  const signInWithGoogle = async (
    category?: 'student' | 'teacher' | 'super_admin'
  ): Promise<{ email: string; displayName?: string | null; profileCompleted: boolean } | null> => {
    try {
      setAuthError(null);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user?.email) {
        const emailLower = res.user.email.toLowerCase().trim();
        const role = category === 'teacher' ? 'teacher' : 'student';
        const isComplete = checkUserHasCompletedProfile(emailLower, role);
        if (isComplete) {
          await verifyAndRouteGoogleUser(emailLower, category || selectedLoginCategory);
        }
        return {
          email: emailLower,
          displayName: res.user.displayName,
          profileCompleted: isComplete,
        };
      }
      return null;
    } catch (err: unknown) {
      console.error('Google Sign In failed:', err);
      showToast('Google sign in popup was closed or unavailable.', 'info');
      return null;
    }
  };

  // Quick Simulation for preview environment testing
  const simulateGoogleLogin = async (email: string, category?: 'student' | 'teacher' | 'super_admin') => {
    setAuthError(null);
    await verifyAndRouteGoogleUser(email, category || selectedLoginCategory);
  };

  const simulateOtpLogin = (phone: string, targetRole: UserRole) => {
    setAuthError(null);
    setSimulatedRole(targetRole);
    if (targetRole === 'teacher') {
      setIsFacultySession(true);
      setSimulatedUserEmail('faculty@bhavaniscience.edu');
      setActiveTab('teacher_hub');
    } else {
      setIsFacultySession(false);
      const match = students.find((s) => s.phone.includes(phone.slice(-4)));
      if (match) {
        setSelectedStudentId(match.id);
        setSimulatedUserEmail(match.email);
      } else {
        setSelectedStudentId('student-aryan-042');
        setSimulatedUserEmail('aryan.jee@gmail.com');
      }
      setActiveTab('home');
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setIsFacultySession(false);
    setUser(null);
    setSimulatedUserEmail(null);
    setSimulatedRole(null);
    setAuthError(null);
    setActiveTab('home');
    showToast('Signed out successfully.', 'info');
  };

  // Teacher & Super Admin Management
  const addTeacher = async (teacherData: Omit<ApprovedTeacher, 'id'>) => {
    if (!isSuperAdmin) {
      showToast('Permission denied: Only authorized teachers can add teachers.', 'error');
      return;
    }
    const newTeacher: ApprovedTeacher = {
      ...teacherData,
      id: teacherData.email.toLowerCase(),
      email: teacherData.email.toLowerCase(),
      addedAt: new Date().toISOString().split('T')[0],
      isOwner: false,
    };
    setApprovedTeachers((prev) => [
      ...prev.filter((t) => t.email.toLowerCase() !== newTeacher.email),
      newTeacher,
    ]);
    showToast(`Teacher ${teacherData.name} (${teacherData.email}) approved!`, 'success');

    try {
      await setDoc(doc(db, 'teachers', newTeacher.email), newTeacher);
      await setDoc(doc(db, 'approved_teachers', newTeacher.email), newTeacher);
    } catch (err) {
      console.warn('Add teacher sync:', err);
    }
  };

  const removeTeacher = async (teacherEmail: string) => {
    if (!isSuperAdmin) {
      showToast('Permission denied: Only authorized teachers can remove teachers.', 'error');
      return;
    }
    if (teacherEmail.toLowerCase() === superAdminEmail.toLowerCase()) {
      showToast('Cannot remove the primary institute teacher account.', 'error');
      return;
    }
    setApprovedTeachers((prev) =>
      prev.filter((t) => t.email.toLowerCase() !== teacherEmail.toLowerCase())
    );
    showToast(`Teacher ${teacherEmail} removed from faculty list.`, 'info');

    try {
      await deleteDoc(doc(db, 'teachers', teacherEmail.toLowerCase()));
      await deleteDoc(doc(db, 'approved_teachers', teacherEmail.toLowerCase()));
    } catch (err) {
      console.warn('Remove teacher sync:', err);
    }
  };

  // Student Management Actions
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    const emailLower = studentData.email ? studentData.email.trim().toLowerCase() : '';
    const rollUpper = studentData.rollNo ? studentData.rollNo.trim().toUpperCase() : '';
    const normName = (studentData.name || '')
      .toLowerCase()
      .replace(/^student\s+/i, '')
      .replace(/[^a-z0-9]/g, '');

    const existingStudent = students.find((s) => {
      if (emailLower && s.email && s.email.trim().toLowerCase() === emailLower) return true;
      if (rollUpper && s.rollNo && s.rollNo.trim().toUpperCase() === rollUpper) return true;
      if (normName && normName.length > 3) {
        const sNorm = (s.name || '').toLowerCase().replace(/^student\s+/i, '').replace(/[^a-z0-9]/g, '');
        if (sNorm === normName && (s.batchId === studentData.batchId || s.phone === studentData.phone)) return true;
      }
      return false;
    });

    if (existingStudent) {
      await updateStudent(existingStudent.id, {
        ...studentData,
        status: studentData.status || existingStudent.status || 'active',
        active: studentData.status !== 'inactive',
      });
      showToast(`Student profile for ${studentData.name} updated successfully!`, 'success');
      return;
    }

    const safeEmailKey = emailLower ? emailLower.replace(/[^a-z0-9]/g, '_') : '';
    const newId = createStudentId(safeEmailKey);
    const newStudent: Student = {
      ...studentData,
      id: newId,
      academicYear: studentData.academicYear || currentAcademicYear,
      status: studentData.status || 'active',
      active: studentData.status !== 'inactive',
      batch: studentData.batch || studentData.batchName || 'General',
    };

    setStudents((prev) => deduplicateStudents([newStudent, ...prev]));

    const newFeeRecord: FeeRecord = {
      id: newId,
      studentId: newId,
      studentRoll: newStudent.rollNo,
      studentName: newStudent.name,
      studentEmail: newStudent.email,
      batchId: newStudent.batchId,
      academicYear: newStudent.academicYear,
      totalFee: 95000,
      paidFee: 35000,
      pendingFee: 60000,
      dueDate: '15 June 2025',
      currentInstallmentTitle: 'Term 1 Foundation Course & Study Materials',
      currentInstallmentNo: 1,
      totalInstallments: 3,
      installmentAmount: 35000,
      breakdown: [
        { label: 'Tuition & Senior Faculty Modules', amount: 11500 },
        { label: 'Weekly NTA CBT Mock Series & DPPs', amount: 2500 },
        { label: 'AC Study Hall & Reference Library (Magnet Mall)', amount: 1000 },
      ],
      pastReceipts: [
        {
          receiptNo: createReceiptNumber(),
          amount: 35000,
          date: new Date().toLocaleDateString('en-GB'),
          mode: 'UPI / Cheque Desk',
          title: 'Term 1 Enrollment',
          status: 'PAID',
          academicYear: newStudent.academicYear,
        },
      ],
    };
    setFeeRecords((prev) => [newFeeRecord, ...prev.filter((f) => f.studentId !== newId)]);

    try {
      await setDoc(doc(db, 'students', newId), newStudent);
      await setDoc(doc(db, 'fee_records', newId), newFeeRecord);
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }
  };

  const bulkAddStudents = async (newStudents: Omit<Student, 'id'>[]) => {
    let added = 0;
    let failed = 0;
    const createdStudents: Student[] = [];
    const createdFees: FeeRecord[] = [];

    for (const st of newStudents) {
      try {
        const emailKey = st.email ? st.email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') : '';
        const id = emailKey ? `student-${emailKey}` : `student-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const studentObj: Student = {
          ...st,
          id,
          academicYear: st.academicYear || currentAcademicYear,
          status: st.status || 'active',
          active: st.status !== 'inactive',
          rollNo: st.rollNo || `BSC-${(st.academicYear || currentAcademicYear).slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
          admissionDate: st.admissionDate || new Date().toISOString().split('T')[0],
          batch: st.batch || st.batchName || 'General',
        };
        createdStudents.push(studentObj);

        const feeObj: FeeRecord = {
          id,
          studentId: id,
          studentRoll: studentObj.rollNo,
          studentName: studentObj.name,
          studentEmail: studentObj.email,
          batchId: studentObj.batchId,
          academicYear: studentObj.academicYear,
          totalFee: 95000,
          paidFee: 35000,
          pendingFee: 60000,
          dueDate: '15 June 2025',
          currentInstallmentTitle: 'Term 1 Foundation Course & Study Materials',
          currentInstallmentNo: 1,
          totalInstallments: 3,
          installmentAmount: 35000,
          breakdown: [
            { label: 'Tuition & Senior Faculty Modules', amount: 11500 },
            { label: 'Weekly NTA CBT Mock Series & DPPs', amount: 2500 },
            { label: 'AC Study Hall & Reference Library (Magnet Mall)', amount: 1000 },
          ],
          pastReceipts: [],
        };
        createdFees.push(feeObj);

        await setDoc(doc(db, 'students', id), studentObj);
        await setDoc(doc(db, 'fee_records', id), feeObj);
        added++;
      } catch (e) {
        console.warn('Bulk student row error:', e);
        failed++;
      }
    }

    if (createdStudents.length > 0) {
      setStudents((prev) => deduplicateStudents([...createdStudents, ...prev]));
      setFeeRecords((prev) => [...createdFees, ...prev]);
    }

    return { added, failed };
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
    try {
      await setDoc(doc(db, 'students', id), data, { merge: true });
    } catch (err) {
      console.warn('Update student note:', err);
    }
  };

  const deleteStudent = async (studentId: string): Promise<boolean> => {
    if (!isSuperAdmin) {
      showToast('Permission denied: Only authorized teachers can delete students from the database.', 'error');
      return false;
    }

    const studentToDelete = students.find(
      (s) => s.id === studentId || (s.email && s.email.toLowerCase() === studentId.toLowerCase())
    );
    const studentEmail = studentToDelete?.email?.trim().toLowerCase();

    // 1. Remove from state & localStorage
    setStudents((prev) => {
      const next = prev.filter(
        (s) => s.id !== studentId && (!studentEmail || s.email?.toLowerCase() !== studentEmail)
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('bsc_students', JSON.stringify(next));
      }
      return next;
    });

    // 2. Remove associated fee records
    setFeeRecords((prev) => {
      const next = prev.filter(
        (f) => f.studentId !== studentId && (!studentEmail || f.studentEmail?.toLowerCase() !== studentEmail)
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('bsc_fee_records', JSON.stringify(next));
      }
      return next;
    });

    // 3. Remove associated test results
    setTestResults((prev) =>
      prev.filter(
        (r) => r.studentId !== studentId && (!studentEmail || r.studentEmail?.toLowerCase() !== studentEmail)
      )
    );

    // 4. Delete from Firestore database
    try {
      await deleteDoc(doc(db, 'students', studentId));
      if (studentEmail && studentEmail !== studentId) {
        await deleteDoc(doc(db, 'students', studentEmail)).catch(() => {});
      }
      await deleteDoc(doc(db, 'fee_records', studentId)).catch(() => {});
      await deleteDoc(doc(db, 'fee_records', `fee-${studentId}`)).catch(() => {});
      if (studentEmail) {
        await deleteDoc(doc(db, 'fee_records', studentEmail)).catch(() => {});
        await deleteDoc(doc(db, 'fee_records', `fee-${studentEmail}`)).catch(() => {});
      }
      // Also delete tests from Firestore
      const testsToDelete = testResults.filter(
        (r) => r.studentId === studentId || (studentEmail && r.studentEmail?.toLowerCase() === studentEmail)
      );
      for (const t of testsToDelete) {
        await deleteDoc(doc(db, 'test_results', t.id)).catch(() => {});
      }
    } catch (err) {
      console.warn('Delete student firestore note:', err);
    }

    showToast(`Student ${studentToDelete?.name || ''} deleted from database permanently.`, 'success');
    return true;
  };

  const cleanDuplicateStudents = async (): Promise<number> => {
    const originalCount = students.length;
    const cleanList = deduplicateStudents(students);
    const removedCount = originalCount - cleanList.length;

    setStudents(cleanList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bsc_students', JSON.stringify(cleanList));
    }

    // Also deduplicate test results
    const originalTestsCount = testResults.length;
    const cleanTests = deduplicateTestResults(testResults);
    const removedTestsCount = originalTestsCount - cleanTests.length;
    setTestResults(cleanTests);

    // Clean up duplicate documents from Firestore where id === email and an id === student-xxx exists
    try {
      for (const st of cleanList) {
        if (st.email && st.id !== st.email.toLowerCase()) {
          await deleteDoc(doc(db, 'students', st.email.toLowerCase())).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Cleanup redundant docs:', err);
    }

    const totalCleaned = removedCount + removedTestsCount;
    showToast(
      totalCleaned > 0
        ? `Cleaned up ${removedCount} duplicate student profiles and ${removedTestsCount} duplicate marks records.`
        : 'Student and marks database is clean with zero duplicate entries.',
      'success'
    );
    return totalCleaned;
  };

  const toggleStudentStatus = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    await updateStudent(studentId, {
      status: newStatus,
      active: newStatus === 'active',
    });
    showToast(`Student ${student.name} marked ${newStatus}.`, newStatus === 'active' ? 'success' : 'info');
  };

  const startNewYear = async (
    newYearLabel: string,
    promotions: StudentPromotionAction[],
    resetFees: boolean
  ) => {
    if (!isSuperAdmin && !isTeacher) {
      showToast('Permission denied: Only administrators can start a new academic year.', 'error');
      return;
    }

    setCurrentAcademicYear(newYearLabel);
    setSelectedAcademicYear(newYearLabel);
    if (!availableAcademicYears.includes(newYearLabel)) {
      setAvailableAcademicYears((prev) => [...prev, newYearLabel]);
    }

    // Process student promotions and leavers
    const updatedStudents = students.map((st) => {
      const promo = promotions.find((p) => p.studentId === st.id);
      if (!promo) return st;

      if (promo.action === 'leave') {
        return {
          ...st,
          status: 'inactive' as const,
          active: false,
        };
      } else if (promo.action === 'promote') {
        const targetBatch = batches.find((b) => b.id === promo.targetBatchId);
        return {
          ...st,
          batchId: promo.targetBatchId,
          batchName: targetBatch?.name || st.batchName,
          batch: targetBatch?.name || st.batch,
          class: promo.targetClass || st.class,
          academicYear: newYearLabel,
          status: 'active' as const,
          active: true,
        };
      } else {
        // Keep in batch with new academic year
        return {
          ...st,
          academicYear: newYearLabel,
          status: 'active' as const,
          active: true,
        };
      }
    });

    setStudents(updatedStudents);

    // Save updated students in Firestore
    for (const st of updatedStudents) {
      try {
        await setDoc(doc(db, 'students', st.id), st, { merge: true });
      } catch (e) {
        console.warn('Rollover student update:', e);
      }
    }

    // If resetFees is requested: create fresh fee records for active students
    if (resetFees) {
      const newFeeRecords: FeeRecord[] = [];
      for (const st of updatedStudents) {
        if (st.status === 'active') {
          const newFeeId = `${st.id}-${newYearLabel.replace('/', '_')}`;
          const newFee: FeeRecord = {
            id: newFeeId,
            studentId: st.id,
            studentRoll: st.rollNo,
            studentName: st.name,
            studentEmail: st.email,
            batchId: st.batchId,
            academicYear: newYearLabel,
            totalFee: 95000,
            paidFee: 0,
            pendingFee: 95000,
            dueDate: `15 July ${newYearLabel.slice(0, 4)}`,
            currentInstallmentTitle: `Term 1 Academic Session ${newYearLabel}`,
            currentInstallmentNo: 1,
            totalInstallments: 3,
            installmentAmount: 35000,
            breakdown: [
              { label: 'Annual Faculty Lectures & Mentorship', amount: 80000 },
              { label: 'CBT Test Series & Digital Practice Materials', amount: 10000 },
              { label: 'Magnet Mall AC Study Hall Pass', amount: 5000 },
            ],
            pastReceipts: [],
          };
          newFeeRecords.push(newFee);
          try {
            await setDoc(doc(db, 'fee_records', newFeeId), newFee);
          } catch (e) {
            console.warn('Rollover fee create:', e);
          }
        }
      }
      setFeeRecords((prev) => [...newFeeRecords, ...prev]);
    }

    try {
      await setDoc(doc(db, 'academic_years', newYearLabel), {
        label: newYearLabel,
        startedAt: new Date().toISOString(),
        startedBy: effectiveEmail || 'Admin',
        status: 'current',
      });
    } catch (e) {
      console.warn('Academic year doc:', e);
    }

    showToast(`Academic Year ${newYearLabel} started! Rollover completed successfully.`, 'success');
  };

  const addBatch = async (batch: Batch) => {
    setBatches((prev) => [...prev, batch]);
    try {
      await setDoc(doc(db, 'batches', batch.id), batch);
    } catch (err) {
      console.warn('Add batch note:', err);
    }
  };

  const updateFeeRecord = async (studentId: string, updates: Partial<FeeRecord>) => {
    setFeeRecords((prev) =>
      prev.map((f) => (f.studentId === studentId ? { ...f, ...updates } : f))
    );
    try {
      await setDoc(doc(db, 'fee_records', studentId), updates, { merge: true });
    } catch (err) {
      console.warn('Update fee note:', err);
    }
  };

  const recordPayment = async (studentId: string, amount: number, mode = 'UPI / Instant Gateway'): Promise<FeeReceipt> => {
    const receiptNo = `BSC-UPI-${Date.now().toString().slice(-6)}`;
    const newReceipt: FeeReceipt = {
      receiptNo,
      amount,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      mode,
      title: 'Term 2 Academic & Mock Test Series',
      status: 'PAID',
      transactionRef: `UPI/NPCI/HDFC/${Math.floor(100000000 + Math.random() * 900000000)}`,
      academicYear: currentAcademicYear,
    };

    setFeeRecords((prev) =>
      prev.map((f) => {
        if (f.studentId === studentId) {
          const newPaid = f.paidFee + amount;
          const newPending = Math.max(0, f.totalFee - newPaid);
          return {
            ...f,
            paidFee: newPaid,
            pendingFee: newPending,
            pastReceipts: [newReceipt, ...f.pastReceipts],
          };
        }
        return f;
      })
    );

    try {
      const target = feeRecords.find((f) => f.studentId === studentId);
      if (target) {
        const newPaid = target.paidFee + amount;
        const newPending = Math.max(0, target.totalFee - newPaid);
        await setDoc(
          doc(db, 'fee_records', studentId),
          {
            paidFee: newPaid,
            pendingFee: newPending,
            pastReceipts: [newReceipt, ...target.pastReceipts],
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn('Record payment note:', err);
    }

    return newReceipt;
  };

  const addTestResult = async (result: Omit<TestResult, 'id'>) => {
    const studentEmail = result.studentEmail ? result.studentEmail.trim().toLowerCase() : '';
    const studentRoll = result.studentRoll ? result.studentRoll.trim().toUpperCase() : '';
    const normName = (result.studentName || '')
      .toLowerCase()
      .replace(/^student\s+/i, '')
      .replace(/[^a-z0-9]/g, '');
    const normTitle = (result.testTitle || '').trim().toLowerCase();

    // Check if an existing test result already exists for this test title & student
    const existingIndex = testResults.findIndex((r) => {
      const rTitle = (r.testTitle || '').trim().toLowerCase();
      if (rTitle !== normTitle) return false;
      const rEmail = r.studentEmail ? r.studentEmail.trim().toLowerCase() : '';
      const rRoll = r.studentRoll ? r.studentRoll.trim().toUpperCase() : '';
      const rName = (r.studentName || '')
        .toLowerCase()
        .replace(/^student\s+/i, '')
        .replace(/[^a-z0-9]/g, '');

      return (
        r.studentId === result.studentId ||
        (studentEmail && rEmail === studentEmail) ||
        (studentRoll && rRoll === studentRoll) ||
        (normName && normName.length > 3 && rName === normName)
      );
    });

    if (existingIndex >= 0) {
      const targetId = testResults[existingIndex].id;
      const updated: TestResult = {
        ...testResults[existingIndex],
        ...result,
        id: targetId,
        academicYear: result.academicYear || currentAcademicYear,
      };
      setTestResults((prev) =>
        deduplicateTestResults(prev.map((item, idx) => (idx === existingIndex ? updated : item)))
      );
      try {
        await setDoc(doc(db, 'test_results', targetId), updated, { merge: true });
      } catch (err) {
        console.warn('Update test note:', err);
      }
      return;
    }

    const safeTitle = normTitle.replace(/[^a-z0-9]/g, '_');
    const safeStudentKey = (studentEmail || studentRoll || result.studentId).replace(/[^a-z0-9]/g, '_');
    const id = `test-${safeStudentKey}-${safeTitle}`;

    const newResult: TestResult = {
      ...result,
      id,
      academicYear: result.academicYear || currentAcademicYear,
    };
    setTestResults((prev) => deduplicateTestResults([newResult, ...prev]));
    try {
      await setDoc(doc(db, 'test_results', id), newResult);
    } catch (err) {
      console.warn('Add test note:', err);
    }
  };

  const uploadLecture = async (lectureData: {
    title: string;
    subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';
    chapter: string;
    batchId: string;
    videoUrl: string;
    videoFileName?: string;
    fileSize?: string;
    duration?: string;
    teacherName?: string;
    notesUrl?: string;
    appOnly?: boolean;
  }) => {
    if (lectureSettings.teacherUploadOnly && !isTeacher) {
      showToast('Permission denied: In-app lecture uploads are restricted to verified faculty.', 'error');
      return;
    }

    const id = `lec-${Date.now()}`;
    const batchObj = batches.find((b) => b.id === lectureData.batchId);

    const newLecture: Lecture = {
      id,
      title: lectureData.title,
      subject: lectureData.subject,
      chapter: lectureData.chapter,
      batchId: lectureData.batchId,
      batchName: batchObj?.name || 'All Batches',
      academicYear: currentAcademicYear,
      videoUrl: lectureData.videoUrl,
      videoFileName: lectureData.videoFileName || 'Class_Lecture_Video.mp4',
      fileSize: lectureData.fileSize || '320 MB',
      duration: lectureData.duration || '45 mins',
      teacherName: lectureData.teacherName || 'Faculty Team',
      dateAdded: new Date().toISOString().split('T')[0],
      notesUrl: lectureData.notesUrl,
      source: 'class_upload',
      appOnly: lectureData.appOnly !== undefined ? lectureData.appOnly : true,
    };

    setLectures((prev) => [newLecture, ...prev]);
    showToast('Class lecture published directly to the app!', 'success');
    try {
      await setDoc(doc(db, 'lectures', id), newLecture);
    } catch (err) {
      console.warn('Upload lecture note:', err);
    }
  };

  const deleteLecture = async (id: string) => {
    if (lectureSettings.teacherUploadOnly && !isTeacher) {
      showToast('Permission denied: Only faculty can remove lectures.', 'error');
      return;
    }
    setLectures((prev) => prev.filter((l) => l.id !== id));
    showToast('Class lecture removed from app.', 'info');
    try {
      await deleteDoc(doc(db, 'lectures', id));
    } catch (err) {
      console.warn('Delete lecture note:', err);
    }
  };

  const addTimetableSlot = async (slot: Omit<TimetableSlot, 'id'>) => {
    const id = `tt-${Date.now()}`;
    const newSlot: TimetableSlot = {
      ...slot,
      id,
      academicYear: slot.academicYear || currentAcademicYear,
    };
    setTimetable((prev) => [...prev, newSlot]);
    try {
      await setDoc(doc(db, 'timetables', id), newSlot);
    } catch (err) {
      console.warn('Add timetable slot note:', err);
    }
  };

  const postNotice = async (notice: Omit<Notice, 'id'>) => {
    const id = `notice-${Date.now()}`;
    const newNotice: Notice = {
      ...notice,
      id,
      academicYear: notice.academicYear || currentAcademicYear,
    };
    setNotices((prev) => [newNotice, ...prev]);
    try {
      await setDoc(doc(db, 'notices', id), newNotice);
    } catch (err) {
      console.warn('Post notice note:', err);
    }
  };

  const deleteTimetableSlot = async (slotId: string): Promise<void> => {
    setTimetable((prev) => prev.filter((s) => s.id !== slotId));
    try {
      await deleteDoc(doc(db, 'timetables', slotId));
      showToast('Timetable slot removed successfully.', 'info');
    } catch (err) {
      console.warn('Delete timetable slot note:', err);
    }
  };

  const deleteNotice = async (noticeId: string): Promise<void> => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    try {
      await deleteDoc(doc(db, 'notices', noticeId));
      showToast('Announcement notice removed.', 'info');
    } catch (err) {
      console.warn('Delete notice note:', err);
    }
  };

  const addLectureNote = async (data: {
    lectureId: string;
    lectureTitle: string;
    subject: string;
    timestampSeconds: number;
    timestampFormatted: string;
    text: string;
  }): Promise<LectureNote> => {
    const sId = activeStudent?.id || 'student-aryan-042';
    const sEmail = activeStudent?.email || effectiveEmail || 'aryan.jee@gmail.com';
    const sName = activeStudent?.name || user?.displayName || 'Aryan Deshmukh';

    const newNote: LectureNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lectureId: data.lectureId,
      lectureTitle: data.lectureTitle,
      subject: data.subject,
      studentId: sId,
      studentEmail: sEmail,
      studentName: sName,
      timestampSeconds: data.timestampSeconds,
      timestampFormatted: data.timestampFormatted,
      text: data.text.trim(),
      createdAt: new Date().toISOString(),
    };

    setStudentNotes((prev) => [newNote, ...prev]);
    showToast('Timestamped note saved to your profile!', 'success');
    return newNote;
  };

  const deleteLectureNote = async (noteId: string) => {
    setStudentNotes((prev) => prev.filter((n) => n.id !== noteId));
    showToast('Lecture note removed.', 'info');
  };

  const updateLectureNote = async (noteId: string, newText: string) => {
    setStudentNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, text: newText.trim() } : n))
    );
    showToast('Lecture note updated!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        user,
        simulatedUserEmail,
        authLoading,
        isLoggedIn,
        role,
        setManualRole,
        isTeacher,
        isSuperAdmin,
        isFaculty,
        superAdminEmail,
        superAdminProfile,
        updateSuperAdminProfile,
        authError,
        setAuthError,
        selectedLoginCategory,
        setSelectedLoginCategory,
        loginWithEmailAndCategory,
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
        activeTab,
        setActiveTab,
        activeStudent,
        setActiveStudent,
        currentAcademicYear,
        selectedAcademicYear,
        setSelectedAcademicYear,
        availableAcademicYears,
        students,
        batches,
        feeRecords,
        testResults,
        lectures,
        timetable,
        notices,
        approvedTeachers,
        currentStudentFee,
        currentStudentResults,
        currentStudentLectures,
        currentStudentTimetable,
        currentStudentNotices,
        studentNotes: currentStudentNotes,
        addLectureNote,
        deleteLectureNote,
        updateLectureNote,
        targetLectureToPlay,
        setTargetLectureToPlay,
        signInWithGoogle,
        saveStudentOnboarding,
        saveTeacherOnboarding,
        checkUserHasCompletedProfile,
        simulateGoogleLogin,
        simulateOtpLogin,
        logout,
        addTeacher,
        removeTeacher,
        addStudent,
        bulkAddStudents,
        updateStudent,
        deleteStudent,
        toggleStudentStatus,
        cleanDuplicateStudents,
        startNewYear,
        addBatch,
        updateFeeRecord,
        addTestResult,
        uploadLecture,
        deleteLecture,
        addTimetableSlot,
        deleteTimetableSlot,
        postNotice,
        deleteNotice,
        recordPayment,
        lectureSettings,
        updateLectureSettings,
        toast,
        showToast,
        isDataLoading,
        refreshData,
      }}
    >
      {children}

      {/* Floating In-App Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-[90%] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 p-3 rounded-2xl shadow-xl text-xs font-bold border backdrop-blur-md pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-[#002113]/90 text-[#6FFBBE] border-[#00A472]/40'
                : toast.type === 'error'
                ? 'bg-[#3A0B0B]/90 text-[#FFB4AB] border-[#BA1A1A]/40'
                : 'bg-[#00142F]/90 text-[#EAEDFF] border-[#FEA619]/40'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#00A472] flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#FFB4AB] flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#FEA619] flex-shrink-0" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 rounded-full hover:bg-white/10 text-white/70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
