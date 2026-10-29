'use client';

import React from 'react';
import { Skeleton } from './SkeletonBase';

export const TestResultsSkeleton: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4 animate-in fade-in duration-300">
      {/* Top Switcher Skeleton */}
      <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl grid grid-cols-2 gap-1">
        <Skeleton className="h-8 rounded-lg" />
        <Skeleton className="h-8 rounded-lg" />
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="w-28 h-2.5" />
          <Skeleton className="w-40 h-6" />
          <Skeleton className="w-56 h-3" />
        </div>
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>

      {/* Test Results Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xs"
          >
            {/* Top Row: Title, Date, and Rank Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="w-28 h-2.5" />
                <Skeleton className="w-4/5 h-4" />
              </div>
              <Skeleton className="w-16 h-12 rounded-xl flex-shrink-0" />
            </div>

            {/* Score Showcase */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 flex items-center justify-around gap-4">
              {/* Circular Ring Placeholder */}
              <div className="w-20 h-20 rounded-full border-6 border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                <Skeleton className="w-8 h-4" />
              </div>
              <div className="space-y-2 flex-1">
                <Skeleton className="w-28 h-2.5" />
                <Skeleton className="w-24 h-6" />
                <Skeleton className="w-20 h-4 rounded-md" />
              </div>
            </div>

            {/* Subject-Wise Bars */}
            <div className="space-y-2.5 pt-1">
              <Skeleton className="w-36 h-2.5" />
              {[1, 2, 3].map((s) => (
                <div key={s} className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="w-20 h-3" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <Skeleton className="w-full h-1.5 rounded-full" />
                </div>
              ))}
            </div>

            <Skeleton className="w-full h-9 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};
