'use client';

import React from 'react';
import { Skeleton } from './SkeletonBase';

export const FeePaymentSkeleton: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4 animate-in fade-in duration-300">
      {/* Top Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-16 h-4 rounded-md" />
          </div>
          <Skeleton className="w-48 h-3" />
        </div>
      </div>

      {/* Progress Ring: Fee Ledger Card Skeleton */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-32 h-3.5" />
          </div>
          <Skeleton className="w-14 h-3" />
        </div>

        <div className="flex items-center justify-around gap-4 pt-1">
          {/* Circular Progress Ring Placeholder */}
          <div className="w-24 h-24 rounded-full border-8 border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
            <Skeleton className="w-10 h-5" />
          </div>

          {/* Breakdown Stats */}
          <div className="space-y-2 flex-1">
            <div className="space-y-1">
              <Skeleton className="w-24 h-2.5" />
              <Skeleton className="w-28 h-6" />
            </div>
            <Skeleton className="w-full h-8 rounded-xl" />
            <Skeleton className="w-full h-8 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Tab Selector Skeleton */}
      <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl grid grid-cols-2 gap-1">
        <Skeleton className="h-8 rounded-lg" />
        <Skeleton className="h-8 rounded-lg" />
      </div>

      {/* Hero Installment Card Skeleton */}
      <section className="rounded-2xl bg-slate-900 p-5 space-y-4 shadow-xs border border-slate-800">
        <div className="flex items-center justify-between">
          <Skeleton className="w-32 h-4 rounded-full bg-slate-800" />
          <Skeleton className="w-24 h-3 bg-slate-800" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="w-4/5 h-5 bg-slate-800" />
          <Skeleton className="w-2/3 h-3 bg-slate-800" />
        </div>
        <Skeleton className="w-32 h-8 bg-slate-800" />
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="w-40 h-3 bg-slate-800" />
            <Skeleton className="w-16 h-3 bg-slate-800" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="w-44 h-3 bg-slate-800" />
            <Skeleton className="w-16 h-3 bg-slate-800" />
          </div>
        </div>
      </section>

      {/* UPI Section Skeleton */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-4 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="w-28 h-3.5" />
              <Skeleton className="w-36 h-2.5" />
            </div>
          </div>
          <Skeleton className="w-14 h-4 rounded-md" />
        </div>

        {/* UPI Apps Row */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>

        {/* QR Placeholder */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 flex flex-col items-center space-y-3">
          <Skeleton className="w-36 h-36 rounded-2xl" />
          <Skeleton className="w-full h-9 rounded-xl" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      </section>
    </div>
  );
};
