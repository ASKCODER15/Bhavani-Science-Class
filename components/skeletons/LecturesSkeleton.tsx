'use client';

import React from 'react';
import { Skeleton } from './SkeletonBase';

export const LecturesSkeleton: React.FC = () => {
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

      {/* Security Banner Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 rounded-xl flex items-center gap-2.5 shadow-xs">
        <Skeleton className="w-6 h-6 rounded-lg flex-shrink-0" />
        <Skeleton className="w-4/5 h-3" />
      </div>

      {/* Subject Filter Chips Skeleton */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {['All Subjects', 'Physics', 'Chemistry', 'Mathematics', 'Biology'].map((sub) => (
          <Skeleton key={sub} className="h-7 w-20 rounded-xl flex-shrink-0" />
        ))}
      </div>

      {/* Video Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs"
          >
            {/* 16:9 Thumbnail Banner Placeholder */}
            <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Skeleton className="w-20 h-5 rounded-full" />
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <div className="flex items-center justify-center">
                <Skeleton className="w-11 h-11 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-14 h-4 rounded" />
              </div>
            </div>

            {/* Content Below Thumbnail */}
            <div className="p-3.5 space-y-2.5">
              <Skeleton className="w-4/5 h-4" />
              <div className="flex items-center justify-between">
                <Skeleton className="w-36 h-3" />
                <Skeleton className="w-14 h-3" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="w-16 h-2" />
                  <Skeleton className="w-14 h-2" />
                </div>
                <Skeleton className="w-full h-1.5 rounded-full" />
              </div>
              <Skeleton className="w-full h-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
