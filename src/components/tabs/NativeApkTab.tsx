/**
 * MYSMART SURF - Android APK & Native Bridge Diagnostic & Builder Tab
 */

import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Terminal,
  ShieldCheck,
  Cpu,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Play,
  Download,
  FileCode,
  Layers,
  Globe,
  CheckCircle,
  Zap,
  Package,
  FolderArchive,
  Loader2,
  FileText,
  Image as ImageIcon,
  Lock,
  ArrowLeft,
  EyeOff,
} from 'lucide-react';
import { AndroidBridgeStatus } from '../../types';
import { androidBridge } from '../../services/androidBridge';
import { ANDROID_NATIVE_FILES } from '../../androidNativeCode';
import {
  generatePurePwaZip,
  generateApkPackageZip,
  generateBridgeNativeZip,
} from '../../utils/pwaZipPackager';
import { ParentAuthModal } from '../ParentAuthModal';

interface NativeApkTabProps {
  bridgeStatus: AndroidBridgeStatus;
  onRefreshBridge: () => void;
  developerMode?: boolean;
  onToggleDeveloperMode?: (enabled?: boolean) => void;
  onNavigate?: (tab: any) => void;
}

export const NativeApkTab: React.FC<NativeApkTabProps> = ({
  bridgeStatus,
  onRefreshBridge,
  developerMode = false,
  onToggleDeveloperMode,
  onNavigate,
}) => {
  const [activeFileKey, setActiveFileKey] = useState<string>('pwaManifest');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // 1. Pure PWA Download State
  const [isPwaZipping, setIsPwaZipping] = useState<boolean>(false);
  const [pwaZipSuccess, setPwaZipSuccess] = useState<boolean>(false);

  // 2. Android APK Builder Bundle Download State
  const [isApkZipping, setIsApkZipping] = useState<boolean>(false);
  const [apkZipSuccess, setApkZipSuccess] = useState<boolean>(false);

  // 3. Android Native Bridge Source Download State
  const [isBridgeZipping, setIsBridgeZipping] = useState<boolean>(false);
  const [bridgeZipSuccess, setBridgeZipSuccess] = useState<boolean>(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-zihjyvklhvexqsiurcbesl-460068613392.asia-southeast1.run.app';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Muat Turun Pakej 1: PWA Web Sahaja
  const handleDownloadPurePwaZip = async () => {
    try {
      setIsPwaZipping(true);
      const zipBlob = await generatePurePwaZip({
        appUrl,
        appName: 'MYSMART SURF',
      });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'MYSMART_SURF_PWA_PACKAGE.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setPwaZipSuccess(true);
      setTimeout(() => setPwaZipSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to generate Pure PWA ZIP package:', err);
    } finally {
      setIsPwaZipping(false);
    }
  };

  // Muat Turun Pakej 2: Android APK Builder (HTML2APK / Web2APK)
  const handleDownloadApkPackageZip = async () => {
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
      setApkZipSuccess(true);
      setTimeout(() => setApkZipSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to generate APK package:', err);
    } finally {
      setIsApkZipping(false);
    }
  };

  // Muat Turun Pakej 3: Android Native Bridge & Source Code
  const handleDownloadBridgeNativeZip = async () => {
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
      setBridgeZipSuccess(true);
      setTimeout(() => setBridgeZipSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to generate Native Bridge package:', err);
    } finally {
      setIsBridgeZipping(false);
    }
  };

  const handleTestBridge = (action: string) => {
    let result = '';
    if (action === 'vibrate') {
      androidBridge.vibrate(200);
      result = 'Bridge action: vibrate(200ms) dispatched.';
    } else if (action === 'notify') {
      androidBridge.showNativeNotification(
        'MYSMART SURF Ujian',
        'Ujian sambungan Android Native Bridge berjaya!'
      );
      result = 'Bridge action: showNativeNotification dispatched.';
    } else if (action === 'lock_task') {
      androidBridge.startLockTask();
      result = 'Bridge action: startLockTask() dispatched.';
    }
    setTestOutput(result);
  };

  const downloadFile = (filename: string, content: string, type = 'application/json') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const filesMap: Record<string, { title: string; category: string; filename: string; code: string }> = {
    pwaManifest: {
      title: 'manifest.json',
      category: 'PWA / Web App',
      filename: 'public/manifest.json',
      code: ANDROID_NATIVE_FILES.pwaManifest,
    },
    serviceWorker: {
      title: 'sw.js',
      category: 'PWA / Web App',
      filename: 'public/sw.js',
      code: ANDROID_NATIVE_FILES.serviceWorker,
    },
    assetLinks: {
      title: 'assetlinks.json',
      category: 'PWA / Web App',
      filename: 'public/.well-known/assetlinks.json',
      code: ANDROID_NATIVE_FILES.assetLinks,
    },
    html2apkGuide: {
      title: 'HTML2APK_Guide.txt',
      category: 'APK Wrapper',
      filename: 'HTML2APK_CONFIGURATION_GUIDE.txt',
      code: ANDROID_NATIVE_FILES.html2apkGuide,
    },
    manifest: {
      title: 'AndroidManifest.xml',
      category: 'Native Android',
      filename: 'app/src/main/AndroidManifest.xml',
      code: ANDROID_NATIVE_FILES.manifest,
    },
    webInterface: {
      title: 'WebAppInterface.java',
      category: 'Native Android',
      filename: 'app/src/main/java/com/mysmartsurf/bridge/WebAppInterface.java',
      code: ANDROID_NATIVE_FILES.webAppInterface,
    },
    adminReceiver: {
      title: 'DeviceAdminReceiver.java',
      category: 'Native Android',
      filename: 'app/src/main/java/com/mysmartsurf/ParentalControlDeviceAdminReceiver.java',
      code: ANDROID_NATIVE_FILES.deviceAdminReceiver,
    },
    deviceAdminPolicy: {
      title: 'device_admin_policies.xml',
      category: 'Native Android',
      filename: 'app/src/main/res/xml/device_admin_policies.xml',
      code: ANDROID_NATIVE_FILES.deviceAdminXml,
    },
    buildGradle: {
      title: 'build.gradle.kts',
      category: 'Native Android',
      filename: 'app/build.gradle.kts',
      code: ANDROID_NATIVE_FILES.buildGradle,
    },
    adbCommands: {
      title: 'adb_setup.sh',
      category: 'DevOps & ADB',
      filename: 'scripts/adb_device_owner_setup.sh',
      code: ANDROID_NATIVE_FILES.adbCommands,
    },
  };

  const activeFile = filesMap[activeFileKey] || filesMap.pwaManifest;

  // JIKA BUKAN MOD PEMBANGUN: SEKAT DAN SEMBUNYIKAN
  if (!developerMode) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/10">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider font-mono">
            Akses Khas Pembangun Sahaja
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Menu Android APK & Native Bridge Disembunyikan
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
            Menu ini telah disembunyikan daripada tetapan umum untuk pengguna terpasang (PWA / peranti anak) bagi mengekalkan keselamatan sistem dan mengelakkan pengubahsuaian tanpa kebenaran.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#11141A] border border-[#1E222C] text-left text-xs text-gray-400 space-y-3 max-w-md mx-auto">
          <p className="font-semibold text-gray-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Cara Membuka Akses Pembangun:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-gray-400">
            <li>Buka tab <strong className="text-gray-200">Settings</strong> dan ketik pada nombor versi aplikasi 7 kali berturut-turut, atau</li>
            <li>Klik butang di bawah dan masukkan kata laluan ibu bapa untuk membuka Mod Pembangun serta-merta.</li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="py-2.5 px-5 rounded-xl bg-[#1A1D23] hover:bg-[#252A36] text-gray-200 border border-[#2D3340] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </button>
          <button
            onClick={() => setShowAuthModal(true)}
            className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            Buka Kunci Mod Pembangun
          </button>
        </div>

        <ParentAuthModal
          isOpen={showAuthModal}
          title="Pengesahan Mod Pembangun"
          description="Sila masukkan kata laluan ibu bapa untuk mengaktifkan akses Mod Pembangun."
          onSuccess={() => {
            setShowAuthModal(false);
            onToggleDeveloperMode?.(true);
          }}
          onCancel={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* TOP DEVELOPER CONTROL BAR */}
      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] uppercase border border-amber-500/30">
            MOD PEMBANGUN AKTIF
          </span>
          <div>
            <p className="font-bold text-amber-200">Portal Pembangun & Pakej Muat Turun Berasingan</p>
            <p className="text-[11px] text-amber-300/70">
              Menu ini hanya kelihatan kepada pembangun. Pengguna biasa dan aplikasi terpasang tidak dapat melihat bahagian ini.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              onToggleDeveloperMode?.(false);
              onNavigate?.('dashboard');
            }}
            className="py-2 px-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Kunci mod pembangun dan sembunyikan daripada pengguna biasa"
          >
            <EyeOff className="w-3.5 h-3.5" />
            Kunci & Sembunyikan Menu Ini
          </button>
        </div>
      </div>

      {/* 1. SEPARATE DOWNLOAD PACKAGES GRID (PWA, APK, BRIDGE NATIVE) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
              Pakej Muat Turun Berasingan (Developer Packages)
            </h2>
            <p className="text-xs text-gray-400">
              Muat turun pakej mengikut keperluan pembangunan anda secara berasingan:
            </p>
          </div>
          <button
            onClick={onRefreshBridge}
            className="py-2 px-3 rounded-xl bg-[#1A1D23] hover:bg-[#252A36] text-[#E2E8F0] border border-[#2D3340] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Imbas Status Peranti
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PACKAGE 1: PWA ONLY */}
          <div className="bg-[#11141A] border border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-xl hover:border-emerald-500/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  PWA STANDALONE
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">1. PWA Web Package (ZIP)</h3>
                <p className="text-[11px] font-mono text-emerald-400/80">MYSMART_SURF_PWA_PACKAGE.zip</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pakej aplikasi web progresif offline-first lengkap termasuk fail HTML, JS, CSS, Web Manifest, Service Worker, HD Icons, serta fail konfigurasi pelayan untuk Netlify & GitHub Pages.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-[#1A1D23] text-gray-400 px-2 py-0.5 rounded-md border border-[#242833]">sw.js</span>
                <span className="text-[10px] bg-[#1A1D23] text-gray-400 px-2 py-0.5 rounded-md border border-[#242833]">manifest.json</span>
                <span className="text-[10px] bg-[#1A1D23] text-gray-400 px-2 py-0.5 rounded-md border border-[#242833]">Netlify / GitHub</span>
              </div>
            </div>

            <button
              onClick={handleDownloadPurePwaZip}
              disabled={isPwaZipping}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer transform active:scale-95 disabled:opacity-50"
            >
              {isPwaZipping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Membina PWA ZIP...
                </>
              ) : pwaZipSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  PWA Dimuat Turun!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Muat Turun PWA Sahaja
                </>
              )}
            </button>
          </div>

          {/* PACKAGE 2: ANDROID APK BUILDER BUNDLE */}
          <div className="bg-[#11141A] border border-blue-500/30 rounded-3xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-xl hover:border-blue-500/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-600/20">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600/10 text-blue-400 border border-blue-600/20 font-mono">
                  APK BUILDER READY
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">2. Android APK Package (ZIP)</h3>
                <p className="text-[11px] font-mono text-blue-400/80">MYSMART_SURF_APK_PACKAGE.zip</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pakej sedia guna untuk perisian penukar APK (HTML2APK, Web2APK, Bubblewrap, atau Cordova) lengkap dengan <code className="text-blue-300">config.xml</code>, <code className="text-blue-300">app-config.json</code>, ikon pelbagai saiz, dan panduan penukaran.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-[#1A1D23] text-gray-400 px-2 py-0.5 rounded-md border border-[#242833]">config.xml</span>
                <span className="text-[10px] bg-[#1A1D23] text-gray-400 px-2 py-0.5 rounded-md border border-[#242833]">app-config.json</span>
                <span className="text-[10px] bg-[#1A1D23] text-gray-400 px-2 py-0.5 rounded-md border border-[#242833]">HTML2APK Guide</span>
              </div>
            </div>

            <button
              onClick={handleDownloadApkPackageZip}
              disabled={isApkZipping}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer transform active:scale-95 disabled:opacity-50"
            >
              {isApkZipping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Membina APK Bundle...
                </>
              ) : apkZipSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  APK Package Dimuat Turun!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Muat Turun Pakej APK
                </>
              )}
            </button>
          </div>

          {/* PACKAGE 3: ANDROID NATIVE BRIDGE & SOURCE */}
          <div className="bg-[#11141A] border border-purple-500/30 rounded-3xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-xl hover:border-purple-500/50 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                  JAVA SOURCE & ADB
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">3. Android Bridge & Source (ZIP)</h3>
                <p className="text-[11px] font-mono text-purple-400/80">MYSMART_SURF_BRIDGE_NATIVE.zip</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Kod sumber native Java untuk Android Studio, termasuk <code className="text-purple-300">WebAppInterface.java</code>, <code className="text-purple-300">DeviceAdminReceiver.java</code>, fail XML dasar pentadbir, Gradle build, dan skrip automasi ADB Device Owner.
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-[#1A1D23] text-gray-400 px-2 py-0.5 rounded-md border border-[#242833]">WebAppInterface</span>
                <span className="text-[10px] bg-[#1A1D23] text-gray-400 px-2 py-0.5 rounded-md border border-[#242833]">DeviceAdmin</span>
                <span className="text-[10px] bg-[#1A1D23] text-gray-400 px-2 py-0.5 rounded-md border border-[#242833]">ADB Scripts</span>
              </div>
            </div>

            <button
              onClick={handleDownloadBridgeNativeZip}
              disabled={isBridgeZipping}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer transform active:scale-95 disabled:opacity-50"
            >
              {isBridgeZipping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Membina Bridge Source...
                </>
              ) : bridgeZipSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Bridge Source Dimuat Turun!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Muat Turun Bridge & Native
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. PWA TO APK WRAPPER SETUP CARD (FOR HTML2APK / WEB2APK) */}
      <div className="bg-[#11141A] border border-[#1E222C] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E222C]">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Konfigurasi Pantas Penukar PWA ke APK
            </h3>
            <p className="text-xs text-gray-400">
              Gunakan parameter di bawah semasa memasukkan tetapan di penjana APK:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadFile('manifest.json', ANDROID_NATIVE_FILES.pwaManifest)}
              className="py-2 px-3.5 rounded-xl bg-[#1A1D23] hover:bg-[#252A36] text-gray-200 border border-[#2D3340] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              manifest.json
            </button>
            <button
              onClick={() => downloadFile('sw.js', ANDROID_NATIVE_FILES.serviceWorker, 'application/javascript')}
              className="py-2 px-3.5 rounded-xl bg-[#1A1D23] hover:bg-[#252A36] text-gray-200 border border-[#2D3340] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              sw.js
            </button>
          </div>
        </div>

        {/* Live URL Copy Box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
            1. Web App URL (Masukkan ke dalam APK Wrapper):
          </label>
          <div className="flex items-center gap-2 p-3 bg-[#1A1D23] rounded-xl border border-[#232731]">
            <Globe className="w-4 h-4 text-blue-400 shrink-0" />
            <input
              type="text"
              readOnly
              value={appUrl}
              className="bg-transparent text-xs font-mono text-white flex-1 outline-none select-all"
            />
            <button
              onClick={() => copyToClipboard(appUrl, 'app_url')}
              className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              {copiedKey === 'app_url' ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Disalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Salin URL
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configuration Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#1A1D23] border border-[#232731]">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">App Name</p>
            <p className="text-sm font-bold text-white mt-0.5">MYSMART SURF</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#1A1D23] border border-[#232731]">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Package ID</p>
            <p className="text-xs font-mono font-bold text-blue-400 mt-0.5 truncate">com.mysmartsurf.parental</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#1A1D23] border border-[#232731]">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Orientation</p>
            <p className="text-sm font-bold text-white mt-0.5">Portrait Only</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#1A1D23] border border-[#232731]">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Theme & BG Color</p>
            <p className="text-xs font-mono font-bold text-white mt-0.5">#2563EB / #090A0C</p>
          </div>
        </div>

        {/* Package Contents Breakdown */}
        <div className="bg-[#1A1D23]/70 rounded-2xl p-5 border border-[#232731] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              Fail-fail PWA (Progressive Web App) Rasmi:
            </h4>
            <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              PWA Standalone & Offline Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#11141A] border border-[#1E222C] flex items-start gap-2.5">
              <FileCode className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">manifest.json</p>
                <p className="text-[11px] text-gray-400">PWA Manifest, tema #090A0C & icon map</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#11141A] border border-[#1E222C] flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">sw.js</p>
                <p className="text-[11px] text-gray-400">Service Worker cache v2.5.0 (Offline-first)</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#11141A] border border-[#1E222C] flex items-start gap-2.5">
              <FileCode className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">index.html</p>
                <p className="text-[11px] text-gray-400">Pintu Masuk Web Standalone PWA</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#11141A] border border-[#1E222C] flex items-start gap-2.5">
              <ImageIcon className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">icons/ (Raster & Vektor)</p>
                <p className="text-[11px] text-gray-400">192x192, 512x512, Maskable, Apple Touch</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#11141A] border border-[#1E222C] flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">.well-known/assetlinks.json</p>
                <p className="text-[11px] text-gray-400">Pengesahan TWA / Digital Asset Links</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#11141A] border border-[#1E222C] flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">GitHub Pages & Actions</p>
                <p className="text-[11px] text-gray-400">.github/workflows, .nojekyll & 404.html</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#11141A] border border-[#1E222C] flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">_redirects & netlify.toml</p>
                <p className="text-[11px] text-gray-400">Netlify SPA Routing 200 & Build Config</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#11141A] border border-[#1E222C] flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">_headers & README.md</p>
                <p className="text-[11px] text-gray-400">Panduan Lengkap GitHub & Netlify Deploy</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <p className="text-gray-300 text-[11px]">
                <strong className="text-white">GitHub & Netlify Ready:</strong> Serasi dengan <span className="text-emerald-400 font-mono">GitHub Pages (Actions)</span> &amp; <span className="text-blue-400 font-mono">Netlify Drop</span> tanpa sebarang ralat laluan 404.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded shrink-0">
              CI/CD Auto-Deploy
            </span>
          </div>
        </div>
      </div>

      {/* 3. DIAGNOSTICS & SYSTEM BRIDGE STATUS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-[#11141A] border border-[#1E222C] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold">JavaScript Bridge Status</p>
            <p className="text-sm font-bold text-white mt-1">
              {bridgeStatus.isNativeBridgeAvailable ? 'Aktif (Window.AndroidBridge)' : 'Mod PWA Offline'}
            </p>
          </div>
          {bridgeStatus.isNativeBridgeAvailable ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/10 text-blue-400">
              PWA Mode
            </span>
          )}
        </div>

        <div className="bg-[#11141A] border border-[#1E222C] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold">Device Admin Receiver</p>
            <p className="text-sm font-bold text-white mt-1">
              {bridgeStatus.deviceAdminGranted ? 'Dibenarkan (Granted)' : 'Diperlukan untuk APK'}
            </p>
          </div>
          {bridgeStatus.deviceAdminGranted ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400">
              Siap Sedia
            </span>
          )}
        </div>

        <div className="bg-[#11141A] border border-[#1E222C] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold">UsageStats & VpnService</p>
            <p className="text-sm font-bold text-white mt-1">
              {bridgeStatus.usageStatsGranted ? 'Beroperasi' : 'Tersedia dalam APK'}
            </p>
          </div>
          {bridgeStatus.usageStatsGranted ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          )}
        </div>
      </div>

      {/* 4. INTERACTIVE BRIDGE ACTIONS TESTER */}
      <div className="bg-[#11141A] border border-[#1E222C] rounded-3xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Play className="w-4 h-4 text-blue-400" />
          Uji Sambungan Android Bridge Secara Langsung
        </h3>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTestBridge('vibrate')}
            className="py-2 px-3.5 rounded-xl bg-[#1A1D23] hover:bg-[#252A36] text-xs font-semibold text-[#E2E8F0] border border-[#2D3340] cursor-pointer"
          >
            Uji Getaran (Vibrate 200ms)
          </button>
          <button
            onClick={() => handleTestBridge('notify')}
            className="py-2 px-3.5 rounded-xl bg-[#1A1D23] hover:bg-[#252A36] text-xs font-semibold text-[#E2E8F0] border border-[#2D3340] cursor-pointer"
          >
            Uji Notifikasi Sistem
          </button>
          <button
            onClick={() => handleTestBridge('lock_task')}
            className="py-2 px-3.5 rounded-xl bg-[#1A1D23] hover:bg-[#252A36] text-xs font-semibold text-[#E2E8F0] border border-[#2D3340] cursor-pointer"
          >
            Uji Kiosk Mode (startLockTask)
          </button>
        </div>

        {testOutput && (
          <div className="p-3 rounded-xl bg-[#090A0C] border border-[#1E222C] font-mono text-xs text-blue-400 animate-in fade-in">
            {testOutput}
          </div>
        )}
      </div>

      {/* 5. ADB COMMANDS FOR DEVICE OWNER SETUP */}
      <div className="bg-[#11141A] border border-[#1E222C] rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Terminal className="w-5 h-5" />
          <h3 className="text-base font-bold text-white uppercase tracking-tight">
            Arahan ADB untuk Menyediakan Device Owner (Anti-Tamper Mutlak)
          </h3>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Untuk perlindungan tidak boleh dinyahpasang dan kawalan skrin penuh tanpa kebenaran berulang, jalankan arahan ADB ini selepas memasang APK ke peranti anak:
        </p>

        <div className="space-y-3">
          {[
            {
              label: '1. Tetapkan Aplikasi sebagai Device Owner (Kiosk & Anti-Uninstall Mutlak):',
              cmd: 'adb shell dpm set-device-owner com.mysmartsurf/.ParentalControlDeviceAdminReceiver',
            },
            {
              label: '2. Benarkan Akses Penggunaan Aplikasi (Usage Stats):',
              cmd: 'adb shell pm grant com.mysmartsurf android.permission.PACKAGE_USAGE_STATS',
            },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-[11px] font-semibold text-gray-300">{item.label}</p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#090A0C] border border-[#1E222C] font-mono text-xs text-blue-300">
                <span className="truncate mr-2">{item.cmd}</span>
                <button
                  onClick={() => copyToClipboard(item.cmd, `adb_${idx}`)}
                  className="p-1.5 rounded-lg bg-[#1A1D23] hover:bg-[#252A36] text-gray-300 cursor-pointer shrink-0 border border-[#2D3340]"
                >
                  {copiedKey === `adb_${idx}` ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. EMBEDDED PWA & NATIVE CODE VIEWER */}
      <div className="bg-[#11141A] border border-[#1E222C] rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-blue-400">
            <Code2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              Pustaka Fail PWA & Sumber Android APK
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadFile(activeFile.title, activeFile.code, 'text/plain')}
              className="py-2 px-3.5 rounded-xl bg-[#1A1D23] hover:bg-[#252A36] text-gray-200 border border-[#2D3340] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Muat Turun Fail
            </button>
            <button
              onClick={() => copyToClipboard(activeFile.code, activeFileKey)}
              className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {copiedKey === activeFileKey ? (
                <>
                  <Check className="w-4 h-4" /> Disalin!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Salin Kod
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Category Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-[#1E222C] pb-3">
          {Object.entries(filesMap).map(([key, file]) => (
            <button
              key={key}
              onClick={() => setActiveFileKey(key)}
              className={`py-1.5 px-3 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                activeFileKey === key
                  ? 'bg-blue-600 text-white font-bold shadow-md'
                  : 'bg-[#1A1D23] text-gray-400 hover:text-white border border-[#232731]'
              }`}
            >
              <span className="text-[9px] block text-gray-400 font-sans">{file.category}</span>
              {file.title}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-gray-500 font-mono">{activeFile.filename}</p>

        {/* Code Content */}
        <div className="max-h-96 overflow-y-auto rounded-2xl bg-[#090A0C] p-4 border border-[#1E222C] font-mono text-xs text-gray-300 leading-relaxed">
          <pre>{activeFile.code}</pre>
        </div>
      </div>
    </div>
  );
};

