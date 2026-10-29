'use client';

import React from 'react';
import { Skeleton } from './SkeletonBase';

export const TimetableSkeleton: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="w-36 h-6" />
          <Skeleton className="w-48 h-3" />
        </div>
        <Skeleton className="w-8 h-8 rounded-xl" />
      </div>

      {/* Horizontal Day Selector Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl shadow-xs">
        <div className="flex items-center gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <Skeleton key={d} className="flex-1 h-7 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Selected Day Info Skeleton */}
      <div className="flex items-center justify-between px-1">
        <Skeleton className="w-28 h-3" />
        <Skeleton className="w-12 h-3" />
      </div>

      {/* Class Cards List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs"
          >
            {/* Header row: Subject, Icon, Time */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="w-16 h-2.5" />
                  <Skeleton className="w-24 h-4" />
                </div>
              </div>
              <Skeleton className="w-24 h-6 rounded-lg" />
            </div>

            {/* Topic Title */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 space-y-1">
              <Skeleton className="w-10 h-2" />
              <Skeleton className="w-4/5 h-3.5" />
            </div>

            {/* Footer: Faculty & Room */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <Skeleton className="w-32 h-3" />
              <Skeleton className="w-20 h-4 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
