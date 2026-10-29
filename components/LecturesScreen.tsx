'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { Lecture, LectureNote } from '@/lib/types';
import Image from 'next/image';
import {
  PlayCircle,
  X,
  FileText,
  Clock,
  User,
  Video,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Sparkles,
  UploadCloud,
  Lock,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  Eye,
  Check,
  FolderOpen,
  HardDrive,
  FileVideo,
  Youtube,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Camera,
  Bookmark,
  Tag,
  ChevronDown,
  ChevronUp,
  PenSquare,
} from 'lucide-react';
import { LecturesSkeleton } from '@/components/skeletons/LecturesSkeleton';

export const LecturesScreen: React.FC = () => {
  const {
    language,
    currentStudentLectures,
    activeStudent,
    isTeacher,
    batches,
    uploadLecture,
    lectureSettings,
    showToast,
    isDataLoading,
    studentNotes,
    addLectureNote,
    deleteLectureNote,
    updateLectureNote,
    targetLectureToPlay,
    setTargetLectureToPlay,
  } = useApp();

  const t = translations[language];

  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [activePlayingLecture, setActivePlayingLecture] = useState<Lecture | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showFacultyUploadModal, setShowFacultyUploadModal] = useState(false);

  // Quick Teacher Upload Modal state
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
    batchId: batches[0]?.id || 'jee-2025-a',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoFileName: 'BSC_PHY_RayOptics_L04.mp4',
    fileSize: '124 MB',
    duration: '48 mins',
    teacherName: 'Prof. A. R. Deshmukh',
    notesUrl: '',
    appOnly: true,
  });

  const [uploadMode, setUploadMode] = useState<'local_device' | 'youtube' | 'class_archive'>('local_device');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedLocalFile, setSelectedLocalFile] = useState<{
    name: string;
    size: string;
    previewUrl: string;
  } | null>(null);

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const previewUrl = URL.createObjectURL(file);

    setSelectedLocalFile({
      name: file.name,
      size: sizeInMb,
      previewUrl,
    });

    // Auto-generate clean lecture title from the file name if currently empty or default
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

  // Video & Camera recording refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Take Notes states
  const [currentVideoSeconds, setCurrentVideoSeconds] = useState<number>(0);
  const [noteText, setNoteText] = useState<string>('');
  const [customTimestamp, setCustomTimestamp] = useState<string>('00:00');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [expandedNotesLectureId, setExpandedNotesLectureId] = useState<string | null>(null);

  // Auto-play targeted lecture if student clicks a note in their profile
  useEffect(() => {
    if (!targetLectureToPlay) return;

    const target = targetLectureToPlay;
    const timer = setTimeout(() => {
      const found = currentStudentLectures.find((l) => l.id === target.lectureId);
      if (found) {
        setActivePlayingLecture(found);
        if (target.timestampSeconds !== undefined) {
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.currentTime = target.timestampSeconds!;
              videoRef.current.play().catch(() => {});
            }
          }, 350);
        }
      }
      setTargetLectureToPlay(null);
    }, 0);

    return () => clearTimeout(timer);
  }, [targetLectureToPlay, currentStudentLectures, setTargetLectureToPlay]);

  const formatSecondsToMMSS = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const parseMMSSToSeconds = (str: string): number => {
    const parts = str.split(':').map((p) => parseInt(p, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    const val = parseInt(str, 10);
    return isNaN(val) ? 0 : val;
  };

  const handleCaptureCurrentTime = () => {
    if (videoRef.current) {
      const nowSec = Math.floor(videoRef.current.currentTime);
      setCurrentVideoSeconds(nowSec);
      setCustomTimestamp(formatSecondsToMMSS(nowSec));
      showToast(`Captured lecture time: ${formatSecondsToMMSS(nowSec)}`, 'info');
    }
  };

  const handleSaveNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activePlayingLecture) return;
    if (!noteText.trim()) {
      showToast('Please type your note text first.', 'info');
      return;
    }

    const seconds = parseMMSSToSeconds(customTimestamp);
    const formatted = formatSecondsToMMSS(seconds);
    const fullText = selectedTag ? `[${selectedTag}] ${noteText.trim()}` : noteText.trim();

    await addLectureNote({
      lectureId: activePlayingLecture.id,
      lectureTitle: activePlayingLecture.title,
      subject: activePlayingLecture.subject,
      timestampSeconds: seconds,
      timestampFormatted: formatted,
      text: fullText,
    });

    setNoteText('');
    setSelectedTag('');
  };

  const seekToTimestamp = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
      showToast(`Seeked video to ${formatSecondsToMMSS(seconds)}`, 'info');
    }
  };

  const handleCopyNote = (note: LectureNote) => {
    const textToCopy = `[${note.timestampFormatted}] ${note.lectureTitle} (${note.subject}): ${note.text}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      showToast('Note copied to clipboard!', 'success');
    }
  };

  if (isDataLoading) {
    return <LecturesSkeleton />;
  }

  const CLASS_VIDEO_ARCHIVE = [
    {
      title: 'Ray Optics: Lens Maker Formula & Aberrations',
      subject: 'Physics' as const,
      chapter: 'Ray Optics & Optical Instruments',
      duration: '52 mins',
      fileSize: '348 MB',
      videoFileName: 'BSC_PHY_RayOptics_L03.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      title: 'Coordination Chemistry: Crystal Field Splitting in Octahedral Complexes',
      subject: 'Chemistry' as const,
      chapter: 'Coordination Chemistry',
      duration: '48 mins',
      fileSize: '290 MB',
      videoFileName: 'BSC_CHEM_CoordCompounds_L02.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    {
      title: 'Definite Integrals: King Rule, Queen Rule & Differentiation Under Integral Sign',
      subject: 'Mathematics' as const,
      chapter: 'Definite Integration',
      duration: '64 mins',
      fileSize: '412 MB',
      videoFileName: 'BSC_MATH_DefiniteIntegrals_L05.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    {
      title: 'Principles of Inheritance: Monohybrid, Dihybrid Cross & Chromosomal Aberrations',
      subject: 'Biology' as const,
      chapter: 'Genetics & Evolution',
      duration: '50 mins',
      fileSize: '315 MB',
      videoFileName: 'BSC_BIO_Genetics_L01.mp4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    },
  ];

  const handleTeacherUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === 'local_device' && !selectedLocalFile && !newLecture.videoUrl) {
      fileInputRef.current?.click();
      showToast('Please select a video file from your local device first.', 'info');
      return;
    }
    if (!newLecture.videoUrl) {
      showToast('Please specify a video file or link to publish.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const step1 = setTimeout(() => setUploadProgress(65), 250);
    const step2 = setTimeout(() => setUploadProgress(95), 500);

    setTimeout(async () => {
      clearTimeout(step1);
      clearTimeout(step2);
      setUploadProgress(100);
      await uploadLecture(newLecture);
      setIsUploading(false);
      setShowFacultyUploadModal(false);
      setSelectedLocalFile(null);
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
      showToast('Class video published successfully for the app only!', 'success');
    }, 750);
  };

  const subjects = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'];

  const filteredLectures = currentStudentLectures.filter((lec) => {
    if (selectedSubject === 'All') return true;
    return lec.subject.toLowerCase() === selectedSubject.toLowerCase();
  });

  // Subject gradient helper for thumbnails
  const getSubjectThumbnailGradient = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('phys')) return 'from-[#4F46E5] to-[#7C3AED]';
    if (s.includes('chem')) return 'from-[#0D9488] to-[#10B981]';
    if (s.includes('math')) return 'from-[#EA580C] to-[#FF9A76]';
    if (s.includes('bio')) return 'from-[#0284C7] to-[#38BDF8]';
    return 'from-[#6366F1] to-[#4F46E5]';
  };

  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('phys')) return Atom;
    if (s.includes('chem')) return FlaskConical;
    if (s.includes('math')) return Calculator;
    if (s.includes('bio')) return Dna;
    return Video;
  };

  // Mock progress generator based on id hash for demo
  const getMockProgress = (id: string, index: number) => {
    if (index === 0) return 68;
    if (index === 1) return 100;
    if (index === 2) return 35;
    return (id.charCodeAt(id.length - 1) * 7) % 85 + 10;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-[#85152F] dark:text-[#F8CF72] uppercase tracking-wider block">
            Video Lectures
          </span>
          <h2 className="text-2xl font-serif font-black text-[#5D1025] dark:text-[#F8CF72] tracking-tight">
            {t.lecturesTitle}
          </h2>
          <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] font-medium">
            {activeStudent?.batchName || '12th JEE Main & Advanced - Elite'}
          </p>
        </div>

        <div className="w-9 h-9 rounded-2xl bg-[#FFF0D0] dark:bg-[#2B1B2C] text-[#85152F] dark:text-[#F8CF72] flex items-center justify-center border border-[#EFCF98] dark:border-[#4A162B] shadow-xs">
          <PlayCircle className="w-4 h-4" />
        </div>
      </div>

      {/* Role-Specific Security and Upload Action Banner */}
      {isTeacher ? (
        <div className="bg-[#FFFCF4] dark:bg-[#1A1322] border-2 border-[#EFCF98] dark:border-[#4A162B] rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#85152F] dark:text-[#F8CF72]">
              <Sparkles className="w-3.5 h-3.5 text-[#E5A332]" />
              <span>{t.facultyUploadBannerTitle}</span>
            </div>
            <p className="text-xs text-[#79685E] dark:text-[#C5B7A8] truncate">
              {t.facultyUploadBannerDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFacultyUploadModal(true)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#85152F] to-[#B9193F] text-white flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-colors shadow-xs"
          >
            <UploadCloud className="w-4 h-4 text-[#F8CF72]" />
            <span>Upload</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#FFF0D0] dark:bg-[#201525] border border-[#EFCF98] dark:border-[#5D1025] p-3 rounded-2xl flex items-center gap-2.5 text-xs text-[#5D1025] dark:text-[#F8CF72] shadow-xs">
          <div className="w-6 h-6 rounded-lg bg-[#E8F5E9] dark:bg-[#1B3828] text-[#25844F] flex items-center justify-center flex-shrink-0 border border-[#25844F]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold leading-tight text-[#5D1025] dark:text-[#F8CF72]">
            Protected Stream: Plays exclusively in the app player with anti-piracy watermarking.
          </span>
        </div>
      )}

      {/* Subject Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {subjects.map((sub) => {
          const isSelected = selectedSubject === sub;
          return (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#85152F] to-[#B9193F] text-[#FFFDF7] shadow-xs'
                  : 'bg-[#FFFCF4] dark:bg-[#1A1322] text-[#79685E] dark:text-[#C5B7A8] border border-[#EFCF98] dark:border-[#4A162B] hover:bg-[#FFF0D0]/50'
              }`}
            >
              {sub === 'All' ? t.allSubjects : sub}
            </button>
          );
        })}
      </div>

      {/* Native In-App Class Video Player */}
      {activePlayingLecture && (
        <section className="rounded-2xl overflow-hidden border border-slate-800 bg-black text-white shadow-md">
          {/* Player Header */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-950 border-b border-zinc-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white flex-shrink-0 border border-amber-400/40">
                <Image
                  src="/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png"
                  alt="Bhavani Logo"
                  fill
                  sizes="32px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold truncate block text-white">
                  {activePlayingLecture.title}
                </span>
                <span className="text-[10px] text-amber-400 font-medium block">
                  Bhavani Science Classes • App-Only Stream
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActivePlayingLecture(null)}
              className="p-1.5 rounded-full text-slate-400 hover:text-white bg-zinc-800 transition-colors ml-2 flex-shrink-0 cursor-pointer"
              title={t.closeVideo}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* HTML5 Native Video Player with Anti-Piracy Watermark */}
          <div className="relative aspect-video w-full bg-black">
            <video
              ref={videoRef}
              key={activePlayingLecture.id}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
              src={activePlayingLecture.videoUrl}
              onTimeUpdate={(e) => {
                const sec = Math.floor(e.currentTarget.currentTime);
                setCurrentVideoSeconds(sec);
              }}
              onPlay={(e) => {
                e.currentTarget.playbackRate = playbackSpeed;
              }}
            >
              Your browser does not support the video player.
            </video>

            {/* Corner Anti-Piracy Student Watermark */}
            {lectureSettings.antiPiracyWatermark && (
              <div className="absolute top-2 right-2 pointer-events-none opacity-70 flex items-center gap-1.5 bg-black/80 px-2.5 py-1 rounded-xl text-[9px] font-mono text-white border border-white/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  BSC Virar • {activeStudent ? `${activeStudent.name} (${activeStudent.rollNo})` : 'Faculty Desk'}
                </span>
              </div>
            )}
          </div>

          {/* Player Footer & Speed Selector */}
          <div className="p-3 bg-zinc-950 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[#FF9A76] font-black text-[10px]">
                {activePlayingLecture.subject}
              </span>
              <span className="text-[11px] text-slate-400">{activePlayingLecture.teacherName}</span>
            </div>

            {/* Speed selection */}
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl">
              <span className="text-[10px] text-slate-400 px-1 font-bold">Speed:</span>
              {[1, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    setPlaybackSpeed(spd);
                    if (videoRef.current) videoRef.current.playbackRate = spd;
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    playbackSpeed === spd
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* 'Take Notes' Section for Students (Timestamped & Persisting to Profile) */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{t.takeNotes || 'Take Notes'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold">
                      {studentNotes.filter((n) => n.lectureId === activePlayingLecture.id).length}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Timestamped notes saved directly to your student profile
                  </p>
                </div>
              </div>

              {/* Capture Current Time Button */}
              <button
                type="button"
                onClick={handleCaptureCurrentTime}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Capture current video playback time"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{formatSecondsToMMSS(currentVideoSeconds)} • Set Time</span>
              </button>
            </div>

            {/* Note Input Form */}
            <form onSubmit={handleSaveNote} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Time:</span>
                  <input
                    type="text"
                    value={customTimestamp}
                    onChange={(e) => setCustomTimestamp(e.target.value)}
                    placeholder="00:00"
                    className="w-12 bg-transparent text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
                    title="Timestamp (MM:SS)"
                  />
                </div>

                {/* Quick Topic / Formula Tags */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1">
                  {['Formula', 'Key Concept', 'Doubt Point', 'Exam Tip'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedTag === tag
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={t.typeNotePlaceholder || 'Write your notes, important formulas, doubt points for class...'}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Persists to Profile &bull; Accessible anytime
                </span>
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-98"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.saveNote || 'Save Note'}</span>
                </button>
              </div>
            </form>

            {/* List of Saved Notes for this Lecture */}
            {(() => {
              const lecNotes = studentNotes.filter((n) => n.lectureId === activePlayingLecture.id);
              if (lecNotes.length === 0) return null;

              return (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span>Saved Notes ({lecNotes.length})</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Tap timestamp to seek</span>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                    {lecNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5 group hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => seekToTimestamp(note.timestampSeconds)}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                            title="Click to seek video to this moment"
                          >
                            <PlayCircle className="w-3 h-3" />
                            <span>{note.timestampFormatted}</span>
                          </button>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleCopyNote(note)}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                              title="Copy note text"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteLectureNote(note.id)}
                              className="p-1 rounded text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Delete note"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                          {note.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* Video Cards List with Thumbnails & Progress Bars */}
      <div className="space-y-4">
        {filteredLectures.length > 0 ? (
          filteredLectures.map((lec, index) => {
            const isPlaying = activePlayingLecture?.id === lec.id;
            const SubIcon = getSubjectIcon(lec.subject);
            const progress = getMockProgress(lec.id, index);
            const gradient = getSubjectThumbnailGradient(lec.subject);

            return (
              <div
                key={lec.id}
                className={`bg-[#FFFCF4] dark:bg-[#1A1322] border-2 rounded-3xl overflow-hidden shadow-[0_6px_20px_rgba(133,21,47,0.06)] transition-all ${
                  isPlaying
                    ? 'border-[#85152F] ring-2 ring-[#85152F]/20'
                    : 'border-[#EFCF98] dark:border-[#4A162B]'
                }`}
              >
                {/* Visual Thumbnail Banner */}
                <div
                  onClick={() => setActivePlayingLecture(lec)}
                  className={`relative aspect-video w-full bg-gradient-to-br ${gradient} p-3.5 flex flex-col justify-between text-white cursor-pointer overflow-hidden group`}
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />

                  {/* Top Bar on Thumbnail */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/20">
                      <SubIcon className="w-3 h-3 text-[#F8CF72]" />
                      <span>{lec.subject}</span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-[#25844F] text-white font-bold text-[10px] flex items-center gap-1 shadow-xs">
                      <Lock className="w-2.5 h-2.5" />
                      <span>App-Only</span>
                    </span>
                  </div>

                  {/* Center Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/95 text-[#85152F] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-[#F8CF72]">
                      <PlayCircle className="w-7 h-7 fill-[#85152F] text-white" />
                    </div>
                  </div>

                  {/* Bottom Duration Badge on Thumbnail */}
                  <div className="flex items-center justify-between relative z-10 text-xs font-bold">
                    <span className="truncate max-w-[200px] text-white/90">
                      {lec.chapter}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-black/70 font-mono text-[10px] border border-white/20">
                      {lec.duration}
                    </span>
                  </div>
                </div>

                {/* Card Content Below Thumbnail */}
                <div className="p-4 space-y-2.5">
                  <h3 className="text-sm font-serif font-black text-[#5D1025] dark:text-[#FFFDF7] leading-snug">
                    {lec.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-[#79685E] dark:text-[#C5B7A8]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <User className="w-3.5 h-3.5 text-[#85152F] dark:text-[#F8CF72]" />
                      <span>{lec.teacherName}</span>
                    </div>
                    <span className="font-mono text-[#79685E] dark:text-[#A8988C] font-semibold">{lec.fileSize}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[#79685E] dark:text-[#BFAFA3] font-bold">
                      <span>{progress === 100 ? 'Completed' : `${progress}% Watched`}</span>
                      <span className="text-[#85152F] dark:text-[#F8CF72]">{progress === 100 ? '✓ Reviewed' : 'In Progress'}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FFF0D0] dark:bg-[#2A1D2B] overflow-hidden border border-[#EFCF98]/50">
                      <div
                        className={`h-full rounded-full ${
                          progress === 100 ? 'bg-[#25844F]' : 'bg-gradient-to-r from-[#85152F] to-[#E5A332]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Play & Notes CTA Row */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActivePlayingLecture(lec)}
                      className="py-2.5 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-[#85152F] via-[#9E1B38] to-[#5D1025] hover:from-[#5D1025] hover:to-[#85152F] text-[#FFFDF7] flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-98 border border-[#F8CF72]/40"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-[#F8CF72]" />
                      <span>{isPlaying ? 'Playing Now' : 'Watch Lecture'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActivePlayingLecture(lec);
                        setTimeout(() => {
                          const noteInput = document.querySelector('textarea');
                          if (noteInput) noteInput.focus();
                        }, 250);
                      }}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-[#FFF0D0] hover:bg-[#FCEAD2] dark:bg-[#2B1B2C] dark:hover:bg-[#341F3A] text-[#5D1025] dark:text-[#F8CF72] border border-[#EFCF98] dark:border-[#4A162B] flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-98"
                    >
                      <PenSquare className="w-3.5 h-3.5 text-[#85152F] dark:text-[#F8CF72]" />
                      <span>
                        {studentNotes.filter((n) => n.lectureId === lec.id).length > 0
                          ? `Notes (${studentNotes.filter((n) => n.lectureId === lec.id).length})`
                          : 'Take Notes'}
                      </span>
                    </button>
                  </div>

                  {/* Saved notes preview chip if available */}
                  {(() => {
                    const savedCount = studentNotes.filter((n) => n.lectureId === lec.id).length;
                    if (savedCount === 0) return null;
                    return (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-[10px] text-indigo-800 dark:text-indigo-300 font-semibold">
                        <Bookmark className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        <span>{savedCount} timestamped note{savedCount > 1 ? 's' : ''} saved in your profile</span>
                      </div>
                    );
                  })()}

                  {/* Notes PDF link if available */}
                  {lec.notesUrl && (
                    <div className="pt-0.5 text-center">
                      <a
                        href={lec.notesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#4F46E5] dark:text-indigo-300 font-extrabold hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Download Class Notes (PDF)</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No class lectures for {selectedSubject}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Recordings are published after syllabus classroom hours by faculty.
            </p>
          </div>
        )}
      </div>

      {/* QUICK MODAL: Faculty Upload Lecture for the App Only */}
      {showFacultyUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xl text-slate-900 dark:text-white space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    Upload Lecture
                  </h3>
                  <p className="text-[10px] text-slate-400">Restricted for App Only</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFacultyUploadModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* App-Only Setting Notice & Switch */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#4F46E5]" />
                  <span className="text-xs font-black text-[#4F46E5] dark:text-indigo-300">
                    App-Only Playback Setting
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#10B981] text-white text-[9px] font-black uppercase">
                  Enforced
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                This lecture will be playable exclusively inside the Bhavani Science Classes app player. External downloads and external sharing are blocked.
              </p>
            </div>

            {/* Source Switcher: Local Device / YouTube / Archive */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 gap-1 text-[11px] font-extrabold">
              <button
                type="button"
                onClick={() => setUploadMode('local_device')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center ${
                  uploadMode === 'local_device'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📁 Local Device
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('youtube')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center ${
                  uploadMode === 'youtube'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🔗 YouTube / URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('class_archive')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center ${
                  uploadMode === 'class_archive'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏛️ Archive
              </button>
            </div>

            <form onSubmit={handleTeacherUpload} className="space-y-3.5 text-xs">
              {/* Option 1: Pick up Video from File / Local Device */}
              {uploadMode === 'local_device' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                      Pick Video from Local Device *
                    </label>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                      Direct Device Storage / Camera
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
                      id="lectures-device-file-input"
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleLocalFileChange}
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
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
                    >
                      <FolderOpen className="w-4 h-4 text-white" />
                      <span>{t.selectFileBtn || 'Select File'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
                    >
                      <Camera className="w-4 h-4 text-amber-300" />
                      <span>{t.recordVideoBtn || 'Record Video'}</span>
                    </button>
                  </div>

                  {/* Hidden camera input for direct recording */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="video/*"
                    capture="environment"
                    onChange={handleLocalFileChange}
                    className="hidden"
                  />

                  {/* Dropzone / Preview Area */}
                  {!selectedLocalFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
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
                              {selectedLocalFile.name}
                            </p>
                            <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">
                              Device File Selected • {selectedLocalFile.size}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
                        >
                          Change Video
                        </button>
                      </div>

                      {selectedLocalFile.previewUrl && (
                        <video
                          src={selectedLocalFile.previewUrl}
                          controls
                          className="w-full h-32 rounded-xl bg-black object-contain border border-slate-200 dark:border-slate-800 shadow-inner"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Option 2: YouTube / Web URL */}
              {uploadMode === 'youtube' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    YouTube Unlisted or Web Stream URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or unlisted link"
                    value={newLecture.videoUrl}
                    onChange={(e) => setNewLecture({ ...newLecture, videoUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Stream will be restricted exclusively to the Bhavani player with anti-piracy watermark.
                  </p>
                </div>
              )}

              {/* Option 3: Pick from Recorded Archive */}
              {uploadMode === 'class_archive' && (
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Select Recorded Camera Master:
                  </label>
                  {CLASS_VIDEO_ARCHIVE.map((arch) => (
                    <div
                      key={arch.videoFileName}
                      onClick={() => {
                        setNewLecture({
                          ...newLecture,
                          title: arch.title,
                          subject: arch.subject,
                          chapter: arch.chapter,
                          duration: arch.duration,
                          fileSize: arch.fileSize,
                          videoFileName: arch.videoFileName,
                          videoUrl: arch.videoUrl,
                        });
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        newLecture.videoFileName === arch.videoFileName
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
              )}

              {/* Lecture Metadata Inputs */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ray Optics: Lens Maker Formula L04"
                  value={newLecture.title}
                  onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Subject
                  </label>
                  <select
                    value={newLecture.subject}
                    onChange={(e) =>
                      setNewLecture({
                        ...newLecture,
                        subject: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Target Batch
                  </label>
                  <select
                    value={newLecture.batchId}
                    onChange={(e) => setNewLecture({ ...newLecture, batchId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Chapter Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wave Optics & Interference"
                  value={newLecture.chapter}
                  onChange={(e) => setNewLecture({ ...newLecture, chapter: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Setting Checkbox for Teacher */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Upload for App Only (Encrypted)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                  Active
                </span>
              </div>

              {/* Upload Progress Bar if processing */}
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
                  onClick={() => setShowFacultyUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isUploading ? 'Publishing...' : 'Publish to App'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
