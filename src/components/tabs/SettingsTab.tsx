/**
 * MYSMART SURF - Settings & Data Management Tab Component
 */

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Database,
  Moon,
  Sun,
  Code2,
  Globe,
  Cpu,
  EyeOff,
  Lock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { ParentAuthModal } from '../ParentAuthModal';
import { dbGetAll, dbClearAll } from '../../services/db';
import {
  generatePurePwaZip,
  generateApkPackageZip,
  generateBridgeNativeZip,
} from '../../utils/pwaZipPackager';

interface SettingsTabProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onResetAllData: () => Promise<void>;
  developerMode?: boolean;
  onToggleDeveloperMode?: (enabled?: boolean) => void;
  onNavigate?: (tab: any) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  darkMode,
  onToggleTheme,
  onResetAllData,
  developerMode = false,
  onToggleDeveloperMode,
  onNavigate,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'reset' | 'unlock_dev' | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [devTapCount, setDevTapCount] = useState(0);

  // Download states for separate developer packages
  const [isPwaZipping, setIsPwaZipping] = useState(false);
  const [isApkZipping, setIsApkZipping] = useState(false);
  const [isBridgeZipping, setIsBridgeZipping] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-zihjyvklhvexqsiurcbesl-460068613392.asia-southeast1.run.app';

  const handleVersionClick = () => {
    if (developerMode) {
      setMessage({ text: 'Mod Pembangun sudah aktif dalam sesi ini.', type: 'success' });
      return;
    }
    const nextCount = devTapCount + 1;
    setDevTapCount(nextCount);
    if (nextCount >= 7) {
      setDevTapCount(0);
      onToggleDeveloperMode?.(true);
      setMessage({
        text: '🔓 Mod Pembangun telah diaktifkan! Tab Android APK & Bridge kini boleh diakses.',
        type: 'success',
      });
    } else if (nextCount >= 3) {
      setMessage({
        text: `Ketik ${7 - nextCount} kali lagi untuk mengaktifkan Mod Pembangun.`,
        type: 'success',
      });
    }
  };

  const handleDownloadPwaZip = async () => {
    try {
      setIsPwaZipping(true);
      const zipBlob = await generatePurePwaZip({ appUrl, appName: 'MYSMART SURF' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'MYSMART_SURF_PWA_PACKAGE.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setMessage({ text: 'Pakej PWA (ZIP) berjaya dimuat turun!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: 'Gagal memuat turun PWA: ' + err.message, type: 'error' });
    } finally {
      setIsPwaZipping(false);
    }
  };

  const handleDownloadApkZip = async () => {
    try {
      setIsApkZipping(true);
      const zipBlob = await generateApkPackageZip({
        appUrl,
        appName: 'MYSMART SURF',
        packageName: 'com.mysmartsurf.parental',
        versionName: '2.5.0',
      });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'MYSMART_SURF_APK_PACKAGE.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setMessage({ text: 'Pakej Android APK Builder (ZIP) berjaya dimuat turun!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: 'Gagal memuat turun APK: ' + err.message, type: 'error' });
    } finally {
      setIsApkZipping(false);
    }
  };

  const handleDownloadBridgeZip = async () => {
    try {
      setIsBridgeZipping(true);
      const zipBlob = await generateBridgeNativeZip({
        appUrl,
        appName: 'MYSMART SURF',
        packageName: 'com.mysmartsurf.parental',
        versionName: '2.5.0',
      });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'MYSMART_SURF_BRIDGE_NATIVE.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setMessage({ text: 'Pakej Android Bridge & Source (ZIP) berjaya dimuat turun!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: 'Gagal memuat turun Bridge: ' + err.message, type: 'error' });
    } finally {
      setIsBridgeZipping(false);
    }
  };

  const handleExportData = async () => {
    try {
      const [users, screenTime, appRules, browserRules, internet, schedules, activities, notifs, security] =
        await Promise.all([
          dbGetAll('users'),
          dbGetAll('screenTime'),
          dbGetAll('appRules'),
          dbGetAll('browserRules'),
          dbGetAll('internet'),
          dbGetAll('schedules'),
          dbGetAll('activities'),
          dbGetAll('notifications'),
          dbGetAll('security'),
        ]);

      const exportObj = {
        app: 'MYSMART SURF',
        version: '2.4.0',
        exportedAt: new Date().toISOString(),
        data: {
          users,
          screenTime,
          appRules,
          browserRules,
          internet,
          schedules,
          activities,
          notifications: notifs,
          security,
        },
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `mysmartsurf_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setMessage({ text: 'Sandaran data berjaya dimuat turun (JSON).', type: 'success' });
    } catch (e: any) {
      setMessage({ text: 'Gagal mengeksport data: ' + e.message, type: 'error' });
    }
  };

  const handleResetClick = () => {
    setPendingAction('reset');
    setShowAuthModal(true);
  };

  const handleUnlockDevClick = () => {
    setPendingAction('unlock_dev');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    if (pendingAction === 'reset') {
      await onResetAllData();
      setMessage({ text: 'Semua data telah berjaya ditetapkan semula ke nilai asal.', type: 'success' });
    } else if (pendingAction === 'unlock_dev') {
      onToggleDeveloperMode?.(true);
      setMessage({
        text: '🔓 Mod Pembangun telah diaktifkan! Tab Android APK & Bridge kini dibuka.',
        type: 'success',
      });
    }
    setPendingAction(null);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">TETAPAN & PENGURUSAN DATA</h2>
            <p className="text-xs text-slate-400">
              Konfigurasi umum, sandaran pangkalan data IndexedDB, dan pilihan paparan.
            </p>
          </div>
        </div>

        {/* App Info Badge (Clickable 7x for Developer Mode) */}
        <div
          onClick={handleVersionClick}
          className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all select-none cursor-pointer ${
            developerMode
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 hover:border-amber-500/50'
              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
          title="Ketik pada nombor versi 7 kali untuk mengaktifkan Mod Pembangun"
        >
          <div>
            <p className="font-bold text-white flex items-center gap-2">
              MYSMART SURF — Android Parental Control
              {developerMode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DEV UNLOCKED
                </span>
              )}
            </p>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>Versi 2.5.0 (PWA + Android APK Native Bridge Edition)</span>
              {devTapCount > 0 && !developerMode && (
                <span className="text-amber-400 font-bold">({7 - devTapCount} ketikan lagi)</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              OFFLINE-FIRST ACTIVE
            </span>
            {!developerMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnlockDevClick();
                }}
                className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                title="Buka mod pembangun menggunakan kata laluan"
              >
                <Code2 className="w-3 h-3 text-amber-400" />
                Mod Pembangun
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DEVELOPER HUB CARD - ONLY VISIBLE WHEN DEVELOPER MODE IS ACTIVATED */}
      {developerMode && (
        <div className="bg-gradient-to-br from-[#12161F] to-[#171B26] border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#252A38]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Mod Pembangun (Developer Mode) Aktif
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    DEV ACCESS
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Menu Android APK & Bridge disembunyikan daripada paparan pengguna biasa. Anda boleh memuat turun pakej berasingan di bawah.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate?.('native_apk')}
                className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka Tab Penuh APK & Bridge
              </button>
              <button
                onClick={() => onToggleDeveloperMode?.(false)}
                className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Kunci mod pembangun untuk menyembunyikan menu daripada pengguna"
              >
                <EyeOff className="w-3.5 h-3.5" />
                Kunci & Sembunyikan
              </button>
            </div>
          </div>

          {/* 3 SEPARATE DOWNLOAD PACKAGES */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Muat Turun Berasingan (Separate Packages):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* PWA Download */}
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      PWA
                    </span>
                    <Globe className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h5 className="text-xs font-bold text-white">1. PWA Web Package</h5>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Fail HTML, JS, CSS, Web Manifest, SW, dan tetapan Netlify/GitHub.
                  </p>
                </div>
                <button
                  onClick={handleDownloadPwaZip}
                  disabled={isPwaZipping}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPwaZipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Muat Turun PWA (ZIP)
                </button>
              </div>

              {/* APK Download */}
              <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      APK BUILDER
                    </span>
                    <Smartphone className="w-4 h-4 text-blue-400" />
                  </div>
                  <h5 className="text-xs font-bold text-white">2. Android APK Package</h5>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Fail pembungkus APK (HTML2APK / Web2APK / Cordova) berserta config.xml.
                  </p>
                </div>
                <button
                  onClick={handleDownloadApkZip}
                  disabled={isApkZipping}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isApkZipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Muat Turun APK (ZIP)
                </button>
              </div>

              {/* Bridge Download */}
              <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                      BRIDGE SOURCE
                    </span>
                    <Cpu className="w-4 h-4 text-purple-400" />
                  </div>
                  <h5 className="text-xs font-bold text-white">3. Native Bridge & Java</h5>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Kod sumber Java WebView Interface, Device Admin, dan skrip ADB.
                  </p>
                </div>
                <button
                  onClick={handleDownloadBridgeZip}
                  disabled={isBridgeZipping}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isBridgeZipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Muat Turun Bridge (ZIP)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Display & Appearance */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Tema & Paparan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-200">Mod Gelap / Cerah</p>
            <p className="text-[11px] text-slate-400">
              Pilih antara tema gelap kontras tinggi atau mod cerah untuk keselesaan mata.
            </p>
          </div>
          <button
            onClick={onToggleTheme}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            {darkMode ? 'Mod Gelap Aktif' : 'Mod Cerah Aktif'}
          </button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sky-400">
          <Database className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Sandaran & Pemulihan (Backup & Export)</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Eksport semua peraturan aplikasi, jadual waktu, log aktiviti, dan had masa ke fail JSON untuk disimpan atau dipindahkan ke peranti lain.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleExportData}
            className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Eksport Sandaran Pangkalan Data (JSON)
          </button>
        </div>
      </div>

      {/* Factory Reset */}
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Zon Bahaya: Tetapkan Semula Data</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Memadamkan semua rekod aktiviti, memulihkan had masa kepada nilai asal, dan memulakan semula persediaan awal. Tindakan ini memerlukan kata laluan ibu bapa.
        </p>

        <button
          onClick={handleResetClick}
          className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Semua Data Aplikasi
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Parent Auth Modal */}
      <ParentAuthModal
        isOpen={showAuthModal}
        title="Pengesahan Tetapan Semula Data"
        description="Sila masukkan kata laluan ibu bapa untuk mengesahkan pemadaman dan penetapan semula data."
        onSuccess={handleAuthSuccess}
        onCancel={() => {
          setShowAuthModal(false);
          setPendingAction(null);
        }}
      />
    </div>
  );
};
