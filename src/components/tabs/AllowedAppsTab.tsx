/**
 * MYSMART SURF - Allowed Apps (Whitelist) Tab Component
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  Plus,
  Info,
  Phone,
  Calculator,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react';
import { AppRule } from '../../types';
import { ParentAuthModal } from '../ParentAuthModal';

interface AllowedAppsTabProps {
  appRules: AppRule[];
  onToggleAlwaysAllowed: (packageName: string, isAllowed: boolean) => Promise<void>;
}

export const AllowedAppsTab: React.FC<AllowedAppsTabProps> = ({
  appRules,
  onToggleAlwaysAllowed,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<{ pkg: string; allow: boolean } | null>(null);

  const whitelistApps = appRules.filter((a) => a.isAlwaysAllowed);
  const otherApps = appRules.filter((a) => !a.isAlwaysAllowed);

  const handleToggleClick = (pkg: string, currentStatus: boolean) => {
    setSelectedApp({ pkg, allow: !currentStatus });
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    if (selectedApp) {
      await onToggleAlwaysAllowed(selectedApp.pkg, selectedApp.allow);
      setSelectedApp(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">ALLOWED APPS (SENARAI PUTIH)</h2>
            <p className="text-xs text-slate-400">
              Aplikasi dalam senarai ini sentiasa dibenarkan walaupun had masa skrin telah tamat atau peranti dalam mod sekatan.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 mt-4 text-xs text-slate-300">
          <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
          <p>
            Aplikasi penting seperti <strong>Panggilan Kecemasan</strong>, <strong>Kalkulator</strong>, <strong>Kalendar</strong>, dan <strong>Pendidikan</strong> dilindungi dalam senarai putih agar anak-anak sentiasa dapat berhubung dan belajar.
          </p>
        </div>
      </div>

      {/* Whitelist Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider px-1">
          ✓ SENTIASA DIBENARKAN ({whitelistApps.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {whitelistApps.map((app) => (
            <div
              key={app.packageName}
              className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{app.appName}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">
                    {app.packageName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleToggleClick(app.packageName, true)}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Keluarkan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Other Apps Add to Whitelist */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          TAMBAH APLIKASI LAIN KE SENARAI PUTIH
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {otherApps.map((app) => (
            <div
              key={app.packageName}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
                  {app.appName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{app.appName}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate max-w-[170px]">
                    {app.packageName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleToggleClick(app.packageName, false)}
                className="py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Benarkan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Auth Modal */}
      <ParentAuthModal
        isOpen={showAuthModal}
        title="Pengesahan Senarai Putih"
        description="Sila masukkan kata laluan ibu bapa untuk mengubah senarai aplikasi yang sentiasa dibenarkan."
        onSuccess={handleAuthSuccess}
        onCancel={() => {
          setShowAuthModal(false);
          setSelectedApp(null);
        }}
      />
    </div>
  );
};
