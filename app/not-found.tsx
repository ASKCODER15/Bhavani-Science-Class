'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  Home, 
  ArrowLeft, 
  MessageCircle, 
  Compass, 
  GraduationCap, 
  Trophy, 
  CreditCard,
  Sparkles,
  Atom
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FE] via-[#F1F3FB] to-[#E9EDF9] dark:from-[#0B1528] dark:via-[#0F1E38] dark:to-[#162747] text-slate-800 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-[#85152F]/20">
      {/* Top Bar with Logo */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-md shadow-slate-900/10 ring-2 ring-white/60 dark:ring-white/10 flex-shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png"
              alt="Bhavani Science Classes"
              fill
              sizes="48px"
              priority
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Bhavani Science Classes
            </div>
            <div className="text-xs text-[#85152F] dark:text-[#F8CF72] font-semibold tracking-wide">
              भूमिका से शिखर तक • Virar (W)
            </div>
          </div>
        </Link>

        <a
          href="https://wa.me/919876543210?text=Hi%20Bhavani%20Science%20Classes,%20I%20need%20help%20with%20the%20portal"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow transition-all active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
          <span>Help</span>
        </a>
      </header>

      {/* Main 404 Hero Card */}
      <main className="max-w-2xl mx-auto w-full my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative backdrop-blur-xl bg-white/75 dark:bg-slate-900/70 border border-white/60 dark:border-white/10 rounded-[28px] p-6 sm:p-10 shadow-xl shadow-indigo-950/5 text-center overflow-hidden"
        >
          {/* Subtle Ambient Background Blob */}
          <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#85152F]/10 dark:bg-[#85152F]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-[#F8CF72]/20 dark:bg-[#F8CF72]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#85152F]/10 dark:bg-[#85152F]/25 text-[#85152F] dark:text-[#F8CF72] ring-1 ring-[#85152F]/20 mb-6">
            <Atom className="w-4 h-4 animate-spin-slow" />
            <span>Quantum State Undefined • 404 Error</span>
          </div>

          {/* Big Error Display */}
          <div className="relative my-2">
            <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-slate-900/10 dark:text-white/5 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Page Not Found
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2 mb-8 leading-relaxed">
            The page or student resource you are trying to reach seems to have decayed or moved to a different coordinate.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#85152F] to-[#A31D3B] text-white shadow-lg shadow-[#85152F]/25 hover:shadow-xl hover:shadow-[#85152F]/35 transition-all active:scale-[0.98]"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home Portal</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Quick Helpful Links Grid */}
          <div className="mt-10 pt-8 border-t border-slate-200/60 dark:border-white/10">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-4 flex items-center justify-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Quick Navigation</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left">
              <Link
                href="/?view=batches"
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-white/5 transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#85152F] dark:group-hover:text-[#F8CF72]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#85152F] dark:text-[#F8CF72]" />
                  <span>Batches</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Classes 8th to 12th
                </div>
              </Link>

              <Link
                href="/?view=results"
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-white/5 transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#85152F] dark:group-hover:text-[#F8CF72]">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Toppers</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  JEE / NEET / Boards
                </div>
              </Link>

              <Link
                href="/?view=fees"
                className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-white/5 transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#85152F] dark:group-hover:text-[#F8CF72]">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Fee Portal</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Receipts & UPI Pay
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer info */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#85152F] dark:text-[#F8CF72]" />
          <span>Bhavani Science Classes • Excellence in STEM Education</span>
        </div>
        <div className="text-[11px]">
          Virar (West), Maharashtra • +91 98765 43210
        </div>
      </footer>
    </div>
  );
}
