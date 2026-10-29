'use client';

import React from 'react';
import { Skeleton } from './SkeletonBase';

export const TeacherHubSkeleton: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="w-24 h-2.5" />
          <Skeleton className="w-36 h-6" />
          <Skeleton className="w-48 h-3" />
        </div>
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>

      {/* 5-Tab Navigation Bar Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-xs">
        <div className="grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Top 3 Action Buttons Skeleton */}
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>

      {/* Search & Filters Card Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
        <Skeleton className="w-full h-9 rounded-xl" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
        </div>
      </div>

      {/* Student List Cards Skeleton */}
      <div className="space-y-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 flex-1">
              <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-44 h-3" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-14 h-5 rounded-full" />
              <Skeleton className="w-7 h-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
