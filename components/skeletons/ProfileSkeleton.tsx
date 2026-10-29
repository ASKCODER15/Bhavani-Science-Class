'use client';

import React from 'react';
import { Skeleton } from './SkeletonBase';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4 animate-in fade-in duration-300">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="w-36 h-6" />
          <Skeleton className="w-52 h-3" />
        </div>
        <Skeleton className="w-20 h-8 rounded-xl" />
      </div>

      {/* Main Profile Card Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-16 h-4 rounded" />
              <Skeleton className="w-20 h-3" />
            </div>
            <Skeleton className="w-36 h-5" />
            <Skeleton className="w-48 h-3" />
          </div>
        </div>

        {/* Batch & Session Row */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="w-20 h-2.5" />
            <Skeleton className="w-32 h-4" />
          </div>
          <div className="space-y-1">
            <Skeleton className="w-14 h-2.5" />
            <Skeleton className="w-16 h-4" />
          </div>
        </div>
      </div>

      {/* Preferences Section Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
        <Skeleton className="w-24 h-3" />

        {/* Theme Row Skeleton */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-24 h-3.5" />
                  <Skeleton className="w-16 h-4 rounded-md" />
                </div>
                <Skeleton className="w-44 h-2.5" />
              </div>
            </div>
            <Skeleton className="w-13 h-7 rounded-full flex-shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750">
            <Skeleton className="h-7 rounded-md" />
            <Skeleton className="h-7 rounded-md" />
          </div>
        </div>
      </div>

      {/* Academic Year Switcher Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
        <Skeleton className="w-28 h-3" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </div>

      {/* Logout Button Skeleton */}
      <Skeleton className="w-full h-11 rounded-xl" />
    </div>
  );
};
