'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useApp, deduplicateStudents, deduplicateTestResults } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { Lecture, Student, Batch, StudentPromotionAction } from '@/lib/types';
import {
  Users,
  Video,
  FileSpreadsheet,
  Calendar,
  Plus,
  Edit2,
  Check,
  Award,
  CreditCard,
  Bell,
  Trash2,
  ShieldCheck,
  PlayCircle,
  GraduationCap,
  UploadCloud,
  FileVideo,
  Film,
  Eye,
  CheckCircle2,
  X,
  FileText,
  Lock,
  Settings,
  AlertTriangle,
  Sparkles,
  Search,
  Filter,
  UserCheck,
  UserX,
  RotateCcw,
  History,
  Crown,
  UserPlus,
  Trash,
  HelpCircle,
  Upload,
  FolderOpen,
  Edit3,
  Camera,
  Activity,
  TrendingUp,
  Clock,
  Share2,
  Copy,
  MessageCircle,
  CheckSquare,
} from 'lucide-react';
import { TeacherHubSkeleton } from '@/components/skeletons/TeacherHubSkeleton';

export interface TeacherHubScreenProps {
  initialTab?: 'students' | 'marks_fees' | 'lectures' | 'timetable_notices' | 'super_admin';
}

export const TeacherHubScreen: React.FC<TeacherHubScreenProps> = ({
  initialTab = 'students',
}) => {
  const {
    language,
    students,
    batches,
    feeRecords,
    testResults,
    lectures,
    timetable,
    notices,
    approvedTeachers,
    isSuperAdmin,
    isTeacher,
    superAdminProfile,
    updateSuperAdminProfile,
    currentAcademicYear,
    availableAcademicYears,
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
    addTeacher,
    removeTeacher,
    lectureSettings,
    updateLectureSettings,
    showToast,
    isDataLoading,
  } = useApp();

  const t = translations[language];

  const [activeTeacherTab, setActiveTeacherTab] = useState<
    'students' | 'marks_fees' | 'lectures' | 'timetable_notices' | 'super_admin'
  >(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

  if (prevInitialTab !== initialTab) {
    setPrevInitialTab(initialTab);
    setActiveTeacherTab(initialTab);
  }

  // Daily Hub & Attendance State
  const [selectedDailyBatch, setSelectedDailyBatch] = useState<string>(batches[0]?.id || 'jee-2025-a');
  const [selectedDailyWeekday, setSelectedDailyWeekday] = useState<string>(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    return todayName === 'Sunday' ? 'Saturday' : todayName;
  });

  const [dailyAttendance, setDailyAttendance] = useState<{ [id: string]: boolean }>(() => {
    if (typeof window !== 'undefined') {
      const todayKey = `bsc_daily_attendance_${new Date().toISOString().split('T')[0]}`;
      const saved = localStorage.getItem(todayKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Attendance load:', e);
        }
      }
    }
    const initial: { [id: string]: boolean } = {};
    students.forEach((s) => {
      initial[s.id] = s.status === 'active';
    });
    return initial;
  });

  const toggleStudentAttendance = (studentId: string) => {
    setDailyAttendance((prev) => {
      const next = { ...prev, [studentId]: !prev[studentId] };
      if (typeof window !== 'undefined') {
        const todayKey = `bsc_daily_attendance_${new Date().toISOString().split('T')[0]}`;
        localStorage.setItem(todayKey, JSON.stringify(next));
      }
      return next;
    });
  };

  const markAllBatchPresent = (batchId: string) => {
    setDailyAttendance((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (s.batchId === batchId && s.status === 'active') {
          next[s.id] = true;
        }
      });
      if (typeof window !== 'undefined') {
        const todayKey = `bsc_daily_attendance_${new Date().toISOString().split('T')[0]}`;
        localStorage.setItem(todayKey, JSON.stringify(next));
      }
      return next;
    });
    showToast('Marked all students in this batch as Present!', 'success');
  };

  const handleCopyDailyBriefing = () => {
    const todayFormatted = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const activeStudentsCount = students.filter((s) => s.status === 'active').length;
    const presentCount = Object.values(dailyAttendance).filter(Boolean).length;
    const attPct = activeStudentsCount > 0 ? Math.round((presentCount / activeStudentsCount) * 100) : 100;

    const topToppers = [...testResults]
      .sort((a, b) => b.totalMarks - a.totalMarks)
      .slice(0, 3)
      .map((r, i) => `  ${i + 1}. ${r.studentName} (${r.totalMarks}/${r.maxMarks} - ${r.percentile}%ile)`)
      .join('\n');

    const briefingText =
      `📋 *BHAVANI SCIENCE CLASSES - DAILY OPERATIONS REPORT*\n` +
      `📅 *Date:* ${todayFormatted}\n` +
      `📍 *Center:* Magnet Mall 3rd Floor, Virar (W)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👥 *Student Attendance:* ${presentCount}/${activeStudentsCount} Active Present (${attPct}%)\n` +
      `📹 *Total Video Lectures Uploaded:* ${lectures.length} Modules\n` +
      `🕒 *Schedule & Classes:* Sessions running on schedule\n\n` +
      `🏆 *Recent Test Top Performers:*\n${topToppers || '  All tests verified'}\n\n` +
      `📢 *Director Desk:* Virar West preparation hub is operational. Doubt solving desks open until 08:30 PM.`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(briefingText);
      showToast('Daily operations briefing copied to clipboard!', 'success');
    }
  };

  const handleShareWhatsAppBriefing = () => {
    const todayFormatted = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const activeStudentsCount = students.filter((s) => s.status === 'active').length;
    const presentCount = Object.values(dailyAttendance).filter(Boolean).length;
    const attPct = activeStudentsCount > 0 ? Math.round((presentCount / activeStudentsCount) * 100) : 100;

    const text = encodeURIComponent(
      `📋 *BHAVANI SCIENCE CLASSES - DAILY REPORT*\n` +
      `📅 ${todayFormatted} | Virar West\n` +
      `👥 Attendance: ${presentCount}/${activeStudentsCount} (${attPct}%)\n` +
      `📹 Video Modules: ${lectures.length}\n` +
      `🏆 Test Ranks Verified`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Search & Filter state for students
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBulkCsvModal, setShowBulkCsvModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [selectedStudentToEdit, setSelectedStudentToEdit] = useState<Student | null>(null);

  const [showStartNewYearModal, setShowStartNewYearModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showAddMarksModal, setShowAddMarksModal] = useState(false);
  const [showUpdateFeeModal, setShowUpdateFeeModal] = useState(false);
  const [showUploadLectureModal, setShowUploadLectureModal] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState<Lecture | null>(null);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showPostNoticeModal, setShowPostNoticeModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [timetableBatchFilter, setTimetableBatchFilter] = useState<string>(batches[0]?.id || 'jee-2025-a');
  const [timetableDayFilter, setTimetableDayFilter] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');

  // Form Inputs: Single Student
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    rollNo: '',
    phone: '',
    batchId: batches[0]?.id || 'jee-2025-a',
    class: 'Class 12',
    academicYear: currentAcademicYear,
    parentName: '',
    parentPhone: '',
    status: 'active' as const,
  });

  // Form Inputs: Edit Student
  const [editStudentForm, setEditStudentForm] = useState({
    id: '',
    name: '',
    email: '',
    batchId: '',
    class: 'Class 12',
    academicYear: '',
    status: 'active' as 'active' | 'inactive',
    phone: '',
    parentName: '',
  });

  // Form Inputs: Add Teacher
  const [newTeacherForm, setNewTeacherForm] = useState({
    email: '',
    name: '',
    subject: 'Physics',
    phone: '',
  });

  // Form Inputs: Start New Year Wizard
  const [newYearLabelInput, setNewYearLabelInput] = useState('2026-27');
  const [resetFeesOnRollover, setResetFeesOnRollover] = useState(true);
  const [promotionDecisions, setPromotionDecisions] = useState<{
    [studentId: string]: {
      action: 'promote' | 'keep' | 'leave';
      targetBatchId: string;
      targetClass: string;
    };
  }>({});

  // Form Inputs: Bulk CSV Upload
  const [rawCsvText, setRawCsvText] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [csvParseResult, setCsvParseResult] = useState<{
    errors: { row: number; reason: string; data: string }[];
    valid: Omit<Student, 'id'>[];
  } | null>(null);

  // Form Inputs: Batch, Marks, Fees, Lecture, Slot, Notice
  const [newBatch, setNewBatch] = useState({
    id: '',
    name: '',
    stream: 'JEE' as const,
    academicYear: currentAcademicYear,
    timing: '07:30 AM - 01:15 PM',
    room: 'Hall 3A, Magnet Mall',
  });

  const [newMarks, setNewMarks] = useState({
    studentId: students[0]?.id || '',
    testTitle: '',
    date: new Date().toISOString().split('T')[0],
    physics: 85,
    chemistry: 80,
    maths: 82,
    percentile: 98.2,
    rank: 3,
    totalStudents: 48,
    remarks: '',
  });

  const [feeEdit, setFeeEdit] = useState({
    studentId: students[0]?.id || '',
    totalFee: 95000,
    paidFee: 50000,
    pendingFee: 45000,
    dueDate: '20 May 2025',
    installmentAmount: 15000,
    currentInstallmentTitle: 'Term 2 Academic & Mock Test Series',
  });

  const [newLecture, setNewLecture] = useState<{
    title: string;
    subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';
    chapter: string;
    batchId: string;
    videoUrl: string;
    videoFileName: string;
    fileSize: string;
    duration: string;
    teacherName: string;
    notesUrl: string;
    appOnly: boolean;
  }>({
    title: '',
    subject: 'Physics',
    chapter: '',
    batchId: 'jee-2025-a',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoFileName: 'BSC_PHY_RayOptics_L04.mp4',
    fileSize: '124 MB',
    duration: '48 mins',
    teacherName: 'Prof. A. R. Deshmukh',
    notesUrl: '',
    appOnly: true,
  });

  const [previewingLecture, setPreviewingLecture] = useState<Lecture | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(100);

  // Super Admin Profile State & Edit Modal
  const [showEditSuperAdminModal, setShowEditSuperAdminModal] = useState(false);
  const [adminProfileForm, setAdminProfileForm] = useState(superAdminProfile);

  // Lecture Upload Mode: File / Local Device, YouTube Link, Class Archive
  const [teacherUploadMode, setTeacherUploadMode] = useState<'local_device' | 'youtube' | 'class_archive'>('local_device');
  const teacherFileInputRef = useRef<HTMLInputElement>(null);
  const teacherCameraInputRef = useRef<HTMLInputElement>(null);
  const [teacherSelectedLocalFile, setTeacherSelectedLocalFile] = useState<{
    name: string;
    size: string;
    previewUrl: string;
  } | null>(null);

  const handleTeacherLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const previewUrl = URL.createObjectURL(file);

    setTeacherSelectedLocalFile({
      name: file.name,
      size: sizeInMb,
      previewUrl,
    });

    const cleanTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    setNewLecture((prev) => ({
      ...prev,
      title: prev.title ? prev.title : cleanTitle,
      videoFileName: file.name,
      fileSize: sizeInMb,
      videoUrl: previewUrl,
    }));

    showToast(`Video selected from device: ${file.name} (${sizeInMb})`, 'info');
  };

  const [newSlot, setNewSlot] = useState<{
    batchId: string;
    dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    time: string;
    subject: string;
    topic: string;
    teacher: string;
    room: string;
  }>({
    batchId: batches[0]?.id || 'jee-2025-a',
    dayOfWeek: 'Monday',
    time: '07:30 AM - 09:15 AM',
    subject: 'Physics',
    topic: '',
    teacher: 'Prof. A. R. Deshmukh',
    room: 'Hall 3A',
  });

  const [newNotice, setNewNotice] = useState<{
    title: string;
    content: string;
    type: 'holiday' | 'exam_alert' | 'general' | 'schedule_change';
    batchId: string;
    academicYear: string;
    date: string;
    isHoliday: boolean;
    holidayDates?: string;
    priority: 'high' | 'normal';
    postedBy: string;
  }>({
    title: '',
    content: '',
    type: 'general',
    batchId: 'all',
    academicYear: currentAcademicYear,
    date: new Date().toISOString().split('T')[0],
    isHoliday: false,
    holidayDates: '',
    priority: 'normal',
    postedBy: 'Academic Director Desk',
  });

  // Strictly deduplicated canonical lists
  const deduplicatedStudentsList = useMemo(() => deduplicateStudents(students), [students]);
  const deduplicatedMarksList = useMemo(() => deduplicateTestResults(testResults), [testResults]);

  // Filtered Students List based on search, batch, year, and status
  const filteredStudents = useMemo(() => {
    return deduplicatedStudentsList.filter((s) => {
      // Search
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesRoll = s.rollNo.toLowerCase().includes(q);
        const matchesPhone = s.phone.includes(q);
        if (!matchesName && !matchesEmail && !matchesRoll && !matchesPhone) return false;
      }
      // Batch
      if (selectedBatchFilter !== 'all' && s.batchId !== selectedBatchFilter) {
        return false;
      }
      // Year
      if (selectedYearFilter !== 'all' && s.academicYear !== selectedYearFilter) {
        return false;
      }
      // Status
      if (selectedStatusFilter === 'active' && s.status === 'inactive') {
        return false;
      }
      if (selectedStatusFilter === 'inactive' && s.status !== 'inactive') {
        return false;
      }
      return true;
    });
  }, [deduplicatedStudentsList, studentSearch, selectedBatchFilter, selectedYearFilter, selectedStatusFilter]);

  if (isDataLoading) {
    return <TeacherHubSkeleton />;
  }

  // CSV Validation & Parsing
  const handleParseCsv = (text: string) => {
    setRawCsvText(text);
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      setCsvParseResult({
        errors: [{ row: 1, reason: 'CSV must contain at least a header row and 1 data row.', data: text }],
        valid: [],
      });
      return;
    }

    const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const nameIdx = headers.findIndex((h) => h.includes('name'));
    const emailIdx = headers.findIndex((h) => h.includes('email'));
    const batchIdx = headers.findIndex((h) => h.includes('batch'));
    const classIdx = headers.findIndex((h) => h.includes('class'));
    const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('mobile'));

    if (nameIdx === -1 || emailIdx === -1) {
      setCsvParseResult({
        errors: [
          {
            row: 1,
            reason: 'Headers must include "name" and "email" (e.g. name, email, batch, class)',
            data: lines[0],
          },
        ],
        valid: [],
      });
      return;
    }

    const errors: { row: number; reason: string; data: string }[] = [];
    const valid: Omit<Student, 'id'>[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let i = 1; i < lines.length; i++) {
      const rawLine = lines[i];
      const cells = rawLine.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const name = cells[nameIdx] || '';
      const email = cells[emailIdx] || '';
      const batchVal = batchIdx !== -1 ? cells[batchIdx] : '';
      const classVal = classIdx !== -1 ? cells[classIdx] : 'Class 12';
      const phoneVal = phoneIdx !== -1 && cells[phoneIdx] ? cells[phoneIdx] : '9820100000';

      if (!name) {
        errors.push({ row: i + 1, reason: 'Student name is missing.', data: rawLine });
        continue;
      }

      if (!email) {
        errors.push({ row: i + 1, reason: 'Student email is missing.', data: rawLine });
        continue;
      }

      if (!emailRegex.test(email)) {
        errors.push({
          row: i + 1,
          reason: `Invalid email address format "${email}" (must be a valid email like user@domain.com)`,
          data: rawLine,
        });
        continue;
      }

      // Check duplicates with existing students
      const isDuplicate = students.some((s) => s.email.toLowerCase() === email.toLowerCase());
      if (isDuplicate) {
        errors.push({
          row: i + 1,
          reason: `Email "${email}" is already enrolled in the system.`,
          data: rawLine,
        });
        continue;
      }

      // Batch matching
      const targetBatch =
        batches.find(
          (b) =>
            b.id.toLowerCase() === batchVal.toLowerCase() ||
            b.name.toLowerCase().includes(batchVal.toLowerCase())
        ) || batches[0];

      valid.push({
        name,
        email: email.toLowerCase(),
        batch: targetBatch?.name || 'Class 12 JEE Elite',
        batchId: targetBatch?.id || 'jee-2025-a',
        batchName: targetBatch?.name || '12th JEE Main & Advanced - Elite',
        class: classVal || 'Class 12',
        academicYear: currentAcademicYear,
        status: 'active',
        active: true,
        parentName: 'Parent / Guardian',
        phone: phoneVal,
        rollNo: `BSC-${currentAcademicYear.slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
        admissionDate: new Date().toISOString().split('T')[0],
      });
    }

    setCsvParseResult({ errors, valid });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        handleParseCsv(content);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteCsvImport = async () => {
    if (!csvParseResult || csvParseResult.valid.length === 0) return;
    const res = await bulkAddStudents(csvParseResult.valid);
    setShowBulkCsvModal(false);
    setCsvParseResult(null);
    setRawCsvText('');
    setCsvFileName('');
    showToast(`Bulk upload completed! ${res.added} students enrolled successfully.`, 'success');
  };

  // Handlers for single student creation
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.email.includes('@')) {
      showToast('Please enter a valid Google email address.', 'error');
      return;
    }
    const batchObj = batches.find((b) => b.id === newStudent.batchId);
    await addStudent({
      ...newStudent,
      rollNo: newStudent.rollNo || `BSC-${newStudent.academicYear.slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
      batch: batchObj?.name || 'Class 12',
      batchName: batchObj?.name || 'Class 12',
      admissionDate: new Date().toISOString().split('T')[0],
      active: true,
    });
    setShowAddStudentModal(false);
    setNewStudent({
      name: '',
      email: '',
      rollNo: '',
      phone: '',
      batchId: batches[0]?.id || 'jee-2025-a',
      class: 'Class 12',
      academicYear: currentAcademicYear,
      parentName: '',
      parentPhone: '',
      status: 'active',
    });
    showToast('Student enrolled successfully in Bhavani Science Classes!', 'success');
  };

  // Handler for editing an existing student (change batch, mark inactive)
  const handleSaveEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentToEdit) return;

    const batchObj = batches.find((b) => b.id === editStudentForm.batchId);
    await updateStudent(selectedStudentToEdit.id, {
      batchId: editStudentForm.batchId,
      batchName: batchObj?.name || selectedStudentToEdit.batchName,
      batch: batchObj?.name || selectedStudentToEdit.batch,
      class: editStudentForm.class,
      phone: editStudentForm.phone,
      parentName: editStudentForm.parentName,
      status: editStudentForm.status,
      active: editStudentForm.status === 'active',
    });

    setShowEditStudentModal(false);
    setSelectedStudentToEdit(null);
    showToast('Student record updated successfully!', 'success');
  };

  // Initialize rollover promotion decisions when opening rollover modal
  const openStartNewYearModal = () => {
    const decisions: {
      [studentId: string]: {
        action: 'promote' | 'keep' | 'leave';
        targetBatchId: string;
        targetClass: string;
      };
    } = {};

    students.forEach((st) => {
      // By default, if Class 11 -> promote to Class 12; if Class 12 -> keep or graduate
      if (st.class === 'Class 11') {
        const nextBatch = batches.find((b) => b.stream === 'JEE') || batches[0];
        decisions[st.id] = {
          action: 'promote',
          targetBatchId: nextBatch?.id || 'jee-2025-a',
          targetClass: 'Class 12',
        };
      } else {
        decisions[st.id] = {
          action: 'leave', // Graduating Class 12 students default to leavers
          targetBatchId: st.batchId,
          targetClass: 'Class 12 Passed',
        };
      }
    });

    setPromotionDecisions(decisions);
    setShowStartNewYearModal(true);
  };

  const handleExecuteRollover = async () => {
    const actions: StudentPromotionAction[] = Object.keys(promotionDecisions).map((studentId) => {
      const dec = promotionDecisions[studentId];
      const st = students.find((s) => s.id === studentId);
      return {
        studentId,
        studentName: st?.name || 'Student',
        currentBatchId: st?.batchId || 'jee-2025-a',
        action: dec.action,
        targetBatchId: dec.targetBatchId,
        targetClass: dec.targetClass,
      };
    });

    await startNewYear(newYearLabelInput, actions, resetFeesOnRollover);
    setShowStartNewYearModal(false);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBatch({
      ...newBatch,
      id: newBatch.id || `batch-${Date.now()}`,
    });
    setShowAddBatchModal(false);
    showToast('Batch created successfully!', 'success');
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = deduplicatedStudentsList.find((s) => s.id === newMarks.studentId) || deduplicatedStudentsList[0];
    if (!student) {
      showToast('No student available to assign marks to.', 'error');
      return;
    }

    const totalMarks = Number(newMarks.physics) + Number(newMarks.chemistry) + Number(newMarks.maths);
    await addTestResult({
      studentId: student.id,
      studentName: student.name,
      studentRoll: student.rollNo,
      studentEmail: student.email,
      batchId: student.batchId,
      academicYear: currentAcademicYear,
      testTitle: newMarks.testTitle,
      date: newMarks.date,
      totalMarks,
      maxMarks: 300,
      percentile: Number(newMarks.percentile),
      rank: Number(newMarks.rank),
      totalStudents: Number(newMarks.totalStudents),
      subjects: [
        { name: 'Physics', marks: Number(newMarks.physics), max: 100 },
        { name: 'Chemistry', marks: Number(newMarks.chemistry), max: 100 },
        { name: 'Mathematics', marks: Number(newMarks.maths), max: 100 },
      ],
      remarks: newMarks.remarks,
    });
    setShowAddMarksModal(false);
    showToast('Marks and percentile recorded successfully!', 'success');
  };

  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateFeeRecord(feeEdit.studentId, {
      totalFee: Number(feeEdit.totalFee),
      paidFee: Number(feeEdit.paidFee),
      pendingFee: Number(feeEdit.pendingFee),
      dueDate: feeEdit.dueDate,
      installmentAmount: Number(feeEdit.installmentAmount),
      currentInstallmentTitle: feeEdit.currentInstallmentTitle,
    });
    setShowUpdateFeeModal(false);
    showToast('Fee ledger updated successfully!', 'success');
  };

  const handleUploadLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherUploadMode === 'local_device' && !teacherSelectedLocalFile && !newLecture.videoUrl) {
      teacherFileInputRef.current?.click();
      showToast('Please pickup a video file from your local device first.', 'info');
      return;
    }
    if (!newLecture.videoUrl) {
      showToast('Please pickup a video file or enter a valid URL.', 'error');
      return;
    }
    setIsUploading(true);
    setUploadProgress(25);

    const step1 = setTimeout(() => setUploadProgress(70), 250);

    setTimeout(async () => {
      clearTimeout(step1);
      setUploadProgress(100);
      await uploadLecture(newLecture);
      setIsUploading(false);
      setShowUploadLectureModal(false);
      setTeacherSelectedLocalFile(null);
      setNewLecture({
        title: '',
        subject: 'Physics',
        chapter: '',
        batchId: batches[0]?.id || 'jee-2025-a',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        videoFileName: 'BSC_PHY_RayOptics_L04.mp4',
        fileSize: '124 MB',
        duration: '48 mins',
        teacherName: 'Prof. A. R. Deshmukh',
        notesUrl: '',
        appOnly: true,
      });
      showToast('Class video uploaded! Restricted to app player only.', 'success');
    }, 600);
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTimetableSlot(newSlot);
    setShowAddSlotModal(false);
    showToast('Timetable slot added successfully!', 'success');
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    await postNotice({
      ...newNotice,
      academicYear: currentAcademicYear,
    });
    setShowPostNoticeModal(false);
    showToast('Notice broadcasted to batch students!', 'success');
  };

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherForm.email.includes('@')) {
      showToast('Please provide a valid teacher email.', 'error');
      return;
    }
    await addTeacher(newTeacherForm);
    setShowAddTeacherModal(false);
    setNewTeacherForm({ email: '', name: '', subject: 'Physics', phone: '' });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Header with Class Logo */}
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
              Faculty Portal
            </h2>
            <span className="text-[11px] text-[#79685E] dark:text-[#C5B7A8] font-bold block">
              Session {currentAcademicYear} • Student Roster &amp; Administration
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] text-[10px] font-black uppercase tracking-wider shadow-xs border border-[#F8CF72]/40">
            Teacher
          </span>
        </div>
      </div>

      {/* Faculty Academic Navigation Bar */}
      <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] p-1.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={() => setActiveTeacherTab('students')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all flex-shrink-0 text-xs ${
              activeTeacherTab === 'students'
                ? 'bg-gradient-to-r from-[#85152F] to-[#B9193F] text-white font-bold shadow-[0_3px_10px_rgba(133,21,47,0.35)]'
                : 'text-[#79685E] dark:text-[#C5B7A8] hover:bg-[#FFF0D0] dark:hover:bg-[#2A1E2E] font-semibold'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTeacherTab('marks_fees')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all flex-shrink-0 text-xs ${
              activeTeacherTab === 'marks_fees'
                ? 'bg-gradient-to-r from-[#85152F] to-[#B9193F] text-white font-bold shadow-[0_3px_10px_rgba(133,21,47,0.35)]'
                : 'text-[#79685E] dark:text-[#C5B7A8] hover:bg-[#FFF0D0] dark:hover:bg-[#2A1E2E] font-semibold'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Marks &amp; Fees</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTeacherTab('lectures')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all flex-shrink-0 text-xs ${
              activeTeacherTab === 'lectures'
                ? 'bg-gradient-to-r from-[#85152F] to-[#B9193F] text-white font-bold shadow-[0_3px_10px_rgba(133,21,47,0.35)]'
                : 'text-[#79685E] dark:text-[#C5B7A8] hover:bg-[#FFF0D0] dark:hover:bg-[#2A1E2E] font-semibold'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Lectures</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTeacherTab('timetable_notices')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all flex-shrink-0 text-xs ${
              activeTeacherTab === 'timetable_notices'
                ? 'bg-gradient-to-r from-[#85152F] to-[#B9193F] text-white font-bold shadow-[0_3px_10px_rgba(133,21,47,0.35)]'
                : 'text-[#79685E] dark:text-[#C5B7A8] hover:bg-[#FFF0D0] dark:hover:bg-[#2A1E2E] font-semibold'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTeacherTab('super_admin')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all flex-shrink-0 text-xs ${
                activeTeacherTab === 'super_admin'
                  ? 'bg-gradient-to-r from-[#85152F] to-[#B9193F] text-white font-bold shadow-[0_3px_10px_rgba(133,21,47,0.35)]'
                  : 'text-[#79685E] dark:text-[#C5B7A8] hover:bg-[#FFF0D0] dark:hover:bg-[#2A1E2E] font-semibold'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Session &amp; Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: USER MANAGEMENT - Students & Yearly Rollover */}
      {activeTeacherTab === 'students' && (
        <div className="space-y-4">
          {/* Top Actions: Add Student, Bulk CSV, Start New Year */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setShowAddStudentModal(true)}
              className="py-2.5 px-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#85152F] to-[#B9193F] hover:from-[#701026] hover:to-[#9F1334] text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addStudent}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBulkCsvModal(true)}
              className="py-2.5 px-2 rounded-xl text-xs font-bold border-2 border-[#EFCF98] dark:border-[#4A162B] bg-[#FFF0D0] dark:bg-[#2A1E2E] hover:bg-[#FFE6B3] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk CSV</span>
            </button>
            <button
              type="button"
              onClick={openStartNewYearModal}
              className="py-2.5 px-2 rounded-xl text-xs font-bold bg-[#E5A332] hover:bg-[#D49326] text-[#2A1700] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <History className="w-3.5 h-3.5" />
              <span>New Year</span>
            </button>
          </div>

          {/* Search & Filters Card */}
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_6px_20px_rgba(133,21,47,0.06)]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#85152F] dark:text-[#F8CF72] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder={t.searchStudents}
                className="w-full bg-[#FFFDF7] dark:bg-[#241B2E] border border-[#EFCF98] dark:border-[#521927] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs font-bold text-[#2D211D] dark:text-[#FFFDF9] focus:outline-none focus:border-[#85152F]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              {/* Batch Filter */}
              <div>
                <label className="text-[10px] font-bold text-[#79685E] dark:text-[#C5B7A8] block mb-1">Batch</label>
                <select
                  value={selectedBatchFilter}
                  onChange={(e) => setSelectedBatchFilter(e.target.value)}
                  className="w-full bg-[#FFFDF7] dark:bg-[#241B2E] border border-[#EFCF98] dark:border-[#521927] rounded-xl px-2 py-1.5 font-bold text-[#2D211D] dark:text-[#FFFDF9] text-[11px] focus:outline-none"
                >
                  <option value="all" className="dark:bg-[#1A1322]">{t.allBatches}</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id} className="dark:bg-[#1A1322]">
                      {b.stream} - {b.name.split(' - ')[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year Filter */}
              <div>
                <label className="text-[10px] font-bold text-[#79685E] dark:text-[#C5B7A8] block mb-1">Session</label>
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="w-full bg-[#FFFDF7] dark:bg-[#241B2E] border border-[#EFCF98] dark:border-[#521927] rounded-xl px-2 py-1.5 font-bold text-[#2D211D] dark:text-[#FFFDF9] text-[11px] focus:outline-none"
                >
                  <option value="all" className="dark:bg-[#1A1322]">{t.allYears}</option>
                  {availableAcademicYears.map((yr) => (
                    <option key={yr} value={yr} className="dark:bg-[#1A1322]">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[10px] font-bold text-[#79685E] dark:text-[#C5B7A8] block mb-1">Status</label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                  className="w-full bg-[#FFFDF7] dark:bg-[#241B2E] border border-[#EFCF98] dark:border-[#521927] rounded-xl px-2 py-1.5 font-bold text-[#2D211D] dark:text-[#FFFDF9] text-[11px] focus:outline-none"
                >
                  <option value="all" className="dark:bg-[#1A1322]">{t.allStatuses}</option>
                  <option value="active" className="dark:bg-[#1A1322]">Active Only</option>
                  <option value="inactive" className="dark:bg-[#1A1322]">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Batches Overview Card */}
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 sm:p-5 space-y-3 shadow-[0_6px_20px_rgba(133,21,47,0.06)]">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-serif font-black text-sm text-[#5D1025] dark:text-[#F8CF72]">
                  Enrolled Batches ({batches.length})
                </span>
              </div>
              <button
                onClick={() => setShowAddBatchModal(true)}
                className="text-[11px] font-bold text-[#85152F] dark:text-[#F8CF72] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Batch</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {batches.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98]/70 dark:border-[#381F28] shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#FFF0D0] text-[#85152F] font-black text-[10px] border border-[#EFCF98]">
                        {b.stream}
                      </span>
                      <span className="text-[10px] font-mono text-[#79685E] dark:text-[#C5B7A8] font-bold">
                        {b.academicYear}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#2D211D] dark:text-white mt-1">{b.name}</h4>
                    <p className="text-[10px] text-[#79685E] dark:text-[#A8988C]">{b.timing} • {b.room}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#85152F] dark:text-[#F8CF72] bg-[#FFF0D0] dark:bg-[#2B1B2C] px-2.5 py-1 rounded-xl border border-[#EFCF98]/50">
                    {students.filter((s) => s.batchId === b.id && s.status === 'active').length} Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Students Directory List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-[#85152F] dark:text-[#F8CF72] uppercase tracking-wider block">
                Student Records ({filteredStudents.length} of {students.length})
              </span>
              <span className="text-[10px] text-[#79685E] dark:text-[#C5B7A8] font-bold">
                Access Controlled • Real-Time Database
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredStudents.map((s) => {
                const isActive = s.status === 'active' || s.active;
                return (
                  <div
                    key={s.id}
                    className={`p-4 rounded-3xl border-2 shadow-xs space-y-2.5 transition-all ${
                      isActive
                        ? 'bg-[#FFFCF4] dark:bg-[#1A1322] border-[#EFCF98] dark:border-[#4A162B]'
                        : 'bg-[#FAF5E8]/60 dark:bg-[#150F1C] border-[#EFCF98]/40 dark:border-[#331822] opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-serif font-black text-[#5D1025] dark:text-white truncate">{s.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FFF0D0] dark:bg-[#2B1B2C] rounded-lg text-[#85152F] dark:text-[#F8CF72] font-bold border border-[#EFCF98]/60">
                            {s.rollNo}
                          </span>
                          <span
                            className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${
                              isActive
                                ? 'bg-[#25844F]/15 text-[#25844F] border-[#25844F]/30'
                                : 'bg-[#85152F]/15 text-[#85152F] border-[#85152F]/30'
                            }`}
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8] font-medium">
                          {s.class || 'Class 12'} • <strong className="text-[#85152F] dark:text-[#F8CF72]">{s.batchName || s.batch}</strong> ({s.academicYear})
                        </p>
                        <p className="text-[10px] text-[#79685E] dark:text-[#A8988C] font-mono truncate">
                          Google Email: <strong className="text-[#2D211D] dark:text-white">{s.email}</strong>
                        </p>
                        <p className="text-[10px] text-[#79685E] dark:text-[#A8988C]">
                          Mobile: +91 {s.phone} • Parent: {s.parentName} ({s.parentPhone || s.phone})
                        </p>
                      </div>

                      {/* Student Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Edit Student Modal trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentToEdit(s);
                            setEditStudentForm({
                              id: s.id,
                              name: s.name,
                              email: s.email,
                              batchId: s.batchId,
                              class: s.class || 'Class 12',
                              academicYear: s.academicYear || currentAcademicYear,
                              status: s.status || 'active',
                              phone: s.phone,
                              parentName: s.parentName,
                            });
                            setShowEditStudentModal(true);
                          }}
                          className="p-2 rounded-xl bg-[#FFF0D0] dark:bg-[#2A1E2E] text-[#85152F] dark:text-[#F8CF72] hover:bg-[#FFE6B3] transition-all cursor-pointer border border-[#EFCF98]"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Toggle Active / Inactive */}
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(s.id)}
                          className={`p-2 rounded-xl transition-all cursor-pointer border ${
                            isActive
                              ? 'bg-[#FFF0D0] text-[#85152F] border-[#EFCF98] hover:bg-[#FFE6B3]'
                              : 'bg-[#25844F]/15 text-[#25844F] border-[#25844F]/30 hover:bg-[#25844F]/25'
                          }`}
                          title={isActive ? 'Mark Inactive' : 'Mark Active'}
                        >
                          {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>

                        {/* Manage Fee button */}
                        <button
                          onClick={() => {
                            setFeeEdit({
                              studentId: s.id,
                              totalFee: 95000,
                              paidFee: 50000,
                              pendingFee: 45000,
                              dueDate: '20 May 2025',
                              installmentAmount: 15000,
                              currentInstallmentTitle: 'Term 2 Academic & Mock Test Series',
                            });
                            setShowUpdateFeeModal(true);
                          }}
                          className="p-2 rounded-xl bg-[#FFF0D0] dark:bg-[#2A1E2E] text-[#E5A332] dark:text-[#F8CF72] hover:bg-[#FFE6B3] cursor-pointer border border-[#EFCF98]"
                          title="Manage Fees"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>

                        {/* Teacher: Delete Student from Database */}
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(s)}
                            className="p-2 rounded-xl bg-[#85152F]/15 text-[#85152F] dark:text-[#FF8A9E] hover:bg-[#85152F]/25 transition-all cursor-pointer border border-[#85152F]/30"
                            title="Delete Student from Database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Marks & Fees */}
      {activeTeacherTab === 'marks_fees' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (deduplicatedStudentsList.length > 0 && (!newMarks.studentId || !deduplicatedStudentsList.some((s) => s.id === newMarks.studentId))) {
                  setNewMarks((prev) => ({ ...prev, studentId: deduplicatedStudentsList[0].id }));
                }
                setShowAddMarksModal(true);
              }}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#85152F] to-[#B9193F] hover:from-[#701026] hover:to-[#9F1334] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Award className="w-4 h-4 text-[#F8CF72]" />
              <span>{t.enterMarks}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowUpdateFeeModal(true)}
              className="py-2.5 px-3 rounded-2xl bg-[#FFF0D0] dark:bg-[#2A1E2E] border-2 border-[#EFCF98] dark:border-[#4A162B] text-[#85152F] dark:text-[#F8CF72] hover:bg-[#FFE6B3] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <CreditCard className="w-4 h-4 text-[#E5A332]" />
              <span>{t.updateFee}</span>
            </button>
          </div>

          {/* Test Marks Entries */}
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_6px_20px_rgba(133,21,47,0.06)]">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <span className="font-serif font-black text-sm text-[#5D1025] dark:text-[#F8CF72]">
                  Test Marks Records ({deduplicatedMarksList.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => cleanDuplicateStudents()}
                className="text-[11px] text-[#85152F] dark:text-[#F8CF72] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E5A332]" />
                <span>Deduplicate</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {deduplicatedMarksList.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98]/70 dark:border-[#381F28] shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-serif font-black text-[#5D1025] dark:text-white">{r.testTitle}</h4>
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-[#FFF0D0] dark:bg-[#2B1B2C] rounded-md text-[#85152F] dark:text-[#F8CF72] font-bold border border-[#EFCF98]/50">
                          {r.academicYear || '2025-26'}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#79685E] dark:text-[#C5B7A8] font-medium mt-0.5">
                        Student: <strong className="text-[#2D211D] dark:text-white">{r.studentName}</strong> ({r.studentRoll})
                      </p>
                    </div>
                    <span className="font-mono text-xs font-black text-[#85152F] dark:text-[#F8CF72] bg-[#FFF0D0] dark:bg-[#2B1B2C] px-2 py-1 rounded-xl border border-[#EFCF98]/40">
                      {r.totalMarks} / {r.maxMarks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#79685E] dark:text-[#C5B7A8] pt-1.5 border-t border-[#EFCF98]/40 dark:border-[#381F28]">
                    <span>Rank: #{r.rank} of {r.totalStudents}</span>
                    <span>Percentile: <strong className="text-[#85152F] dark:text-[#F8CF72]">{r.percentile}%ile</strong></span>
                    <span>{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Video Lectures Upload & App-Only Setting */}
      {activeTeacherTab === 'lectures' && (
        <div className="space-y-4">
          {/* Lecture App-Only Security Settings Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#5D1025] via-[#480B1C] to-[#2B040E] text-[#FFFDF7] p-5 shadow-[0_10px_28px_rgba(93,16,37,0.25)] border-2 border-[#E5A332]/50 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#F8CF72]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] text-[#85152F] flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-serif font-black tracking-tight text-[#FFFDF7]">
                    {t.lectureSettingsTitle}
                  </h3>
                  <p className="text-[10px] text-[#E8D5C4]">
                    Faculty App-Only Streaming &amp; Anti-Piracy Rules
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#25844F] text-white text-[9px] font-black uppercase tracking-wider shadow-xs border border-white/20">
                Protected
              </span>
            </div>

            {/* Setting 1: Play Exclusively in App Player */}
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#F8CF72]" />
                  <span>{t.appOnlyPlaybackLabel}</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateLectureSettings({
                      appOnlyPlayback: !lectureSettings.appOnlyPlayback,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    lectureSettings.appOnlyPlayback ? 'bg-[#25844F]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      lectureSettings.appOnlyPlayback ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-[#E8D5C4] leading-tight">
                {t.appOnlyPlaybackDesc}
              </p>
            </div>

            {/* Setting 2: Teacher-Only Upload Restriction */}
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#F8CF72]" />
                  <span>{t.teacherUploadOnlyLabel}</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateLectureSettings({
                      teacherUploadOnly: !lectureSettings.teacherUploadOnly,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    lectureSettings.teacherUploadOnly ? 'bg-[#25844F]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      lectureSettings.teacherUploadOnly ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-[#E8D5C4] leading-tight">
                {t.teacherUploadOnlyDesc}
              </p>
            </div>

            {/* Setting 3: Dynamic Anti-Piracy Watermark */}
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F8CF72]" />
                  <span>{t.watermarkLabel}</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateLectureSettings({
                      antiPiracyWatermark: !lectureSettings.antiPiracyWatermark,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    lectureSettings.antiPiracyWatermark ? 'bg-[#25844F]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      lectureSettings.antiPiracyWatermark ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-[#E8D5C4] leading-tight">
                {t.watermarkDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadLectureModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#85152F] to-[#B9193F] hover:from-[#701026] hover:to-[#9F1334] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#F8CF72]" />
            <span>Upload Classroom Video (App-Only Playback)</span>
          </button>

          {/* Published Lectures List */}
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_6px_20px_rgba(133,21,47,0.06)]">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center font-bold">
                  <Video className="w-4 h-4" />
                </div>
                <span className="font-serif font-black text-sm text-[#5D1025] dark:text-[#F8CF72]">
                  Batch Video Modules ({lectures.length})
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#85152F] dark:text-[#F8CF72]">
                YouTube Unlisted Stream
              </span>
            </div>

            <div className="space-y-2.5">
              {lectures.map((lec) => (
                <div
                  key={lec.id}
                  className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98]/70 dark:border-[#381F28] shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#FFF0D0] text-[#85152F] text-[9px] font-black uppercase border border-[#EFCF98]">
                          {lec.subject}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#25844F]/15 text-[#25844F] font-bold text-[9px] flex items-center gap-1 border border-[#25844F]/30">
                          <Lock className="w-2.5 h-2.5" />
                          App-Only Stream
                        </span>
                        <span className="text-[9px] text-[#79685E] dark:text-[#C5B7A8] font-mono">
                          {lec.academicYear}
                        </span>
                      </div>
                      <h4 className="text-xs font-serif font-black text-[#5D1025] dark:text-white mt-1.5">{lec.title}</h4>
                      <p className="text-[10px] text-[#79685E] dark:text-[#C5B7A8] font-medium mt-0.5">
                        Batch: <strong className="text-[#2D211D] dark:text-white">{lec.batchName}</strong> • {lec.fileSize || '320 MB'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => deleteLecture(lec.id)}
                        className="p-2 rounded-xl text-[#85152F] dark:text-[#FF8A9E] hover:bg-[#85152F]/15 transition-colors cursor-pointer"
                        title="Delete Lecture"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Timetable & Notices */}
      {activeTeacherTab === 'timetable_notices' && (
        <div className="space-y-4">
          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddSlotModal(true)}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#85152F] to-[#B9193F] hover:from-[#701026] hover:to-[#9F1334] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Calendar className="w-4 h-4 text-[#F8CF72]" />
              <span>+ Add Class Slot</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPostNoticeModal(true)}
              className="py-2.5 px-3 rounded-2xl bg-[#FFF0D0] dark:bg-[#2A1E2E] border-2 border-[#EFCF98] dark:border-[#4A162B] text-[#85152F] dark:text-[#F8CF72] hover:bg-[#FFE6B3] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Bell className="w-4 h-4 text-[#E5A332]" />
              <span>+ Post Notice</span>
            </button>
          </div>

          {/* TIMETABLE MAKER SECTION */}
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 sm:p-5 space-y-4 shadow-[0_6px_20px_rgba(133,21,47,0.06)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
              <div>
                <h3 className="text-sm font-serif font-black text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#85152F] dark:text-[#F8CF72]" />
                  <span>Timetable Maker for Batches</span>
                </h3>
                <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8]">
                  Manage weekly lecture timings, topics &amp; faculty per batch
                </p>
              </div>

              {/* Batch Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#79685E] dark:text-[#C5B7A8] uppercase tracking-wider">Batch:</span>
                <select
                  value={timetableBatchFilter}
                  onChange={(e) => setTimetableBatchFilter(e.target.value)}
                  className="bg-[#FFFDF7] dark:bg-[#241B2E] border border-[#EFCF98] dark:border-[#521927] rounded-xl px-2.5 py-1 text-xs font-bold text-[#2D211D] dark:text-[#FFFDF9] focus:outline-none"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id} className="dark:bg-[#1A1322]">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Day of Week Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const).map((day) => {
                const isSelected = timetableDayFilter === day;
                const slotCount = timetable.filter(
                  (s) => s.batchId === timetableBatchFilter && s.dayOfWeek === day
                ).length;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setTimetableDayFilter(day)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#85152F] to-[#B9193F] text-white shadow-xs'
                        : 'bg-[#FFF0D0] dark:bg-[#2A1E2E] text-[#79685E] dark:text-[#C5B7A8] hover:bg-[#FFE6B3]'
                    }`}
                  >
                    <span>{day.slice(0, 3)}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#FFFCF4] dark:bg-[#1A1322] text-[#85152F] dark:text-[#F8CF72] border border-[#EFCF98]/50'
                      }`}
                    >
                      {slotCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Timetable Slots for Selected Batch & Day */}
            {/* Timetable Slots for Selected Batch & Day */}
            <div className="space-y-2.5 pt-1">
              {(() => {
                const currentSlots = timetable.filter(
                  (s) => s.batchId === timetableBatchFilter && s.dayOfWeek === timetableDayFilter
                );

                if (currentSlots.length === 0) {
                  return (
                    <div className="p-6 text-center border-2 border-dashed border-[#EFCF98]/70 dark:border-[#381F28] rounded-2xl space-y-2">
                      <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] font-medium">
                        No class slot scheduled on <strong>{timetableDayFilter}</strong> for this batch.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setNewSlot((prev) => ({
                            ...prev,
                            batchId: timetableBatchFilter,
                            dayOfWeek: timetableDayFilter,
                          }));
                          setShowAddSlotModal(true);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-[#FFF0D0] dark:bg-[#2A1E2E] text-[#85152F] dark:text-[#F8CF72] text-xs font-bold hover:bg-[#FFE6B3] transition-colors cursor-pointer inline-flex items-center gap-1 border border-[#EFCF98]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Schedule First Slot</span>
                      </button>
                    </div>
                  );
                }

                return currentSlots.map((slot) => {
                  return (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98]/70 dark:border-[#381F28] flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFF0D0] text-[#85152F] border border-[#EFCF98]">
                            {slot.subject}
                          </span>
                          <span className="text-[11px] font-bold text-[#5D1025] dark:text-[#F8CF72] flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-[#E5A332]" />
                            {slot.time}
                          </span>
                          <span className="text-[10px] text-[#79685E] dark:text-[#C5B7A8] font-medium">
                            • Room: <strong>{slot.room}</strong>
                          </span>
                        </div>

                        <h4 className="text-xs font-serif font-black text-[#2D211D] dark:text-white truncate">
                          {slot.topic || 'Regular Syllabus & Numerical Practice'}
                        </h4>

                        <p className="text-[10px] text-[#79685E] dark:text-[#A8988C]">
                          Faculty: <strong className="text-[#85152F] dark:text-[#F8CF72]">{slot.teacher}</strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteTimetableSlot(slot.id)}
                        className="p-2 rounded-xl text-[#85152F] dark:text-[#FF8A9E] hover:bg-[#85152F]/15 transition-colors cursor-pointer"
                        title="Delete Class Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* ANNOUNCEMENTS & NOTICES HUB */}
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_6px_20px_rgba(133,21,47,0.06)]">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-black text-[#5D1025] dark:text-[#F8CF72]">
                    Broadcasted Notices ({notices.length})
                  </h3>
                  <p className="text-[10px] text-[#79685E] dark:text-[#C5B7A8]">
                    Visible immediately to enrolled students on their dashboard
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPostNoticeModal(true)}
                className="py-1 px-2.5 rounded-xl bg-[#FFF0D0] dark:bg-[#2A1E2E] text-[#85152F] dark:text-[#F8CF72] text-xs font-bold hover:bg-[#FFE6B3] transition-colors cursor-pointer flex items-center gap-1 border border-[#EFCF98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Notice</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {notices.map((n) => {
                const isExam = n.type === 'exam_alert';
                const isHoliday = n.isHoliday || n.type === 'holiday';
                const isUrgent = n.priority === 'high';

                const targetBatchObj = batches.find((b) => b.id === n.batchId);
                const targetBatchLabel = n.batchId === 'all' ? 'All Batches' : targetBatchObj?.name || n.batchId;

                return (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98]/70 dark:border-[#381F28] space-y-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          isExam
                            ? 'bg-[#FFF0EE] text-[#85152F] border-[#B9193F]/40'
                            : isHoliday
                            ? 'bg-[#FFF0D0] text-[#5D1025] border-[#E5A332]/50'
                            : 'bg-[#FFF0D0] text-[#85152F] border-[#EFCF98]'
                        }`}>
                          {isExam ? 'Exam Alert' : isHoliday ? 'Holiday' : 'General Notice'}
                        </span>
                        {isUrgent && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-[#85152F]/15 text-[#85152F] border border-[#85152F]/30">
                            Urgent
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-[#79685E] dark:text-[#C5B7A8] font-mono">
                          Target: {targetBatchLabel}
                        </span>
                        <span className="text-[10px] text-[#79685E] dark:text-[#A8988C]">• {n.date}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteNotice(n.id)}
                        className="p-1 rounded-lg text-[#85152F] dark:text-[#FF8A9E] hover:bg-[#85152F]/15 transition-colors cursor-pointer"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-serif font-black text-[#5D1025] dark:text-white">
                      {n.title}
                    </h4>

                    <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] leading-relaxed">
                      {n.content}
                    </p>

                    <div className="text-[10px] text-[#79685E] dark:text-[#A8988C] pt-1.5 border-t border-[#EFCF98]/40 dark:border-[#381F28] flex items-center justify-between">
                      <span>Posted by: <strong>{n.postedBy || 'Faculty Desk'}</strong></span>
                      <span>Session: <strong>{n.academicYear || currentAcademicYear}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Academic Session & Faculty Management */}
      {activeTeacherTab === 'super_admin' && (
        <div className="space-y-4">
          {/* Faculty Profile Card */}
          <div className="p-5 rounded-3xl bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] shadow-[0_6px_20px_rgba(133,21,47,0.06)] space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center font-black text-lg shadow-xs flex-shrink-0 border border-[#EFCF98]">
                  {superAdminProfile.avatarInitials || 'AD'}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black text-[#85152F] dark:text-[#F8CF72] uppercase bg-[#FFF0D0] dark:bg-[#2B1B2C] px-2 py-0.5 rounded-md border border-[#EFCF98]">
                      Teacher
                    </span>
                    <span className="text-[10px] font-bold text-[#25844F] bg-[#25844F]/10 px-2 py-0.5 rounded-md border border-[#25844F]/20">
                      Coordinator
                    </span>
                  </div>
                  <h4 className="text-sm font-serif font-black text-[#5D1025] dark:text-white truncate">
                    {superAdminProfile.name}
                  </h4>
                  <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8] font-semibold truncate">
                    {superAdminProfile.designation}
                  </p>
                  <p className="text-[10px] text-[#79685E] dark:text-[#A8988C] font-mono truncate">
                    {superAdminProfile.email} • {superAdminProfile.phone}
                  </p>
                </div>
              </div>

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminProfileForm(superAdminProfile);
                    setShowEditSuperAdminModal(true);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-[#FFF0D0] dark:bg-[#2A1E2E] text-[#85152F] dark:text-[#F8CF72] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer flex-shrink-0 border border-[#EFCF98] hover:bg-[#FFE6B3]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98]/60 dark:border-[#381F28] text-[11px] space-y-1 text-[#79685E] dark:text-[#C5B7A8]">
              <p className="italic">&ldquo;{superAdminProfile.bio}&rdquo;</p>
              <div className="flex items-center justify-between pt-1.5 border-t border-[#EFCF98]/40 dark:border-[#381F28] text-[10px]">
                <span className="text-[#79685E] dark:text-[#A8988C]">Office / Visiting:</span>
                <span className="font-bold text-[#5D1025] dark:text-[#F8CF72]">{superAdminProfile.officeHours}</span>
              </div>
            </div>
          </div>

          {/* Manage Approved Teachers Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#5D1025] via-[#480B1C] to-[#2B040E] text-[#FFFDF7] shadow-[0_10px_28px_rgba(93,16,37,0.25)] space-y-3 border-2 border-[#E5A332]/50">
            <div className="flex items-center justify-between pb-1 border-b border-[#F8CF72]/20">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#F8CF72]" />
                <h3 className="text-sm font-serif font-black">{t.manageTeachers}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E5A332]/20 text-[#F8CF72] text-[9px] font-black uppercase tracking-wider border border-[#E5A332]/40">
                Teacher Access
              </span>
            </div>
            <p className="text-xs text-[#E8D5C4] leading-relaxed">
              {t.manageTeachersSub} Only verified teacher accounts listed here can access the teacher portal and upload lectures.
            </p>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setShowAddTeacherModal(true)}
                className="mt-2 py-2 px-3.5 rounded-xl bg-[#FFF0D0] text-[#85152F] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#FFE6B3] transition-all cursor-pointer border border-[#EFCF98]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t.addTeacherBtn}</span>
              </button>
            )}
          </div>

          {/* Approved Teachers List */}
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 sm:p-5 space-y-3 shadow-[0_6px_20px_rgba(133,21,47,0.06)]">
            <span className="text-[10px] font-black text-[#85152F] dark:text-[#F8CF72] uppercase tracking-wider block">
              Approved Faculty Collection ({approvedTeachers.length})
            </span>

            <div className="space-y-2.5">
              {approvedTeachers.map((tea) => {
                const isOwner = tea.email === 'ardgamer113@gmail.com' || tea.isOwner;
                return (
                  <div
                    key={tea.email}
                    className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98]/70 dark:border-[#381F28] shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-serif font-black text-[#5D1025] dark:text-white truncate">{tea.name}</h4>
                        {isOwner && (
                          <span className="px-2 py-0.5 rounded-md bg-[#FFF0D0] text-[#85152F] text-[9px] font-black uppercase border border-[#EFCF98]">
                            Teacher
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8] font-semibold truncate">
                        {tea.subject}
                      </p>
                      <p className="text-[10px] text-[#79685E] dark:text-[#A8988C] font-mono truncate">
                        {tea.email}
                      </p>
                    </div>

                    {!isOwner && isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => removeTeacher(tea.email)}
                        className="p-2 rounded-xl text-[#85152F] hover:bg-[#85152F]/15 transition-colors cursor-pointer"
                        title="Remove Teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Add Student Manually */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#00142F]">{t.addStudent}</h3>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="e.g. Aryan Deshmukh"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F294A]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Google Email Address *</label>
                <input
                  type="email"
                  required
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="aryan.jee@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F294A]"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Student must sign in with this exact Google account.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Batch</label>
                  <select
                    value={newStudent.batchId}
                    onChange={(e) => setNewStudent({ ...newStudent, batchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F294A]"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.stream} - {b.name.split(' - ')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class Standard</label>
                  <select
                    value={newStudent.class}
                    onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F294A]"
                  >
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Repeater">Repeater / Dropper</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Phone</label>
                  <input
                    type="tel"
                    required
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="9820144521"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F294A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={newStudent.academicYear}
                    onChange={(e) => setNewStudent({ ...newStudent, academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F294A]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent Name</label>
                <input
                  type="text"
                  value={newStudent.parentName}
                  onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                  placeholder="Mr. Sanjay Deshmukh"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F294A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0F294A] text-white font-bold hover:bg-[#00142F] shadow-sm transition-all mt-2"
              >
                Enroll Student in Firestore
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk CSV Upload with Email Validation & Error Reporting */}
      {showBulkCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-[#00142F]">{t.csvUploadTitle}</h3>
                <p className="text-[10px] text-slate-500">{t.csvUploadDesc}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkCsvModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* File upload or paste */}
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center space-y-2 bg-[#FAF8FF]">
                <FileSpreadsheet className="w-8 h-8 text-[#0F294A] mx-auto opacity-70" />
                <div className="text-xs">
                  <label className="font-bold text-[#0F294A] cursor-pointer hover:underline">
                    <span>Upload CSV file</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {csvFileName || 'Or paste raw CSV text below'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Raw CSV Data (Headers: name, email, batch, class)
                </label>
                <textarea
                  rows={4}
                  value={rawCsvText}
                  onChange={(e) => handleParseCsv(e.target.value)}
                  placeholder="name,email,batch,class&#10;Kavita Sharma,kavita.jee@gmail.com,JEE,Class 12&#10;Rahul Shinde,invalid-email-row,NEET,Class 12"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#0F294A]"
                />
              </div>

              {/* Sample Template helper */}
              <button
                type="button"
                onClick={() => {
                  const sample = `name,email,batch,class,phone\nAditya Patil,aditya.jee@gmail.com,12th JEE Main & Advanced - Elite,Class 12,9820199101\nNeha Kulkarni,neha.neet@gmail.com,12th NEET Medical Prodigy,Class 12,9820199102\nSiddharth Rao,siddharth.xi@gmail.com,XI-XII Science & MHT-CET,Class 11,9820199103`;
                  handleParseCsv(sample);
                }}
                className="text-[10px] font-bold text-[#0F294A] hover:underline flex items-center gap-1"
              >
                <span>Insert Sample Valid CSV Template</span>
              </button>

              {/* Validation Result Display */}
              {csvParseResult && (
                <div className="space-y-3 pt-2">
                  {/* Errors Summary */}
                  {csvParseResult.errors.length > 0 && (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200 space-y-1.5 text-xs text-red-900">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>{t.csvErrorsFound} ({csvParseResult.errors.length})</span>
                      </div>
                      <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                        {csvParseResult.errors.map((err, idx) => (
                          <div key={idx} className="text-[10px] p-1.5 bg-white/70 rounded-lg">
                            <strong className="text-red-700">Row {err.row}:</strong> {err.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Valid Students Preview */}
                  {csvParseResult.valid.length > 0 && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs text-emerald-900">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{t.csvValidRows} ({csvParseResult.valid.length})</span>
                        </span>
                      </div>
                      <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                        {csvParseResult.valid.map((st, idx) => (
                          <div key={idx} className="text-[10px] p-1.5 bg-white/70 rounded-lg flex justify-between">
                            <span className="font-bold">{st.name}</span>
                            <span className="text-slate-500 font-mono">{st.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={csvParseResult.valid.length === 0}
                    onClick={handleExecuteCsvImport}
                    className="w-full py-3 rounded-xl bg-[#0F294A] text-white font-bold text-xs hover:bg-[#00142F] transition-all shadow-sm disabled:opacity-40"
                  >
                    Import {csvParseResult.valid.length} Valid Students
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Student & Mark Inactive */}
      {showEditStudentModal && selectedStudentToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#00142F]">{t.editStudent}</h3>
              <button
                type="button"
                onClick={() => setShowEditStudentModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Name</label>
                <input
                  type="text"
                  disabled
                  value={editStudentForm.name}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Google Email</label>
                <input
                  type="email"
                  disabled
                  value={editStudentForm.email}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Change Batch</label>
                <select
                  value={editStudentForm.batchId}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, batchId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F294A]"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.stream} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class Standard</label>
                  <select
                    value={editStudentForm.class}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, class: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F294A]"
                  >
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Repeater">Repeater</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status (Active / Inactive)</label>
                  <select
                    value={editStudentForm.status}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, status: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-xl border font-bold ${
                      editStudentForm.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    <option value="active">Active (Permit Login)</option>
                    <option value="inactive">Inactive (Block Login)</option>
                  </select>
                </div>
              </div>

              {isSuperAdmin ? (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentToDelete(selectedStudentToEdit);
                      setShowEditStudentModal(false);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Student</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  Save Student Changes
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Start New Year (Yearly Rollover Wizard) */}
      {showStartNewYearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-[#00142F]">{t.startNewYearTitle}</h3>
                <p className="text-[10px] text-slate-500">{t.startNewYearDesc}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowStartNewYearModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Step 1: New Year Label */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t.newYearLabel} (e.g. 2026-27) *
                </label>
                <input
                  type="text"
                  required
                  value={newYearLabelInput}
                  onChange={(e) => setNewYearLabelInput(e.target.value)}
                  placeholder="2026-27"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-[#0F294A] focus:outline-none focus:border-[#0F294A]"
                />
              </div>

              {/* Step 2: Student Progression Table */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Student Promotions &amp; Leavers ({students.length})
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50">
                  {students.map((st) => {
                    const dec = promotionDecisions[st.id] || {
                      action: 'keep',
                      targetBatchId: st.batchId,
                      targetClass: st.class,
                    };

                    return (
                      <div key={st.id} className="p-2 rounded-lg bg-white border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-[11px]">{st.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{st.class}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              const nextBatch = batches.find((b) => b.stream === 'JEE') || batches[0];
                              setPromotionDecisions({
                                ...promotionDecisions,
                                [st.id]: {
                                  action: 'promote',
                                  targetBatchId: nextBatch?.id || 'jee-2025-a',
                                  targetClass: 'Class 12',
                                },
                              });
                            }}
                            className={`py-1 px-1 rounded text-center font-bold ${
                              dec.action === 'promote'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Promote
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPromotionDecisions({
                                ...promotionDecisions,
                                [st.id]: {
                                  action: 'keep',
                                  targetBatchId: st.batchId,
                                  targetClass: st.class,
                                },
                              });
                            }}
                            className={`py-1 px-1 rounded text-center font-bold ${
                              dec.action === 'keep'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Keep Batch
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPromotionDecisions({
                                ...promotionDecisions,
                                [st.id]: {
                                  action: 'leave',
                                  targetBatchId: st.batchId,
                                  targetClass: 'Leaver',
                                },
                              });
                            }}
                            className={`py-1 px-1 rounded text-center font-bold ${
                              dec.action === 'leave'
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Mark Inactive
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Fee Reset Option */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetFeesOnRollover}
                    onChange={(e) => setResetFeesOnRollover(e.target.checked)}
                    className="mt-0.5 rounded text-[#0F294A]"
                  />
                  <span className="text-[11px] font-bold text-amber-950 leading-tight">
                    {t.resetFeesCheckbox}
                  </span>
                </label>
                <p className="text-[10px] text-amber-800 leading-tight">
                  Past fee receipts and ledgers stay archived under previous sessions.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExecuteRollover}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0F294A] to-[#1E3A8A] text-white font-extrabold text-xs shadow-md hover:brightness-105 transition-all"
              >
                {t.executeRolloverBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Add Teacher */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-[#2D0A14]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] text-[#85152F] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-serif font-black text-[#5D1025] dark:text-white">{t.addTeacherBtn}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1 rounded-full text-[#79685E] hover:text-[#2D211D] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTeacherSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">{t.teacherNameLabel} *</label>
                <input
                  type="text"
                  required
                  value={newTeacherForm.name}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                  placeholder="Prof. Vivek Kulkarni"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EFCF98] dark:border-[#521927] bg-[#FFFDF7] dark:bg-[#241B2E] text-[#2D211D] dark:text-white font-bold placeholder:text-[#A8988C] focus:outline-none focus:border-[#85152F]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">{t.teacherEmailLabel} *</label>
                <input
                  type="email"
                  required
                  value={newTeacherForm.email}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                  placeholder="teacher@bhavaniscience.edu"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EFCF98] dark:border-[#521927] bg-[#FFFDF7] dark:bg-[#241B2E] text-[#2D211D] dark:text-white font-bold placeholder:text-[#A8988C] focus:outline-none focus:border-[#85152F]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5D1025] dark:text-[#F8CF72] block mb-1">{t.teacherSubjectLabel} *</label>
                <input
                  type="text"
                  required
                  value={newTeacherForm.subject}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, subject: e.target.value })}
                  placeholder="Advanced Mathematics &amp; Calculus"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EFCF98] dark:border-[#521927] bg-[#FFFDF7] dark:bg-[#241B2E] text-[#2D211D] dark:text-white font-bold placeholder:text-[#A8988C] focus:outline-none focus:border-[#85152F]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#85152F] to-[#B9193F] hover:from-[#701026] hover:to-[#9F1334] text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
              >
                Save Teacher to Firestore Collection
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Faculty Profile */}
      {showEditSuperAdminModal && (
        <div className="fixed inset-0 z-50 bg-[#2D0A14]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFCF98]/50 dark:border-[#381F28]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0D0] text-[#85152F] flex items-center justify-center font-black">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-black text-[#5D1025] dark:text-white">
                    Edit Faculty Profile
                  </h3>
                  <span className="text-[10px] text-[#85152F] dark:text-[#F8CF72] font-bold block">
                    Teacher Desk
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditSuperAdminModal(false)}
                className="p-1.5 rounded-lg text-[#79685E] hover:text-[#2D211D] dark:hover:text-white hover:bg-[#FFF0D0] dark:hover:bg-[#2A1E2E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateSuperAdminProfile(adminProfileForm);
                setShowEditSuperAdminModal(false);
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
                  value={adminProfileForm.name}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
                  placeholder="Prof. A. R. Deshmukh"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EFCF98] dark:border-[#521927] bg-[#FFFDF7] dark:bg-[#241B2E] text-[#2D211D] dark:text-white font-bold placeholder:text-[#A8988C] focus:outline-none focus:border-[#85152F]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Designation / Role *
                </label>
                <input
                  type="text"
                  required
                  value={adminProfileForm.designation}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, designation: e.target.value })}
                  placeholder="Founder & Academic Director (Physics)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={adminProfileForm.phone}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })}
                    placeholder="+91 98200 45678"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Avatar Initials
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={adminProfileForm.avatarInitials}
                    onChange={(e) => setAdminProfileForm({ ...adminProfileForm, avatarInitials: e.target.value.toUpperCase() })}
                    placeholder="AD"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-center uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Office / Visiting Hours
                </label>
                <input
                  type="text"
                  value={adminProfileForm.officeHours}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, officeHours: e.target.value })}
                  placeholder="e.g. Mon-Sat: 10:00 AM - 02:00 PM"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Director Bio / Message
                </label>
                <textarea
                  rows={3}
                  value={adminProfileForm.bio}
                  onChange={(e) => setAdminProfileForm({ ...adminProfileForm, bio: e.target.value })}
                  placeholder="Guiding vision for students..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditSuperAdminModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-sm transition-all"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Upload Lecture with File/Local Device Video Pickup */}
      {showUploadLectureModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.uploadClassLecture}</h3>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                    🔒 App-Only Video Setting Active
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadLectureModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Source Switcher: Local Device / YouTube / Archive */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 gap-1 text-[11px] font-extrabold">
              <button
                type="button"
                onClick={() => setTeacherUploadMode('local_device')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center ${
                  teacherUploadMode === 'local_device'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📁 Local Device
              </button>
              <button
                type="button"
                onClick={() => setTeacherUploadMode('youtube')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center ${
                  teacherUploadMode === 'youtube'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🔗 YouTube / URL
              </button>
              <button
                type="button"
                onClick={() => setTeacherUploadMode('class_archive')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center ${
                  teacherUploadMode === 'class_archive'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏛️ Archive
              </button>
            </div>

            <form onSubmit={handleUploadLecture} className="space-y-3.5 text-xs">
              {/* Option 1: Pickup Video from Local Device */}
              {teacherUploadMode === 'local_device' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                      Pick Video from Local Device *
                    </label>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                      Local File or Direct Camera
                    </span>
                  </div>

                  {/* Explicit & Accessible Native-Styled File Picker Input */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Choose File:
                      </span>
                      <span className="text-[10px] text-slate-400">MP4, WebM, MOV, QuickTime</span>
                    </div>

                    <input
                      id="teacher-device-file-input"
                      ref={teacherFileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleTeacherLocalFileChange}
                      aria-label="Select File from local device"
                      className="block w-full text-xs text-slate-800 dark:text-slate-200
                                 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0
                                 file:text-xs file:font-bold file:bg-indigo-600 file:text-white
                                 hover:file:bg-indigo-700 file:cursor-pointer
                                 border border-slate-300 dark:border-slate-600 rounded-xl
                                 bg-white dark:bg-slate-900 p-1.5 focus:outline-none
                                 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                    />
                  </div>

                  {/* Explicit Action Buttons: 'Select File' & 'Record Video' */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => teacherFileInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
                    >
                      <FolderOpen className="w-4 h-4 text-white" />
                      <span>{t.selectFileBtn || 'Select File'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => teacherCameraInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
                    >
                      <Camera className="w-4 h-4 text-amber-300" />
                      <span>{t.recordVideoBtn || 'Record Video'}</span>
                    </button>
                  </div>

                  {/* Hidden camera input for direct recording */}
                  <input
                    ref={teacherCameraInputRef}
                    type="file"
                    accept="video/*"
                    capture="environment"
                    onChange={handleTeacherLocalFileChange}
                    className="hidden"
                  />

                  {/* Dropzone / Preview Area */}
                  {!teacherSelectedLocalFile ? (
                    <div
                      onClick={() => teacherFileInputRef.current?.click()}
                      className="p-3.5 border-2 border-dashed border-indigo-400/80 dark:border-indigo-600/60 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 transition-all space-y-1.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <FileVideo className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Or Drag &amp; Drop Local Video File Here
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Click above buttons to Select File or Record live
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {teacherSelectedLocalFile.name}
                            </p>
                            <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">
                              Device File Selected • {teacherSelectedLocalFile.size}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => teacherFileInputRef.current?.click()}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
                        >
                          Change Video
                        </button>
                      </div>

                      {teacherSelectedLocalFile.previewUrl && (
                        <video
                          src={teacherSelectedLocalFile.previewUrl}
                          controls
                          className="w-full h-32 rounded-xl bg-black object-contain border border-slate-200 dark:border-slate-800 shadow-inner"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Option 2: YouTube / Stream URL */}
              {teacherUploadMode === 'youtube' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    YouTube Unlisted / Stream URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or unlisted share link"
                    value={newLecture.videoUrl}
                    onChange={(e) => setNewLecture({ ...newLecture, videoUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Unlisted stream restricted exclusively to Bhavani Science Classes students.
                  </p>
                </div>
              )}

              {/* Option 3: Camera Archive */}
              {teacherUploadMode === 'class_archive' && (
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Select Recorded Camera Master:
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {[
                      { title: 'Ray Optics: Lens Maker Formula L03', subject: 'Physics', duration: '52 mins', size: '348 MB', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
                      { title: 'Coordination Chemistry: Crystal Field L02', subject: 'Chemistry', duration: '48 mins', size: '290 MB', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
                      { title: 'Definite Integrals: King Rule L05', subject: 'Mathematics', duration: '64 mins', size: '412 MB', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
                      { title: 'Principles of Inheritance: Genetics L01', subject: 'Biology', duration: '50 mins', size: '315 MB', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
                    ].map((arch) => (
                      <div
                        key={arch.title}
                        onClick={() => {
                          setNewLecture({
                            ...newLecture,
                            title: arch.title,
                            subject: arch.subject as any,
                            duration: arch.duration,
                            fileSize: arch.size,
                            videoUrl: arch.url,
                            videoFileName: `${arch.title.replace(/\s+/g, '_')}.mp4`,
                          });
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          newLecture.title === arch.title
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/30'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-indigo-600 dark:text-indigo-400 text-[10px] uppercase">
                            {arch.subject}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{arch.duration}</span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">{arch.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Lecture Topic / Title *</label>
                <input
                  type="text"
                  required
                  value={newLecture.title}
                  onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                  placeholder="Ray Optics: Prism & Total Internal Reflection"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Subject</label>
                  <select
                    value={newLecture.subject}
                    onChange={(e) => setNewLecture({ ...newLecture, subject: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Target Batch</label>
                  <select
                    value={newLecture.batchId}
                    onChange={(e) => setNewLecture({ ...newLecture, batchId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Batches</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name.split(' - ')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Chapter Name</label>
                <input
                  type="text"
                  value={newLecture.chapter}
                  onChange={(e) => setNewLecture({ ...newLecture, chapter: e.target.value })}
                  placeholder="Optics & Wave Motion"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* In-App Only Playback Badge */}
              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Upload for App Only (Encrypted)</span>
                  </span>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300">
                    Restricts viewing strictly inside Bhavani player with watermark.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
                  Active
                </span>
              </div>

              {/* Progress bar when uploading */}
              {isUploading && (
                <div className="space-y-1.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                    <span>Publishing Video from Device...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-indigo-200 dark:bg-indigo-900 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Applying watermark &amp; student authorization checks...
                  </p>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadLectureModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
                >
                  {isUploading ? `Publishing... (${uploadProgress}%)` : 'Publish App-Only Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Fee Ledger Update */}
      {showUpdateFeeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#00142F]">{t.updateFee}</h3>
              <button
                type="button"
                onClick={() => setShowUpdateFeeModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFee} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student</label>
                <select
                  value={feeEdit.studentId}
                  onChange={(e) => setFeeEdit({ ...feeEdit, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  {deduplicatedStudentsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo}) - {s.batch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Fee (₹)</label>
                  <input
                    type="number"
                    value={feeEdit.totalFee}
                    onChange={(e) => setFeeEdit({ ...feeEdit, totalFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Paid Fee (₹)</label>
                  <input
                    type="number"
                    value={feeEdit.paidFee}
                    onChange={(e) => setFeeEdit({ ...feeEdit, paidFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0F294A] text-white font-bold text-xs hover:bg-[#00142F]"
              >
                Update Fee Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: Add Marks */}
      {showAddMarksModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#00142F]">{t.enterMarks}</h3>
              <button
                type="button"
                onClick={() => setShowAddMarksModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student</label>
                <select
                  value={newMarks.studentId}
                  onChange={(e) => setNewMarks({ ...newMarks, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  {deduplicatedStudentsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo}) - {s.batch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Test Title</label>
                <input
                  type="text"
                  required
                  value={newMarks.testTitle}
                  onChange={(e) => setNewMarks({ ...newMarks, testTitle: e.target.value })}
                  placeholder="JEE Advanced CBT Simulation #5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Physics</label>
                  <input
                    type="number"
                    value={newMarks.physics}
                    onChange={(e) => setNewMarks({ ...newMarks, physics: Number(e.target.value) })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chemistry</label>
                  <input
                    type="number"
                    value={newMarks.chemistry}
                    onChange={(e) => setNewMarks({ ...newMarks, chemistry: Number(e.target.value) })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Maths</label>
                  <input
                    type="number"
                    value={newMarks.maths}
                    onChange={(e) => setNewMarks({ ...newMarks, maths: Number(e.target.value) })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Percentile (%ile)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMarks.percentile}
                    onChange={(e) => setNewMarks({ ...newMarks, percentile: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Rank</label>
                  <input
                    type="number"
                    value={newMarks.rank}
                    onChange={(e) => setNewMarks({ ...newMarks, rank: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0F294A] text-white font-bold text-xs hover:bg-[#00142F]"
              >
                Record Marks in Firestore
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: Add Batch */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#00142F]">{t.addBatch}</h3>
              <button
                type="button"
                onClick={() => setShowAddBatchModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Batch Name *</label>
                <input
                  type="text"
                  required
                  value={newBatch.name}
                  onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                  placeholder="11th JEE Main Foundation - Alpha"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stream</label>
                  <select
                    value={newBatch.stream}
                    onChange={(e) => setNewBatch({ ...newBatch, stream: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="JEE">JEE</option>
                    <option value="NEET">NEET</option>
                    <option value="MHT-CET">MHT-CET</option>
                    <option value="XI-XII Science">XI-XII Science</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={newBatch.academicYear}
                    onChange={(e) => setNewBatch({ ...newBatch, academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0F294A] text-white font-bold text-xs hover:bg-[#00142F]"
              >
                Create Batch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 10: Add Class Slot (Timetable Maker) */}
      {showAddSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#00142F] dark:text-white">Add Class Slot</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Schedule timetable for students</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSlotModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Batch</label>
                <select
                  value={newSlot.batchId}
                  onChange={(e) => setNewSlot({ ...newSlot, batchId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Day of Week</label>
                  <select
                    value={newSlot.dayOfWeek}
                    onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                  <select
                    value={newSlot.subject}
                    onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Lecture Topic / Chapter</label>
                <input
                  type="text"
                  required
                  value={newSlot.topic}
                  onChange={(e) => setNewSlot({ ...newSlot, topic: e.target.value })}
                  placeholder="e.g. Rotational Dynamics & Moment of Inertia"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Timing</label>
                <input
                  type="text"
                  required
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  placeholder="07:30 AM - 09:15 AM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Teacher / Faculty</label>
                  <input
                    type="text"
                    required
                    value={newSlot.teacher}
                    onChange={(e) => setNewSlot({ ...newSlot, teacher: e.target.value })}
                    placeholder="Prof. A. R. Deshmukh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Room / Hall</label>
                  <input
                    type="text"
                    required
                    value={newSlot.room}
                    onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                    placeholder="Hall 3A / Lab 2"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
              >
                Save &amp; Publish Timetable Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 11: Broadcast Student Announcement */}
      {showPostNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#00142F] dark:text-white">Broadcast Announcement</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Post updates to student dashboards</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPostNoticeModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="e.g. Sunday JEE Main Full Mock Exam #4"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newNotice.type}
                    onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="general">General Notice</option>
                    <option value="exam_alert">Exam &amp; Test Alert</option>
                    <option value="holiday">Holiday Notice</option>
                    <option value="schedule_change">Schedule Update</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Batch</label>
                  <select
                    value={newNotice.batchId}
                    onChange={(e) => setNewNotice({ ...newNotice, batchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="all">All Batches</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  placeholder="Provide important instructions, syllabus chapters, test timings, or holiday details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300">Mark as High Priority / Urgent</span>
                <input
                  type="checkbox"
                  checked={newNotice.priority === 'high'}
                  onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.checked ? 'high' : 'normal' })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
              >
                Broadcast to Students
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 12: Delete Student from Database Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-[#2D0A14]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0EE] dark:bg-[#2B141C] text-[#85152F] flex items-center justify-center flex-shrink-0 border border-[#EFCF98]">
                <AlertTriangle className="w-5 h-5 text-[#B9193F]" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-black text-[#5D1025] dark:text-white">
                  Delete Student from Database
                </h3>
                <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8]">
                  Permanent Deletion • Real-Time Sync
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDF7] dark:bg-[#201729] border border-[#EFCF98]/70 dark:border-[#381F28] space-y-1 text-xs">
              <p className="text-[#5D1025] dark:text-white font-serif font-black">
                {studentToDelete.name}
              </p>
              <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8] font-mono">
                Roll #{studentToDelete.rollNo} • {studentToDelete.email}
              </p>
              <p className="text-[11px] text-[#79685E] dark:text-[#C5B7A8]">
                Batch: {studentToDelete.batch}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFF0EE] dark:bg-[#2B141C] border border-[#B9193F]/30 text-[11px] text-[#85152F] dark:text-[#FF8A9E] space-y-1 leading-relaxed">
              <span className="font-extrabold block">Caution:</span>
              <p>
                This will permanently delete this student from the Firestore database, erase their fee records, and clear their test marks history.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={isDeletingStudent}
                onClick={() => setStudentToDelete(null)}
                className="py-2.5 px-3 rounded-xl border border-[#EFCF98] dark:border-[#4A162B] text-[#79685E] dark:text-[#C5B7A8] font-bold text-xs hover:bg-[#FFF0D0] dark:hover:bg-[#2A1E2E] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingStudent}
                onClick={async () => {
                  setIsDeletingStudent(true);
                  await deleteStudent(studentToDelete.id);
                  setIsDeletingStudent(false);
                  setStudentToDelete(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#85152F] to-[#B9193F] hover:from-[#701026] hover:to-[#9F1334] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingStudent ? 'Deleting...' : 'Delete Student'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
