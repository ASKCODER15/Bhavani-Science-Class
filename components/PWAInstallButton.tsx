'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useApp } from '@/context/AppContext';
import { Download, Share, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { showToast } = useApp();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEA619] text-[#2A1700] text-xs font-bold shadow-sm hover:brightness-105 active:scale-95 transition-all"
        title="Install Bhavani Science Classes App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all border border-white/20"
        >
          <Share className="w-3.5 h-3.5" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#0F294A] text-white flex items-center justify-center font-bold text-xs">
                    BSC
                  </div>
                  <h3 className="font-bold text-base text-[#0F294A]">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 py-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FEA619]/20 text-[#855300] font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <p>
                    Tap the <strong>Share</strong> button <Share className="w-4 h-4 inline-block text-blue-600" /> at the bottom of Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FEA619]/20 text-[#855300] font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <p>
                    Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FEA619]/20 text-[#855300] font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <p>Open the app directly with fast offline access &amp; instant notifications!</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#0F294A] text-white font-bold text-sm shadow-md hover:opacity-95"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback indicator button
  return (
    <button
      onClick={() => showToast('To install on your device, open browser menu (⋮) and tap "Add to Home screen"', 'info')}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all border border-white/20"
      title="PWA Installable"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install PWA</span>
    </button>
  );
};
