/**
 * MYSMART SURF - Manual App Addition by Installed Device Component
 * Ruangan Tambah App Secara Manual Melalui Pilih Peranti Yang Di-installkan
 */

import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Plus,
  Search,
  CheckCircle2,
  Ban,
  Clock,
  Shield,
  X,
  AlertCircle,
  Sparkles,
  Info,
  ChevronDown,
  Layers,
  Check,
  Gamepad2,
  Tv,
  Share2,
  BookOpen,
  Wrench,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { AppRule } from '../types';

export interface InstalledDeviceProfile {
  id: string;
  name: string;
  model: string;
  type: 'phone' | 'tablet' | 'local';
  userOwner: string;
  androidVersion: string;
  status: 'online' | 'offline' | 'restricted';
}

export const DEFAULT_INSTALLED_DEVICES: InstalledDeviceProfile[] = [
  {
    id: 'dev_local',
    name: 'Peranti Semasa Ini (Local Active Container)',
    model: 'Android Webview / Standalone Container',
    type: 'local',
    userOwner: 'Pengguna Semasa (Peranti Ini)',
    androidVersion: 'Android PWA / Native Host',
    status: 'online',
  },
];

export interface DeviceExamplePreset {
  id: string;
  name: string;
  userOwner: string;
  model: string;
  type: 'phone' | 'tablet';
}

export const EXAMPLE_DEVICE_PRESETS: DeviceExamplePreset[] = [
  {
    id: 'ex_tablet_adam',
    name: 'Tablet Anak 1 — Samsung Galaxy Tab A9',
    userOwner: 'Adam',
    model: 'Samsung Galaxy Tab A9 (Android 14)',
    type: 'tablet',
  },
  {
    id: 'ex_phone_adam',
    name: 'Telefon Anak 1 — Xiaomi Redmi 12',
    userOwner: 'Adam',
    model: 'Xiaomi Redmi 12 (Android 13)',
    type: 'phone',
  },
  {
    id: 'ex_phone_sara',
    name: 'Telefon Anak 2 — Oppo A58',
    userOwner: 'Sara',
    model: 'Oppo A58 (Android 13)',
    type: 'phone',
  },
];

// Predefined catalog of popular installed Android apps that parents frequently block/limit
interface CatalogApp {
  appName: string;
  packageName: string;
  category: 'games' | 'social' | 'video' | 'productivity' | 'education' | 'utility';
  recommendedAction: 'block' | 'limit';
  defaultLimit?: number;
  description: string;
}

