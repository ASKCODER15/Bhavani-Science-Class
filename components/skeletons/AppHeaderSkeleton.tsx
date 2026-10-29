'use client';

import React from 'react';
import { Skeleton } from './SkeletonBase';

export const AppHeaderSkeleton: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#111827] border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="space-y-1">
            <Skeleton className="w-32 h-3.5" />
            <Skeleton className="w-20 h-2.5" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-8 h-7 rounded-lg" />
          <Skeleton className="w-16 h-7 rounded-lg" />
          <Skeleton className="w-7 h-7 rounded-lg" />
        </div>
      </div>
    </header>
  );
};
