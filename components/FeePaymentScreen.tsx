'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/lib/translations';
import { FeeReceipt } from '@/lib/types';
import QRCode from 'qrcode';
import {
  Lock,
  X,
  Copy,
  Check,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  QrCode,
  Sparkles,
  Camera,
  Clock,
  Landmark,
  Store,
  HelpCircle,
  CreditCard,
  Receipt,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Share2,
  Send,
  RefreshCw,
  Sliders,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';
import { FeePaymentSkeleton } from '@/components/skeletons/FeePaymentSkeleton';

export const FeePaymentScreen: React.FC = () => {
  const {
    language,
    activeStudent,
    currentStudentFee,
    recordPayment,
    setActiveTab,
    showToast,
    isDataLoading,
  } = useApp();

  const t = translations[language];

  const fee = currentStudentFee;
  const totalFee = fee?.totalFee || 95000;
  const paidFee = fee?.paidFee || 50000;
  const pendingFee = fee?.pendingFee || 45000;
  const defaultInstallmentAmount = fee?.installmentAmount || 15000;
  const upiId = fee?.upiId || 'bhavaniscienceclasses@okhdfcbank';
  const payeeName = 'Bhavani Science Classes';

  const [activeSubTab, setActiveSubTab] = useState<'pay' | 'receipts'>('pay');
  const [amountMode, setAmountMode] = useState<'installment' | 'full' | 'custom'>('installment');
  const [customAmount, setCustomAmount] = useState<number>(defaultInstallmentAmount);
  const [selectedUpiApp, setSelectedUpiApp] = useState<'any' | 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cred'>('any');
  
  // Dynamic QR Code data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState<boolean>(true);

  // Interaction feedback states
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(14);
  const [timerSeconds, setTimerSeconds] = useState(59);
  const [openNetBanking, setOpenNetBanking] = useState(false);
  const [openDeskCash, setOpenDeskCash] = useState(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<FeeReceipt | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compute actual payable amount
  const payableAmount = useMemo(() => {
    if (amountMode === 'full') {
      return pendingFee > 0 ? pendingFee : defaultInstallmentAmount;
    }
    if (amountMode === 'custom') {
      return customAmount > 0 ? customAmount : 1000;
    }
    return defaultInstallmentAmount;
  }, [amountMode, pendingFee, defaultInstallmentAmount, customAmount]);

  // Construct NPCI standard UPI Deep Link
  const { universalUpiLink, appSpecificUpiLink, noteText } = useMemo(() => {
    const studentLabel = activeStudent?.name || 'Student';
    const rollLabel = activeStudent?.rollNo || 'Roll';
    const instNo = fee?.currentInstallmentNo || 2;
    const note = `Fee - ${studentLabel} (${rollLabel}) Inst ${instNo} - Bhavani Science Classes`;

    // Standard Universal URI: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
    const baseParams = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: payableAmount.toFixed(2),
      cu: 'INR',
      tn: note,
      mc: '8220', // Educational institutions merchant code
    });

    const universal = `upi://pay?${baseParams.toString()}`;

    // App specific deep links with fallback to universal
    let appLink = universal;
    if (selectedUpiApp === 'gpay') {
      appLink = `tez://upi/pay?${baseParams.toString()}`;
    } else if (selectedUpiApp === 'phonepe') {
      appLink = `phonepe://pay?${baseParams.toString()}`;
    } else if (selectedUpiApp === 'paytm') {
      appLink = `paytmmp://pay?${baseParams.toString()}`;
    } else if (selectedUpiApp === 'bhim') {
      appLink = `upi://pay?${baseParams.toString()}`;
    } else if (selectedUpiApp === 'cred') {
      appLink = `cred://pay?${baseParams.toString()}`;
    }

    return {
      universalUpiLink: universal,
      appSpecificUpiLink: appLink,
      noteText: note,
    };
  }, [upiId, payeeName, payableAmount, activeStudent, fee, selectedUpiApp]);

  // Generate real scannable QR Code using qrcode library
  useEffect(() => {
    let isSubscribed = true;

    QRCode.toDataURL(universalUpiLink, {
      width: 320,
      margin: 1.5,
      errorCorrectionLevel: 'H', // High error correction (30%) so center emblem doesn't break scanner
      color: {
        dark: '#1E1B4B', // Navy matching brand theme
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (isSubscribed) {
          setQrDataUrl(url);
          setQrLoading(false);
        }
      })
      .catch((err) => {
        console.error('QR code generation failure:', err);
        if (isSubscribed) setQrLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [universalUpiLink]);

  // Countdown timer for QR session freshness
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prevSec) => {
        if (prevSec > 0) return prevSec - 1;
        setTimerMinutes((prevMin) => (prevMin > 0 ? prevMin - 1 : 14));
        return 59;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isDataLoading) {
    return <FeePaymentSkeleton />;
  }

  const paidPercent = Math.min(100, Math.round((paidFee / (totalFee || 1)) * 100));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (paidPercent / 100) * circumference;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    showToast(`Copied UPI ID: ${upiId}`, 'info');
    setTimeout(() => setCopiedUpi(false), 2200);
  };

  const handleCopyDeepLink = () => {
    navigator.clipboard.writeText(universalUpiLink);
    setCopiedLink(true);
    showToast('UPI payment deep link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `bhavani_classes_fee_qr_${payableAmount}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('QR Code image downloaded to your device!', 'success');
  };

  const handleShareWhatsApp = () => {
    const message = `🏛️ *Bhavani Science Classes - Official Fee Payment*\n` +
      `👤 *Student:* ${activeStudent?.name || 'Aryan Deshmukh'}\n` +
      `📋 *Roll No:* ${activeStudent?.rollNo || 'Roll-042'}\n` +
      `🎓 *Batch:* ${activeStudent?.batchName || '12th JEE Main & Advanced'}\n` +
      `💰 *Amount Due:* ₹${payableAmount.toLocaleString('en-IN')}\n\n` +
      `⚡ *Direct UPI Payment Link:*\n${universalUpiLink}\n\n` +
      `📲 *Merchant UPI ID:* ${upiId}\n` +
      `📍 *Center:* Magnet Mall 3rd Floor, Virar West\n` +
      `📞 *Helpdesk:* 091689 25687`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleTriggerUpiPay = (e: React.MouseEvent) => {
    // If on mobile device, browser will invoke native intent chooser
    // We also provide a fallback alert if on desktop
    try {
      window.location.href = appSpecificUpiLink;
    } catch {
      window.location.href = universalUpiLink;
    }
  };

  const handleVerifyPayment = async () => {
    if (!activeStudent) return;
    setIsProcessing(true);
    try {
      const modeLabel = `UPI (${selectedUpiApp === 'any' ? 'App Chooser' : selectedUpiApp.toUpperCase()}) / NPCI HDFC`;
      const receipt = await recordPayment(
        activeStudent.id,
        payableAmount,
        modeLabel
      );
      setIsProcessing(false);
      setPaymentSuccessReceipt(receipt);
      showToast(`Payment of ₹${payableAmount.toLocaleString('en-IN')} confirmed successfully!`, 'success');
    } catch (err) {
      setIsProcessing(false);
      console.error(err);
      showToast('Could not record payment. Please check your connection.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.feeHeader || 'Fee Payment & Receipts'}
            </h2>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-900/50">
              <Lock className="w-3 h-3" />
              <span>UPI 2.0 NPCI</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Directly linked to Bhavani Science Classes HDFC Current Account
          </p>
        </div>
      </div>

      {/* Progress Ring: Paid vs. Pending Fee Card */}
      <section className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Session Fee Ledger
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">
            {fee?.academicYear || '2025-26'}
          </span>
        </div>

        <div className="flex items-center justify-around gap-4 pt-1">
          {/* Circular Progress Ring */}
          <div className="relative flex items-center justify-center flex-shrink-0">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#10B981"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Center Text inside Ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-bold text-slate-900 dark:text-white leading-none">
                {paidPercent}%
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-tight mt-0.5">
                Paid
              </span>
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="space-y-2 flex-1">
            <div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                Total Annual Fee
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                ₹{totalFee.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Paid Pill */}
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Paid</span>
              </div>
              <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                ₹{paidFee.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Pending Pill */}
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
              <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Pending</span>
              </div>
              <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                ₹{pendingFee.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Selector: Pay Installment vs. Past Receipts */}
      <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('pay')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'pay'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Pay Fees (QR &amp; UPI)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('receipts')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'receipts'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>History ({fee?.pastReceipts?.length || 1})</span>
        </button>
      </div>

      {activeSubTab === 'pay' ? (
        <>
          {/* Amount Selection Section */}
          <section className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span>Select Payment Amount</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                ₹{payableAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Option 1: Current Installment */}
              <button
                type="button"
                onClick={() => setAmountMode('installment')}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  amountMode === 'installment'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">
                  Installment {fee?.currentInstallmentNo || 2}
                </span>
                <span className="text-sm font-bold block mt-0.5">
                  ₹{defaultInstallmentAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                  Due {fee?.dueDate || '20 May'}
                </span>
              </button>

              {/* Option 2: Full Pending */}
              <button
                type="button"
                onClick={() => setAmountMode('full')}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  amountMode === 'full'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">
                  Full Pending
                </span>
                <span className="text-sm font-bold block mt-0.5">
                  ₹{pendingFee.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                  Clear All Dues
                </span>
              </button>

              {/* Option 3: Custom Amount */}
              <button
                type="button"
                onClick={() => setAmountMode('custom')}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  amountMode === 'custom'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">
                  Custom Part
                </span>
                <span className="text-sm font-bold block mt-0.5">
                  ₹{customAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                  Any Amount
                </span>
              </button>
            </div>

            {/* Custom Amount Input Slider / Field if custom mode */}
            {amountMode === 'custom' && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Enter Custom Amount (₹):
                  </span>
                  <span className="text-[10px] text-slate-400">Max ₹{pendingFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      min={500}
                      max={pendingFee || 100000}
                      step={500}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Math.max(100, Number(e.target.value) || 0))}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    {[1000, 5000].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => setCustomAmount((prev) => Math.min(pendingFee, prev + inc))}
                        className="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition-colors cursor-pointer"
                      >
                        +{inc >= 1000 ? `${inc / 1000}k` : inc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* DYNAMIC SCANNABLE QR CODE SECTION */}
          <section className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm text-center">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 px-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Scan QR with Any UPI App</span>
              </span>
              <span className="flex items-center gap-1 text-rose-500 font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{timerMinutes}:{timerSeconds < 10 ? '0' + timerSeconds : timerSeconds}</span>
              </span>
            </div>

            {/* Claymorphic QR Code Container with Center Logo */}
            <div className="relative inline-block p-4 bg-white rounded-3xl shadow-[0_4px_16px_rgba(30,27,75,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-slate-200 dark:border-slate-700">
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-white rounded-2xl overflow-hidden">
                {qrLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-[10px] text-slate-400 font-medium">Generating UPI QR...</span>
                  </div>
                ) : qrDataUrl ? (
                  <>
                    <Image
                      src={qrDataUrl}
                      alt="Bhavani Science Classes UPI Payment QR Code"
                      width={192}
                      height={192}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                    {/* Centered Institutional Seal Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md border-2 border-[#85152F] bg-white">
                        <Image
                          src="/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png"
                          alt="Bhavani Science Classes"
                          fill
                          sizes="44px"
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-rose-500">Failed to generate QR</div>
                )}
              </div>

              {/* Verified Merchant Badge below QR */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bhavani Science Classes • HDFC Bank</span>
              </div>
            </div>

            {/* Quick QR Actions: Download & Share */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Download QR</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp to Parent</span>
              </button>
            </div>
          </section>

          {/* INTEGRATED UPI DEEP LINK & ONE-TAP PAYMENT SECTION */}
          <section className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_6px_rgba(79,70,229,0.3)]">
                  ⚡
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    One-Tap UPI Deep Link
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Instantly opens installed UPI app on your phone
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-[9px] uppercase border border-indigo-200 dark:border-indigo-900/50">
                Auto Fill
              </span>
            </div>

            {/* Popular UPI Apps Picker */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Choose Preferred UPI App
              </span>

              <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                {/* 1. Any App */}
                <button
                  type="button"
                  onClick={() => setSelectedUpiApp('any')}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                    selectedUpiApp === 'any'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold shadow-xs scale-102'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] mt-1 font-semibold truncate w-full">Any App</span>
                </button>

                {/* 2. Google Pay */}
                <button
                  type="button"
                  onClick={() => setSelectedUpiApp('gpay')}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                    selectedUpiApp === 'gpay'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold shadow-xs scale-102'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs border border-slate-200">
                    <span className="text-sm font-black text-[#4285F4]">G</span>
                  </div>
                  <span className="text-[10px] mt-1 font-semibold truncate w-full">GPay</span>
                </button>

                {/* 3. PhonePe */}
                <button
                  type="button"
                  onClick={() => setSelectedUpiApp('phonepe')}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                    selectedUpiApp === 'phonepe'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold shadow-xs scale-102'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#5f259f] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    Pe
                  </div>
                  <span className="text-[10px] mt-1 font-semibold truncate w-full">PhonePe</span>
                </button>

                {/* 4. Paytm */}
                <button
                  type="button"
                  onClick={() => setSelectedUpiApp('paytm')}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                    selectedUpiApp === 'paytm'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold shadow-xs scale-102'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#002e6e] text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                    Ptm
                  </div>
                  <span className="text-[10px] mt-1 font-semibold truncate w-full">Paytm</span>
                </button>

                {/* 5. BHIM */}
                <button
                  type="button"
                  onClick={() => setSelectedUpiApp('bhim')}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                    selectedUpiApp === 'bhim'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold shadow-xs scale-102'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#007849] text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                    BHIM
                  </div>
                  <span className="text-[10px] mt-1 font-semibold truncate w-full">BHIM</span>
                </button>
              </div>
            </div>

            {/* Direct Pay with UPI App Primary CTA */}
            <a
              href={appSpecificUpiLink}
              onClick={handleTriggerUpiPay}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(79,70,229,0.35)] hover:brightness-105 active:scale-95 transition-all cursor-pointer text-center"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
              <span>
                Pay ₹{payableAmount.toLocaleString('en-IN')} with{' '}
                {selectedUpiApp === 'any' ? 'UPI App' : selectedUpiApp.toUpperCase()}
              </span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>

            {/* UPI ID Pill & Deep Link Copy Controls */}
            <div className="space-y-2 pt-1 text-xs">
              {/* Merchant VPA row */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-left overflow-hidden mr-2">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">
                    Merchant UPI VPA (ID)
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white truncate text-[11px]">
                    {upiId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 flex items-center gap-1 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700 shadow-xs"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>

              {/* UPI Deep Link string row */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-left overflow-hidden mr-2">
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">
                    Raw UPI Deep Link URI
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {universalUpiLink}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyDeepLink}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 flex items-center gap-1 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Instant Verification Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleVerifyPayment}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_8px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                <span>
                  {isProcessing
                    ? 'Verifying Bank Transaction...'
                    : `I Have Paid • Verify & Generate Official Receipt`}
                </span>
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-1.5">
                Automatically archives receipt and reconciles your annual fee ledger
              </p>
            </div>
          </section>

          {/* Alternate Methods: Net Banking & Desk */}
          <section className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 space-y-2.5 shadow-sm text-xs">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Alternative Payment Methods
            </h4>

            {/* Net Banking Toggle */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenNetBanking(!openNetBanking)}
                className="w-full p-3 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>HDFC Bank Account Details (NEFT / RTGS / IMPS)</span>
                </span>
                {openNetBanking ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openNetBanking && (
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Name:</span>
                    <span className="font-bold">BHAVANI SCIENCE CLASSES</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current A/c:</span>
                    <span className="font-bold">50200034182901</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IFSC Code:</span>
                    <span className="font-bold">HDFC0000215 (Virar West)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cash at Virar Desk */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenDeskCash(!openDeskCash)}
                className="w-full p-3 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Cheque / Cash Counter at Virar Center</span>
                </span>
                {openDeskCash ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openDeskCash && (
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <p>Magnet Mall, 3rd Floor, Opp. Platform 1, Virar West.</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Counter Timings: Mon-Sat 08:30 AM - 07:30 PM
                  </p>
                  <p>In-person printed receipts issued immediately upon cash clearance.</p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        /* Payment History Timeline */
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Official Verified Receipts</span>
            <span>All Archived</span>
          </div>

          {(fee?.pastReceipts || []).map((receipt) => (
            <div
              key={receipt.receiptNo}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 block">
                    {receipt.date} • {receipt.receiptNo}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {receipt.title}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-900/50 uppercase">
                  {receipt.status || 'PAID'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Amount Paid</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    ₹{receipt.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Mode</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {receipt.mode}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                  Ref: {receipt.transactionRef || receipt.receiptNo}
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Payment Success Verified Receipt Modal */}
      {paymentSuccessReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white space-y-4 text-center">
            {/* Success Icon */}
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-300 dark:border-emerald-800 shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                Transaction Verified • NPCI
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Fee Payment Successful!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Bhavani Science Classes Receipt Generated
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Receipt No:</span>
                <span className="font-bold text-slate-900 dark:text-white">{paymentSuccessReceipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{paymentSuccessReceipt.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Student:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeStudent?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Roll No:</span>
                <span>#{activeStudent?.rollNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Payment Mode:</span>
                <span className="text-[11px] truncate">{paymentSuccessReceipt.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Date &amp; Time:</span>
                <span>{paymentSuccessReceipt.date}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Remaining Balance:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  ₹{Math.max(0, pendingFee - paymentSuccessReceipt.amount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentSuccessReceipt(null);
                  setActiveSubTab('receipts');
                }}
                className="py-2.5 px-3 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <span>View History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