const POPULAR_APPS_CATALOG: CatalogApp[] = [
  // Games
  { appName: 'Roblox', packageName: 'com.roblox.client', category: 'games', recommendedAction: 'limit', defaultLimit: 60, description: 'Platform permainan dalam talian kanak-kanak' },
  { appName: 'Mobile Legends: Bang Bang', packageName: 'com.mobile.legends', category: 'games', recommendedAction: 'limit', defaultLimit: 60, description: 'Permainan MOBA berbilang pemain' },
  { appName: 'Garena Free Fire', packageName: 'com.dts.freefireth', category: 'games', recommendedAction: 'block', description: 'Permainan Battle Royale aksi pantas' },
  { appName: 'PUBG Mobile', packageName: 'com.tencent.ig', category: 'games', recommendedAction: 'block', description: 'Permainan Battle Royale penembak' },
  { appName: 'Minecraft', packageName: 'com.mojang.minecraftpe', category: 'games', recommendedAction: 'limit', defaultLimit: 90, description: 'Permainan bina dunia & kretiviti' },
  { appName: 'Brawl Stars', packageName: 'com.supercell.brawlstars', category: 'games', recommendedAction: 'limit', defaultLimit: 60, description: 'Permainan aksi strategi' },
  { appName: 'Subway Surfers', packageName: 'com.kiloo.subwaysurf', category: 'games', recommendedAction: 'limit', defaultLimit: 45, description: 'Permainan larian tanpa henti' },
  { appName: 'Genshin Impact', packageName: 'com.miHoYo.GenshinImpact', category: 'games', recommendedAction: 'limit', defaultLimit: 60, description: 'Permainan RPG dunia terbuka grafik tinggi' },
  
  // Social
  { appName: 'TikTok', packageName: 'com.zhiliaoapp.musically', category: 'social', recommendedAction: 'block', description: 'Platform video pendek sosial' },
  { appName: 'TikTok Lite', packageName: 'com.zhiliaoapp.musically.go', category: 'social', recommendedAction: 'block', description: 'Versi ringan TikTok' },
  { appName: 'Instagram', packageName: 'com.instagram.android', category: 'social', recommendedAction: 'limit', defaultLimit: 45, description: 'Perkongsian gambar & Reels' },
  { appName: 'Snapchat', packageName: 'com.snapchat.android', category: 'social', recommendedAction: 'block', description: 'Mesej gambar pantas & penapis' },
  { appName: 'Discord', packageName: 'com.discord', category: 'social', recommendedAction: 'limit', defaultLimit: 60, description: 'Komuniti sembang audio & teks komuniti gamer' },
  { appName: 'Telegram', packageName: 'org.telegram.messenger', category: 'social', recommendedAction: 'limit', defaultLimit: 60, description: 'Aplikasi pemesejan & saluran' },
  { appName: 'Facebook', packageName: 'com.facebook.katana', category: 'social', recommendedAction: 'block', description: 'Media sosial' },
  { appName: 'Threads', packageName: 'com.instagram.barcelona', category: 'social', recommendedAction: 'limit', defaultLimit: 30, description: 'Platform perbualan teks' },

  // Video & Streaming
  { appName: 'Netflix', packageName: 'com.netflix.mediaclient', category: 'video', recommendedAction: 'limit', defaultLimit: 90, description: 'Penstriman filem & siri' },
  { appName: 'Disney+ Hotstar', packageName: 'in.startv.hotstar', category: 'video', recommendedAction: 'limit', defaultLimit: 90, description: 'Penstriman kartun Disney & filem' },
  { appName: 'Twitch', packageName: 'tv.twitch.android.app', category: 'video', recommendedAction: 'block', description: 'Penstriman siaran langsung permainan' },
  { appName: 'Bstation / Bilibili', packageName: 'com.bstar.intl', category: 'video', recommendedAction: 'limit', defaultLimit: 60, description: 'Penstriman anime & video' },
  { appName: 'Viu', packageName: 'com.vuclip.viu', category: 'video', recommendedAction: 'limit', defaultLimit: 60, description: 'Drama & rancangan hiburan' },

  // Shopping / Other
  { appName: 'Shopee', packageName: 'com.shopee.my', category: 'utility', recommendedAction: 'block', description: 'Aplikasi beli-belah dalam talian' },
  { appName: 'Lazada', packageName: 'com.lazada.android', category: 'utility', recommendedAction: 'block', description: 'Aplikasi e-dagang' },
  { appName: 'CapCut Video Editor', packageName: 'com.lemon.lvoverseas', category: 'productivity', recommendedAction: 'limit', defaultLimit: 60, description: 'Penyunting video TikTok' },
  { appName: 'Spotify Music', packageName: 'com.spotify.music', category: 'utility', recommendedAction: 'limit', defaultLimit: 120, description: 'Penstriman lagu & podcast' },
  { appName: 'Duolingo', packageName: 'com.duolingo', category: 'education', recommendedAction: 'limit', defaultLimit: 120, description: 'Belajar bahasa asing' },
];

interface AddAppManualSectionProps {
  existingAppRules: AppRule[];
  onRequestAddApp: (newApp: AppRule) => void;
  onClose?: () => void;
  selectedDeviceFilter?: string;
  onSelectDeviceFilter?: (deviceName: string) => void;
}

