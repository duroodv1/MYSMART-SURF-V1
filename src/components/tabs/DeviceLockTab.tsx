/**
 * MYSMART SURF - Device Lock Management Tab Component
 */

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Info,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { ParentAuthModal } from '../ParentAuthModal';

interface DeviceLockTabProps {
  isDeviceLocked: boolean;
  onLockNow: () => Promise<void>;
  onUnlockNow: () => Promise<void>;
  onGrantTemporaryAccess: (minutes: number) => Promise<void>;
}

export const DeviceLockTab: React.FC<DeviceLockTabProps> = ({
  isDeviceLocked,
  onLockNow,
  onUnlockNow,
  onGrantTemporaryAccess,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'lock' | 'unlock' | 'override' | null>(null);
  const [overrideMinutes, setOverrideMinutes] = useState<number>(30);

  const handleTriggerAction = (action: 'lock' | 'unlock' | 'override', minutes = 30) => {
    setPendingAction(action);
    setOverrideMinutes(minutes);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    if (pendingAction === 'lock') {
      await onLockNow();
    } else if (pendingAction === 'unlock') {
      await onUnlockNow();
    } else if (pendingAction === 'override') {
      await onGrantTemporaryAccess(overrideMinutes);
    }
    setPendingAction(null);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Main Lock Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-3 rounded-2xl border ${
              isDeviceLocked
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
            }`}
          >
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">DEVICE LOCK (KUNCI PERANTI)</h2>
            <p className="text-xs text-slate-400">
              Kunci peranti secara serta-merta atau berikan akses sementara kepada anak.
            </p>
          </div>
        </div>

        {/* Lock / Unlock Interactive Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status Kunci Semasa
            </span>
            <p
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${
                isDeviceLocked ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isDeviceLocked ? '🔒 PERANTI DIKUNCI' : '🟢 PERANTI DIBUKA'}
            </p>
            <p className="text-xs text-slate-400 mt-2 max-w-md">
              {isDeviceLocked
                ? 'Skrin sekatan aktif. Hanya aplikasi dalam senarai putih (whitelist) dan panggilan kecemasan boleh digunakan.'
                : 'Peranti boleh digunakan mengikut had masa harian dan peraturan jadual yang ditetapkan.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {!isDeviceLocked ? (
              <button
                id="btn-lock-device-now"
                onClick={() => handleTriggerAction('lock')}
                className="py-4 px-8 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-sm sm:text-base shadow-xl shadow-rose-600/30 transition-all cursor-pointer"
              >
                LOCK DEVICE NOW
              </button>
            ) : (
              <button
                id="btn-unlock-device-now"
                onClick={() => handleTriggerAction('unlock')}
                className="py-4 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-600/30 transition-all cursor-pointer"
              >
                UNLOCK DEVICE NOW
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Parent Override Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-sky-400">
          <Clock className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">
            PARENT OVERRIDE (AKSES SEMENTARA)
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ibu bapa boleh memberikan masa tambahan sementara. Apabila tempoh tamat, sekatan peranti akan kembali aktif secara automatik tanpa memerlukan campur tangan manual.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[15, 30, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => handleTriggerAction('override', mins)}
              className="py-3.5 px-4 rounded-2xl bg-slate-950 hover:bg-sky-600/20 border border-slate-800 hover:border-sky-500/40 text-slate-200 text-xs font-bold transition-all cursor-pointer text-center"
            >
              Allow {mins >= 60 ? '1 Hour' : `${mins} Minutes`}
            </button>
          ))}
        </div>
      </div>

      {/* Technical Architecture Info */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-3 text-xs text-slate-400">
        <p className="font-bold text-slate-300 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-sky-400" />
          Mekanisme Kunci Peringkat Sistem (Android Device Owner / Lock Task):
        </p>
        <p>
          Pada Android APK yang dikonfigurasikan sebagai Device Owner atau Device Admin, kaedah <code>dpm.lockNow()</code> dan <code>Activity.startLockTask()</code> digunakan untuk menghalang kanak-kanak daripada menekan butang Home atau Recent Apps untuk meloloskan diri daripada kawalan.
        </p>
      </div>

      {/* Parent Auth Modal */}
      <ParentAuthModal
        isOpen={showAuthModal}
        title="Pengesahan Kunci / Buka Peranti"
        description="Sila masukkan kata laluan ibu bapa untuk meneruskan kawalan peranti ini."
        onSuccess={handleAuthSuccess}
        onCancel={() => {
          setShowAuthModal(false);
          setPendingAction(null);
        }}
      />
    </div>
  );
};
