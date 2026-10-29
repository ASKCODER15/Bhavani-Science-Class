export type UserRole = 'student' | 'teacher' | 'super_admin';

export interface SuperAdminProfile {
  name: string;
  email: string;
  phone: string;
  designation: string;
  bio: string;
  officeHours: string;
  avatarInitials?: string;
}

export type Language = 'en' | 'hi';

export interface ApprovedTeacher {
  id: string;
  email: string;
  name: string;
  subject: string;
  phone?: string;
  qualification?: string;
  age?: number;
  experienceYears?: number;
  bio?: string;
  assignedBatches?: string[];
  profileCompleted?: boolean;
  addedAt?: string;
  isOwner?: boolean; // Super admin owner flag
}

export interface Batch {
  id: string;
  name: string;
  stream: 'JEE' | 'NEET' | 'MHT-CET' | 'XI-XII Science';
  academicYear: string;
  timing: string;
  room: string;
  studentCount?: number;
}

export interface Student {
  id: string;
  uid?: string;
  email: string;
  name: string;
  batch: string; // Batch name or identifier as specified in prompt
  batchId: string;
  batchName: string;
  class: string; // e.g. "Class 11", "Class 12", "Repeater"
  academicYear: string; // e.g. "2025-26"
  status: 'active' | 'inactive'; // Active or inactive
  parentName: string;
  phone: string;
  parentPhone?: string;
  rollNo: string;
  admissionDate: string;
  age?: number;
  dob?: string;
  targetExam?: string;
  schoolCollege?: string;
  addressArea?: string;
  profileCompleted?: boolean;
  attendanceRate?: number;
  attendancePercentage?: number;
  active: boolean; // Computed or alias for status === 'active'
  avatar?: string;
}

export interface FeeBreakdownItem {
  label: string;
  amount: number;
}

export interface FeeReceipt {
  receiptNo: string;
  amount: number;
  date: string;
  mode: string;
  title: string;
  status: 'PAID' | 'VERIFIED';
  transactionRef?: string;
  academicYear?: string;
}

export interface FeeRecord {
  id: string; // usually studentId or studentId_academicYear
  studentId: string;
  studentRoll: string;
  studentName: string;
  studentEmail?: string;
  batchId: string;
  academicYear: string; // Every record stores an academicYear
  totalFee: number;
  paidFee: number;
  pendingFee: number;
  dueDate: string;
  currentInstallmentTitle: string;
  currentInstallmentNo: number;
  totalInstallments: number;
  installmentAmount: number;
  breakdown: FeeBreakdownItem[];
  pastReceipts: FeeReceipt[];
  upiId?: string;
}

export interface SubjectMarks {
  name: string;
  marks: number;
  max: number;
}

export interface TestResult {
  id: string;
  studentId: string;
  studentRoll: string;
  studentName: string;
  studentEmail?: string;
  batchId: string;
  academicYear: string; // Every record stores an academicYear
  testTitle: string;
  date: string;
  totalMarks: number;
  maxMarks: number;
  percentile: number;
  rank: number;
  totalStudents: number;
  subjects: SubjectMarks[];
  remarks: string;
}

export interface LectureUploadSettings {
  teacherUploadOnly: boolean; // Only approved teachers can upload
  appOnlyPlayback: boolean; // Exclusively streamed/played inside the app player
  antiPiracyWatermark: boolean; // Dynamic roll & student watermark
  allowStudentUploads: boolean; // Strictly false
  videoOptimization: '720p_fast' | '1080p_hd';
  defaultTargetBatch: string;
}

export interface Lecture {
  id: string;
  title: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';
  chapter: string;
  batchId: string; // 'all' or batchId
  batchName: string;
  academicYear: string; // Every record stores an academicYear
  videoUrl: string; // Direct class MP4 video stream or uploaded file blob
  videoFileName?: string;
  fileSize?: string;
  duration: string;
  teacherName: string;
  dateAdded: string;
  notesUrl?: string;
  source: 'class_upload' | 'class_stream';
  appOnly?: boolean; // Set to true for app-only playback
}

export interface TimetableSlot {
  id: string;
  batchId: string;
  academicYear?: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  subject: string;
  topic: string;
  teacher: string;
  room: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'holiday' | 'exam_alert' | 'general' | 'schedule_change';
  batchId: string; // 'all' or batchId
  academicYear: string; // Every record stores an academicYear
  date: string;
  isHoliday: boolean;
  holidayDates?: string;
  priority: 'high' | 'normal';
  postedBy: string;
}

export interface StudentPromotionAction {
  studentId: string;
  studentName: string;
  currentBatchId: string;
  action: 'promote' | 'keep' | 'leave'; // promote to next, keep, or leave (inactive)
  targetBatchId: string;
  targetClass: string;
}

export interface LectureNote {
  id: string;
  lectureId: string;
  lectureTitle: string;
  subject: string;
  studentId: string;
  studentEmail: string;
  studentName?: string;
  timestampSeconds: number; // in seconds
  timestampFormatted: string; // e.g. "04:12"
  text: string;
  createdAt: string;
}