export const AddAppManualSection: React.FC<AddAppManualSectionProps> = ({
  existingAppRules,
  onRequestAddApp,
  onClose,
  selectedDeviceFilter,
  onSelectDeviceFilter,
}) => {
  // Device Selection State
  const [installedDevices, setInstalledDevices] = useState<InstalledDeviceProfile[]>(() => {
    try {
      const saved = localStorage.getItem('mysmartsurf_devices_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove previously pre-seeded dummy profiles (Tablet Anak 1, Telefon Anak 1, Telefon Anak 2)
          const filtered = parsed.filter(
            (d: any) =>
              d.id !== 'dev_tab_adam' &&
              d.id !== 'dev_phone_adam' &&
              d.id !== 'dev_phone_sara'
          );
          const hasLocal = filtered.some((d: any) => d.id === 'dev_local');
          const finalDevices = hasLocal
            ? filtered.map((d: any) =>
                d.id === 'dev_local'
                  ? {
                      ...DEFAULT_INSTALLED_DEVICES[0],
                      name: 'Peranti Semasa Ini (Local Active Container)',
                    }
                  : d
              )
            : [...DEFAULT_INSTALLED_DEVICES, ...filtered];
          return finalDevices;
        }
      }
    } catch {}
    return DEFAULT_INSTALLED_DEVICES;
  });

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    installedDevices[0]?.id || 'dev_local'
  );

  // New Device Add State
  const [showAddCustomDevice, setShowAddCustomDevice] = useState<boolean>(false);
  const [newDeviceName, setNewDeviceName] = useState<string>('');
  const [newDeviceOwner, setNewDeviceOwner] = useState<string>('');
  const [newDeviceType, setNewDeviceType] = useState<'phone' | 'tablet'>('phone');

  // Addition Mode: 'catalog' (quick pick) | 'custom' (manual form)
  const [mode, setMode] = useState<'catalog' | 'custom'>('catalog');

  // Search in catalog
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');

  // Manual Form State
  const [customAppName, setCustomAppName] = useState<string>('');
  const [customPackageName, setCustomPackageName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<
    'games' | 'social' | 'video' | 'productivity' | 'education' | 'utility'
  >('games');
  const [customAction, setCustomAction] = useState<'BLOCK' | 'LIMIT'>('BLOCK');
  const [customLimitMinutes, setCustomLimitMinutes] = useState<number>(60);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedDevice =
    installedDevices.find((d) => d.id === selectedDeviceId) || installedDevices[0] || DEFAULT_INSTALLED_DEVICES[0];

  const handleSaveCustomDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    const newDev: InstalledDeviceProfile = {
      id: `dev_${Date.now()}`,
      name: newDeviceName.trim(),
      model: `${newDeviceType === 'tablet' ? 'Tablet' : 'Telefon'} Android Peribadi`,
      type: newDeviceType,
      userOwner: newDeviceOwner.trim() || 'Anak',
      androidVersion: 'Android 14',
      status: 'online',
    };

    const updated = [...installedDevices, newDev];
    setInstalledDevices(updated);
    try {
      localStorage.setItem('mysmartsurf_devices_list', JSON.stringify(updated));
    } catch {}
    setSelectedDeviceId(newDev.id);
    if (onSelectDeviceFilter) onSelectDeviceFilter(newDev.name);
    setShowAddCustomDevice(false);
    setNewDeviceName('');
    setNewDeviceOwner('');
  };

  const handleApplyPreset = (preset: DeviceExamplePreset) => {
    const existing = installedDevices.find(
      (d) => d.name.toLowerCase() === preset.name.toLowerCase()
    );
    if (existing) {
      setSelectedDeviceId(existing.id);
      if (onSelectDeviceFilter) onSelectDeviceFilter(existing.name);
      setShowAddCustomDevice(false);
      return;
    }

    const newDev: InstalledDeviceProfile = {
      id: `dev_${Date.now()}_${preset.type}`,
      name: preset.name,
      model: preset.model,
      type: preset.type,
      userOwner: preset.userOwner,
      androidVersion: 'Android 14',
      status: 'online',
    };

    const updated = [...installedDevices, newDev];
    setInstalledDevices(updated);
    try {
      localStorage.setItem('mysmartsurf_devices_list', JSON.stringify(updated));
    } catch {}
    setSelectedDeviceId(newDev.id);
    if (onSelectDeviceFilter) onSelectDeviceFilter(newDev.name);
    setShowAddCustomDevice(false);
  };

  const handleDeleteCustomDevice = (e: React.MouseEvent, devId: string) => {
    e.stopPropagation();
    if (devId === 'dev_local') return;
    const updated = installedDevices.filter((d) => d.id !== devId);
    setInstalledDevices(updated);
    try {
      localStorage.setItem('mysmartsurf_devices_list', JSON.stringify(updated));
    } catch {}
    if (selectedDeviceId === devId) {
      const fallback = updated[0]?.id || 'dev_local';
      setSelectedDeviceId(fallback);
      if (onSelectDeviceFilter && updated[0]) {
        onSelectDeviceFilter(updated[0].name);
      }
    }
  };

  const handleAddFromCatalog = (catApp: CatalogApp, action: 'BLOCK' | 'LIMIT') => {
    const isAlreadyAdded = existingAppRules.some(
      (a) => a.packageName.toLowerCase() === catApp.packageName.toLowerCase()
    );

    const newRule: AppRule = {
      packageName: catApp.packageName,
      appName: catApp.appName,
      icon: catApp.category === 'games' ? 'gamepad-2' : catApp.category === 'video' ? 'video' : 'smartphone',
      category: catApp.category,
      blocked: action === 'BLOCK',
      allowed: action !== 'BLOCK',
      timeLimitMinutes: action === 'LIMIT' ? (catApp.defaultLimit || 60) : 0,
      usedMinutesToday: 0,
      isAlwaysAllowed: false,
      installedDevice: selectedDevice.name,
      isCustomAdded: true,
    };

    onRequestAddApp(newRule);
  };

  const handleSubmitCustomForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = customAppName.trim();
    let trimmedPkg = customPackageName.trim().toLowerCase();

    if (!trimmedName) {
      setFormError('Sila masukkan nama aplikasi.');
      return;
    }

    if (!trimmedPkg) {
      setFormError('Sila masukkan nama pakej Android (cth: com.example.app).');
      return;
    }

    // Basic Android package name check: should contain at least one dot
    if (!trimmedPkg.includes('.')) {
      trimmedPkg = `com.${trimmedPkg.replace(/[^a-z0-9_]/g, '')}`;
    }

    const newRule: AppRule = {
      packageName: trimmedPkg,
      appName: trimmedName,
      icon: customCategory === 'games' ? 'gamepad-2' : customCategory === 'video' ? 'video' : 'smartphone',
      category: customCategory,
      blocked: customAction === 'BLOCK',
      allowed: customAction !== 'BLOCK',
      timeLimitMinutes: customAction === 'LIMIT' ? customLimitMinutes : 0,
      usedMinutesToday: 0,
      isAlwaysAllowed: false,
      installedDevice: selectedDevice.name,
      isCustomAdded: true,
    };

    onRequestAddApp(newRule);

    // Reset form
    setCustomAppName('');
    setCustomPackageName('');
  };

  // Filter Catalog
  const filteredCatalog = POPULAR_APPS_CATALOG.filter((app) => {
    const matchesSearch =
      app.appName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      app.packageName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      app.description.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = catalogCategory === 'all' || app.category === catalogCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-gradient-to-br from-[#11151E] via-[#141824] to-[#121620] border-2 border-sky-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
      {/* Background ambient lighting */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#222838]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Tambah Aplikasi Secara Manual (Pilih Peranti Terpasang)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                MANUAL SYNC
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih peranti anak tempat aplikasi dipasang, kemudian pilih dari katalog atau masukkan nama pakej aplikasi secara terus.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-end sm:self-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Tutup ruangan tambah"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 1. DEVICE SELECTION SECTION (PILIH PERANTI YANG DI-INSTALLKAN) */}
      <div className="mt-5 space-y-3 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-400" />
            Langkah 1: Pilih Peranti Sasaran (Installed Device):
          </label>
          <button
            onClick={() => setShowAddCustomDevice(!showAddCustomDevice)}
            className={`text-xs font-semibold flex items-center gap-1.5 py-1 px-2.5 rounded-xl border transition-all cursor-pointer ${
              showAddCustomDevice
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'text-slate-400 hover:text-sky-300 border-slate-800 hover:border-slate-700 bg-slate-900/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            {showAddCustomDevice ? 'Tutup Borang Daftar' : '➕ Daftar Profil Peranti Baru'}
          </button>
        </div>

        {/* Device Cards Selector: Local Active Container + Custom Devices + Add Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {installedDevices.map((dev) => {
            const isSelected = dev.id === selectedDeviceId;
            const isLocal = dev.id === 'dev_local';
            return (
              <div
                key={dev.id}
                onClick={() => {
                  setSelectedDeviceId(dev.id);
                  if (onSelectDeviceFilter) onSelectDeviceFilter(dev.name);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500 shadow-md shadow-sky-500/20 text-white'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {dev.type === 'tablet' ? (
                        <Tablet className="w-4 h-4" />
                      ) : dev.type === 'local' ? (
                        <Layers className="w-4 h-4" />
                      ) : (
                        <Smartphone className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">{dev.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{dev.userOwner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!isLocal && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustomDevice(e, dev.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Padam profil peranti ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono">{dev.androidVersion}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isLocal ? 'Peranti Ini (Aktif)' : 'Dipantau'}
                  </span>
                </div>
              </div>
            );
          })}

          {/* ➕ Daftar Profil Peranti Baru (Card Action) */}
          <button
            type="button"
            onClick={() => setShowAddCustomDevice(!showAddCustomDevice)}
            className={`p-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 min-h-[90px] ${
              showAddCustomDevice
                ? 'border-sky-500 bg-sky-500/10 text-white shadow-lg shadow-sky-500/10'
                : 'border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/60 text-slate-400 hover:text-sky-300'
            }`}
          >
            <div className="p-1.5 rounded-xl bg-slate-800/80 text-sky-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight text-slate-200">➕ Daftar Profil Peranti Baru</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                (pilihan menambah peranti lain sekiranya ada gajet tambahan)
              </p>
            </div>
          </button>
        </div>

        {/* Form Pendaftaran Peranti Baru dengan Pilihan Contoh Pantas */}
        {showAddCustomDevice && (
          <div className="bg-slate-950/95 border border-sky-500/35 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
              <div>
                <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-sky-400" />
                  ➕ Daftar Profil Peranti Baru
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pilihan menambah peranti lain sekiranya ada gajet tambahan untuk anak (cth: Tablet atau telefon pintar kedua).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustomDevice(false)}
                className="text-xs text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets / Contoh Peranti Yang Boleh Ditambah Terus */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-slate-200">
                  Contoh peranti sekiranya ada gajet tambahan (klik untuk tambah pantas):
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {EXAMPLE_DEVICE_PRESETS.map((preset) => {
                  const isAlreadyAdded = installedDevices.some(
                    (d) => d.name.toLowerCase() === preset.name.toLowerCase()
                  );
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                        isAlreadyAdded
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-300'
                          : 'bg-slate-950/90 hover:bg-sky-500/15 border-slate-800 hover:border-sky-500/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-sky-400 shrink-0">
                          {preset.type === 'tablet' ? (
                            <Tablet className="w-4 h-4" />
                          ) : (
                            <Smartphone className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight group-hover:text-white truncate">
                            {preset.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {preset.userOwner}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap ${
                          isAlreadyAdded
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-500/20 text-sky-300 group-hover:bg-sky-500 group-hover:text-white transition-all'
                        }`}
                      >
                        {isAlreadyAdded ? '✓ Dipasang' : '+ Guna Contoh'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleSaveCustomDevice} className="space-y-3 pt-1">
              <p className="text-[11px] font-semibold text-slate-300">
                Atau masukkan profil peranti kustom secara manual:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Nama Peranti:</label>
                  <input
                    type="text"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    placeholder="Cth: Tablet Anak 1 — Samsung Galaxy Tab A9"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Pemilik / Pengguna:</label>
                  <input
                    type="text"
                    value={newDeviceOwner}
                    onChange={(e) => setNewDeviceOwner(e.target.value)}
                    placeholder="Cth: Adam (10 Tahun) / Sara"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Jenis Peranti:</label>
                  <select
                    value={newDeviceType}
                    onChange={(e) => setNewDeviceType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                  >
                    <option value="phone">Telefon Pintar (Smartphone)</option>
                    <option value="tablet">Tablet Pintar (Tablet)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomDevice(false)}
                  className="py-1.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan Profil Peranti
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 2. TAB TOGGLE (KATALOG PANTAS vs BORANG MANUAL) */}
      <div className="mt-6 space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#222838]">
          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Langkah 2: Pilih Kaedah Penambahan Aplikasi:
            </label>
            <p className="text-[11px] text-slate-400">
              Peranti aktif: <strong className="text-sky-300">{selectedDevice.name}</strong>
            </p>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('catalog')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'catalog'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pilih dari Aplikasi Terpasang (Katalog Pantas)
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'custom'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Isi Manual Pakej Kustom (Custom Package)
            </button>
          </div>
        </div>

        {/* MODE A: CATALOG QUICK PICK */}
        {mode === 'catalog' && (
          <div className="space-y-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
            {/* Search & Category Filter for Catalog */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder={`Cari aplikasi dipasang pada ${selectedDevice.name} (cth: Roblox, TikTok, MLBB)...`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'games', 'social', 'video', 'utility', 'education'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCatalogCategory(cat)}
                    className={`py-1.5 px-2.5 rounded-xl text-[11px] font-semibold capitalize whitespace-nowrap cursor-pointer transition-all ${
                      catalogCategory === cat
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cat === 'all' ? 'Semua' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredCatalog.map((app) => {
                const existingApp = existingAppRules.find(
                  (a) => a.packageName.toLowerCase() === app.packageName.toLowerCase()
                );
                const isAlreadyManaged = !!existingApp;

                return (
                  <div
                    key={app.packageName}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isAlreadyManaged
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-85'
                        : 'bg-slate-900 border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                            {app.category === 'games' ? (
                              <Gamepad2 className="w-4 h-4 text-emerald-400" />
                            ) : app.category === 'video' ? (
                              <Tv className="w-4 h-4 text-rose-400" />
                            ) : app.category === 'social' ? (
                              <Share2 className="w-4 h-4 text-sky-400" />
                            ) : (
                              <Smartphone className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">{app.appName}</p>
                            <p className="text-[9px] text-slate-500 font-mono truncate max-w-[140px]">
                              {app.packageName}
                            </p>
                          </div>
                        </div>

                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {app.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">{app.description}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                      {isAlreadyManaged ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {existingApp?.blocked ? 'Telah Disekat' : 'Dalam Kawalan'}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {existingApp?.installedDevice || 'Aktif'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAddFromCatalog(app, 'BLOCK')}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                            title="Tambah dan sekat aplikasi ini serta-merta pada peranti terpilih"
                          >
                            <Ban className="w-3 h-3" />
                            Sekat Terus
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddFromCatalog(app, 'LIMIT')}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                            title="Tambah dan tetapkan had masa harian pada peranti terpilih"
                          >
                            <Clock className="w-3 h-3" />
                            Beri Had ({app.defaultLimit || 60}m)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE B: CUSTOM APP MANUAL INPUT FORM */}
        {mode === 'custom' && (
          <form
            onSubmit={handleSubmitCustomForm}
            className="space-y-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-6"
          >
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-sky-300">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Panduan Nama Pakej Android (Package Name):</p>
                <p className="text-sky-300/80 text-[11px] mt-0.5">
                  Buka pautan aplikasi di Google Play Store melalui pelayar web. Nama pakej berada selepas parameter{' '}
                  <code className="text-white bg-sky-950 px-1 py-0.5 rounded font-mono">id=com.contoh.app</code>.
                </p>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* App Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Aplikasi: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={customAppName}
                  onChange={(e) => setCustomAppName(e.target.value)}
                  placeholder="Cth: Honkai: Star Rail"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  required
                />
              </div>

              {/* Package Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Pakej Android (Package Name): <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={customPackageName}
                  onChange={(e) => setCustomPackageName(e.target.value)}
                  placeholder="Cth: com.HoYoverse.hkrpgoversea"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Kategori Aplikasi:</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="games">Permainan (Games)</option>
                  <option value="social">Media Sosial (Social)</option>
                  <option value="video">Hiburan & Video (Video)</option>
                  <option value="education">Pendidikan (Education)</option>
                  <option value="productivity">Produktiviti (Productivity)</option>
                  <option value="utility">Utiliti / Sistem (Utility)</option>
                </select>
              </div>

              {/* Action */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Status Awal Sekatan:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomAction('BLOCK')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      customAction === 'BLOCK'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Sekat Terus
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomAction('LIMIT')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      customAction === 'LIMIT'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Beri Had Masa
                  </button>
                </div>
              </div>

              {/* Limit selector if LIMIT chosen */}
              {customAction === 'LIMIT' && (
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Had Masa Penggunaan Harian:
                  </label>
                  <select
                    value={customLimitMinutes}
                    onChange={(e) => setCustomLimitMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none cursor-pointer"
                  >
                    <option value={60}>1 Jam (60 minit)</option>
                    <option value={75}>1 Jam 15 minit (75 minit)</option>
                    <option value={90}>1 Jam 30 minit (90 minit)</option>
                    <option value={105}>1 Jam 45 minit (105 minit)</option>
                    <option value={120}>2 Jam (120 minit)</option>
                    <option value={180}>3 Jam (180 minit)</option>
                    <option value={240}>4 Jam (240 minit)</option>
                    <option value={300}>5 Jam (300 minit)</option>
                    <option value={360}>6 Jam (360 minit)</option>
                    <option value={480}>8 Jam (480 minit)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">
                Aplikasi ini akan didaftarkan di bawah profil: <strong className="text-sky-300">{selectedDevice.name}</strong>
              </p>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Daftar Aplikasi ke Peranti Ini
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
