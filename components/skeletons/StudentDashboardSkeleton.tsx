'use client';

import React from 'react';
import { Skeleton } from './SkeletonBase';

export const StudentDashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4 animate-in fade-in duration-300">
      {/* Academic Year Switcher Bar Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-14 h-3.5" />
            <Skeleton className="w-10 h-3 rounded" />
          </div>
        </div>
        <Skeleton className="w-24 h-6 rounded-lg" />
      </div>

      {/* Student Welcome Hero Card Skeleton */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="w-20 h-2.5" />
            <Skeleton className="w-36 h-6" />
            <Skeleton className="w-28 h-3" />
          </div>
          <Skeleton className="w-24 h-7 rounded-lg" />
        </div>
      </section>

      {/* Quick Overview Grid: Next Test & Fees Skeleton */}
      <section className="grid grid-cols-2 gap-3">
        {/* Next Test / Rank Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-xs h-28">
          <div className="flex items-center justify-between">
            <Skeleton className="w-16 h-2.5" />
            <Skeleton className="w-4 h-4 rounded" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="w-20 h-6" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>

        {/* Pending Fee Chip Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-xs h-28">
          <div className="flex items-center justify-between">
            <Skeleton className="w-16 h-2.5" />
            <Skeleton className="w-4 h-4 rounded" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="w-24 h-6" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>
      </section>

      {/* Today's Class / Schedule Card Skeleton */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-28 h-4" />
          </div>
          <Skeleton className="w-14 h-3" />
        </div>

        <div className="space-y-2 pt-1">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 flex-1">
                <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-20 h-3.5" />
                    <Skeleton className="w-12 h-3" />
                  </div>
                  <Skeleton className="w-3/4 h-3" />
                  <Skeleton className="w-1/2 h-2.5" />
                </div>
              </div>
              <Skeleton className="w-12 h-4 rounded" />
            </div>
          ))}
        </div>

        <Skeleton className="w-full h-8 rounded-xl mt-1" />
      </section>

      {/* "Continue Watching" Lecture Card Skeleton */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-32 h-4" />
          </div>
          <Skeleton className="w-16 h-3" />
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="w-3/4 h-3.5" />
              <Skeleton className="w-1/2 h-2.5" />
            </div>
            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="w-12 h-2" />
              <Skeleton className="w-8 h-2" />
            </div>
            <Skeleton className="w-full h-1.5 rounded-full" />
          </div>
        </div>
      </section>

      {/* Notices Timeline Card Skeleton */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-36 h-4" />
          </div>
          <Skeleton className="w-16 h-3" />
        </div>

        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-16 h-4 rounded" />
                <Skeleton className="w-16 h-2.5" />
              </div>
              <Skeleton className="w-4/5 h-3.5" />
              <Skeleton className="w-full h-2.5" />
              <Skeleton className="w-2/3 h-2.5" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
