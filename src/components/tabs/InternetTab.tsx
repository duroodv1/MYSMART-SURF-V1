/**
 * MYSMART SURF - Internet Control Tab Component
 */

import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  Info,
} from 'lucide-react';
import { InternetControlState, AndroidBridgeStatus } from '../../types';
import { ParentAuthModal } from '../ParentAuthModal';

interface InternetTabProps {
  internetState: InternetControlState;
  bridgeStatus: AndroidBridgeStatus;
  onToggleInternet: () => Promise<void>;
}

export const InternetTab: React.FC<InternetTabProps> = ({
  internetState,
  bridgeStatus,
  onToggleInternet,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    await onToggleInternet();
  };

  const isBlocked = internetState.blocked;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header & Main Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-3 rounded-2xl border ${
              isBlocked
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {isBlocked ? <WifiOff className="w-6 h-6" /> : <Wifi className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">INTERNET CONTROL</h2>
            <p className="text-xs text-slate-400">
              Kawal sambungan data mudah alih dan Wi-Fi untuk mengelakkan gangguan semasa belajar atau tidur.
            </p>
          </div>
        </div>

        {/* Big Status Badge */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status Kawalan Rangkaian
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-1.5">
              <span
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isBlocked ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {isBlocked ? '🔴 BLOCKED (DISEKAT)' : '🟢 ALLOWED (DIBENARKAN)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-md">
              {isBlocked
                ? 'Semua sambungan rangkaian luar disekat. Aplikasi dalam talian tidak dapat memuatkan kandungan baru.'
                : 'Sambungan Internet beroperasi secara normal mengikut jadual dan had masa aplikasi yang ditetapkan.'}
            </p>
          </div>

          <button
            id="btn-toggle-internet-main"
            onClick={() => setShowAuthModal(true)}
            className={`py-4 px-8 rounded-2xl font-bold text-sm sm:text-base transition-all active:scale-95 shadow-xl cursor-pointer ${
              isBlocked
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            }`}
          >
            {isBlocked ? 'ALLOW INTERNET (BENARKAN)' : 'BLOCK INTERNET (SEKAT)'}
          </button>
        </div>
      </div>

      {/* Mechanism & Transparency Information */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sky-400">
          <Cpu className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Mekanisme Pelaksanaan Android
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <p className="font-bold text-sky-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Mod APK Native (Android VpnService):
            </p>
            <p className="text-slate-400">
              Dalam versi APK, aplikasi menggunakan mekanisme <code>android.net.VpnService</code> sah pada lapisan sistem operasi tanpa memerlukan root. Loopback firewall menyekat paket DNS & TCP/UDP port 80/443 secara keseluruhan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Mod PWA / Web Browser:
            </p>
            <p className="text-slate-400">
              Pelayar web sandbox (PWA) tidak mempunyai keistimewaan mematikan cip Wi-Fi atau modem telefon secara luaran. PWA menguatkuasakan sekatan tahap aplikasi dan amaran antaramuka. Untuk sekatan peringkat sistem rangkaian sepenuhnya, gunakan binaan APK kami.
            </p>
          </div>
        </div>
      </div>

      {/* Parent Auth Modal */}
      <ParentAuthModal
        isOpen={showAuthModal}
        title={isBlocked ? 'Buka Semula Akses Internet' : 'Sekat Akses Internet'}
        description="Sila masukkan kata laluan ibu bapa untuk mengesahkan pertukaran status kawalan Internet."
        onSuccess={handleAuthSuccess}
        onCancel={() => setShowAuthModal(false)}
      />
    </div>
  );
};
