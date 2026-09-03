/**
 * MYSMART SURF - Fullscreen Kiosk Lock Overlay Component
 * Displayed when device is locked, limit is reached, or sleep schedule is active.
 */

import React, { useState } from 'react';
import { Lock, PhoneCall, Shield, Unlock, Clock, Calculator, Calendar, AlertTriangle } from 'lucide-react';
import { ParentAuthModal } from './ParentAuthModal';
import { dbPut } from '../services/db';
import { ParentOverrideState, ActivityRecord } from '../types';

interface DeviceLockOverlayProps {
  isLocked: boolean;
  lockReason?: string;
  onUnlock: () => void;
  onLaunchAllowedApp?: (pkg: string, name: string) => void;
}

export const DeviceLockOverlay: React.FC<DeviceLockOverlayProps> = ({
  isLocked,
  lockReason = 'Masa penggunaan telah tamat. Sila hubungi ibu bapa.',
  onUnlock,
  onLaunchAllowedApp,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);

  if (!isLocked) return null;

  const handleGrantOverride = async (minutes: number) => {
    const expiresAt = Date.now() + minutes * 60 * 1000;
    const override: ParentOverrideState & { id: string } = {
      id: 'current',
      active: true,
      expiresAt,
      grantedDurationMinutes: minutes,
    };
    await dbPut('parent_override', override);

    // Record activity
    const today = new Date().toISOString().split('T')[0];
    const act: ActivityRecord = {
      id: `act_override_${Date.now()}`,
      date: today,
      timestamp: Date.now(),
      packageName: 'system',
      appName: 'Parent Override',
      durationMinutes: minutes,
      eventType: 'OVERRIDE_GRANTED',
      details: `Ibu bapa membenarkan akses masa tambahan ${minutes} minit.`,
    };
    await dbPut('activities', act);

    setShowAuthModal(false);
    setShowOverrideMenu(false);
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/98 text-slate-100 flex flex-col justify-between p-6 sm:p-10 select-none backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold tracking-wider text-sky-400 uppercase">MYSMART SURF</p>
            <p className="text-[10px] text-slate-400">Kawalan Keselamatan Aktif</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          DIKUNCI
        </div>
      </div>

      {/* Center Lock Message */}
      <div className="max-w-md mx-auto text-center space-y-6 my-auto">
        <div className="inline-flex p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-2xl shadow-rose-500/10 animate-bounce duration-1000">
          <Lock className="w-16 h-16" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            PERANTI DIKUNCI
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            {lockReason}
          </p>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Sila hubungi ibu bapa untuk membuka kunci atau menambah masa.
          </p>
        </div>

        {/* Allowed Emergency Whitelist Apps */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Aplikasi Sentiasa Dibenarkan
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onLaunchAllowedApp?.('com.google.android.calculator', 'Calculator')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-center flex flex-col items-center gap-1 text-slate-200 transition-all cursor-pointer"
            >
              <Calculator className="w-5 h-5 text-sky-400" />
              <span className="text-[10px] font-medium truncate">Kalkulator</span>
            </button>
            <button
              onClick={() => onLaunchAllowedApp?.('com.google.android.calendar', 'Calendar')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-center flex flex-col items-center gap-1 text-slate-200 transition-all cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-medium truncate">Kalendar</span>
            </button>
            <button
              onClick={() => onLaunchAllowedApp?.('com.google.android.dialer', 'Panggilan Kecemasan')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-center flex flex-col items-center gap-1 text-slate-200 transition-all cursor-pointer"
            >
              <PhoneCall className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-medium truncate">Kecemasan</span>
            </button>
          </div>
        </div>

        {/* Parent Override Options if modal confirmed */}
        {showOverrideMenu && (
          <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-4 space-y-2 animate-in fade-in">
            <p className="text-xs font-bold text-sky-400 uppercase">Pilih Tempoh Akses Sementara</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleGrantOverride(15)}
                className="py-2.5 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 text-xs font-semibold transition-all cursor-pointer"
              >
                +15 Minit
              </button>
              <button
                onClick={() => handleGrantOverride(30)}
                className="py-2.5 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 text-xs font-semibold transition-all cursor-pointer"
              >
                +30 Minit
              </button>
              <button
                onClick={() => handleGrantOverride(45)}
                className="py-2.5 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 text-xs font-semibold transition-all cursor-pointer"
              >
                +45 Minit
              </button>
              <button
                onClick={() => handleGrantOverride(60)}
                className="py-2.5 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 text-xs font-semibold transition-all cursor-pointer"
              >
                +1 Jam (60m)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="max-w-md mx-auto w-full flex flex-col gap-2">
        {!showOverrideMenu ? (
          <button
            id="btn-parent-unlock-trigger"
            onClick={() => setShowAuthModal(true)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-sky-600/30 transition-all cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            Nyahkunci Ibu Bapa (Parent Unlock)
          </button>
        ) : (
          <button
            onClick={() => onUnlock()}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            Buka Kunci Sepenuhnya
          </button>
        )}
      </div>

      {/* Parent Auth Modal */}
      <ParentAuthModal
        isOpen={showAuthModal}
        title="Nyahkunci Peranti"
        description="Masukkan kata laluan ibu bapa untuk membuka kunci peranti atau memberikan masa tambahan."
        onSuccess={() => {
          setShowAuthModal(false);
          setShowOverrideMenu(true);
        }}
        onCancel={() => setShowAuthModal(false)}
      />
    </div>
  );
};
