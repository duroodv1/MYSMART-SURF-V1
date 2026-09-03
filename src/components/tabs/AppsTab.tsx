/**
 * MYSMART SURF - App Control Tab Component
 * Termasuk Ruangan Tambah App Secara Manual Melalui Pilih Peranti Yang Di-installkan
 */

import React, { useState } from 'react';
import {
  LayoutGrid,
  Search,
  CheckCircle2,
  Ban,
  Clock,
  Shield,
  Filter,
  Check,
  AlertCircle,
  Smartphone,
  Plus,
  Trash2,
  Tablet,
  Layers,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';
import { AppRule } from '../../types';
import { ScreenTimeEngine } from '../../services/screenTimeEngine';
import { ParentAuthModal } from '../ParentAuthModal';
import {
  AddAppManualSection,
  DEFAULT_INSTALLED_DEVICES,
} from '../AddAppManualSection';

interface AppsTabProps {
  appRules: AppRule[];
  onUpdateAppRule: (updatedApp: AppRule) => Promise<void>;
  onBulkUpdateApps: (action: 'ALLOW_ALL' | 'BLOCK_ALL' | 'SET_LIMIT', limitMin?: number) => Promise<void>;
  onAddAppRule?: (newApp: AppRule) => Promise<void>;
  onDeleteAppRule?: (packageName: string) => Promise<void>;
}

export const AppsTab: React.FC<AppsTabProps> = ({
  appRules,
  onUpdateAppRule,
  onBulkUpdateApps,
  onAddAppRule,
  onDeleteAppRule,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<string>('all');
  const [showAddSection, setShowAddSection] = useState<boolean>(false);

  // Security Auth Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalDetails, setAuthModalDetails] = useState({
    title: 'Pengesahan Kawalan Aplikasi',
    description: 'Sila masukkan kata laluan ibu bapa untuk mengemas kini sekatan atau had masa aplikasi ini.',
  });

  const [activeEditingApp, setActiveEditingApp] = useState<AppRule | null>(null);
  const [pendingAddApp, setPendingAddApp] = useState<AppRule | null>(null);
  const [pendingDeletePackage, setPendingDeletePackage] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<'ALLOW_ALL' | 'BLOCK_ALL' | 'SET_LIMIT' | null>(null);
  const [bulkLimit, setBulkLimit] = useState<number>(60);

  // List of unique devices present in current app rules + default devices + custom registered devices
  const savedCustomDevices: string[] = (() => {
    try {
      const saved = localStorage.getItem('mysmartsurf_devices_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((d: any) => d.name).filter(Boolean);
        }
      }
    } catch {}
    return [];
  })();

  const knownDevices: string[] = Array.from(
    new Set([
      ...DEFAULT_INSTALLED_DEVICES.map((d) => d.name),
      ...savedCustomDevices,
      ...appRules.map((a) => a.installedDevice).filter((d): d is string => !!d),
    ])
  );

  const filteredApps = appRules.filter((app) => {
    const matchesSearch =
      app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesDev =
      selectedDeviceFilter === 'all' ||
      (app.installedDevice && app.installedDevice === selectedDeviceFilter) ||
      (!app.installedDevice && selectedDeviceFilter === 'all');
    return matchesSearch && matchesCat && matchesDev;
  });

  const handleToggleBlock = (app: AppRule) => {
    setActiveEditingApp({
      ...app,
      blocked: !app.blocked,
    });
    setAuthModalDetails({
      title: app.blocked ? 'Benarkan Akses Aplikasi' : 'Sekat Akses Aplikasi',
      description: `Sahkan kata laluan ibu bapa untuk ${app.blocked ? 'membenarkan semula' : 'menyekat'} aplikasi ${app.appName}.`,
    });
    setShowAuthModal(true);
  };

  const handleSetAppLimit = (app: AppRule, newLimit: number) => {
    setActiveEditingApp({
      ...app,
      timeLimitMinutes: newLimit,
    });
    setAuthModalDetails({
      title: 'Kemas Kini Had Masa Aplikasi',
      description: `Tetapkan had masa penggunaan aplikasi ${app.appName} kepada ${newLimit === 0 ? 'Tiada Had' : ScreenTimeEngine.formatHoursMinutes(newLimit)}.`,
    });
    setShowAuthModal(true);
  };

  const handleBulkActionClick = (action: 'ALLOW_ALL' | 'BLOCK_ALL' | 'SET_LIMIT') => {
    setBulkAction(action);
    setAuthModalDetails({
      title: 'Tindakan Pukal Aplikasi',
      description: action === 'ALLOW_ALL'
        ? 'Sahkan untuk membenarkan semua aplikasi sekaligus.'
        : 'Sahkan untuk menyekat semua aplikasi hiburan sekaligus.',
    });
    setShowAuthModal(true);
  };

  const handleRequestAddApp = (newApp: AppRule) => {
    setPendingAddApp(newApp);
    setAuthModalDetails({
      title: 'Pengesahan Pendaftaran Aplikasi Baharu',
      description: `Daftarkan aplikasi "${newApp.appName}" (${newApp.installedDevice || 'Peranti Terpilih'}) ke senarai sekatan dan kawalan.`,
    });
    setShowAuthModal(true);
  };

  const handleRequestDeleteApp = (app: AppRule) => {
    setPendingDeletePackage(app.packageName);
    setAuthModalDetails({
      title: 'Keluarkan Aplikasi dari Senarai Sekatan',
      description: `Adakah anda pasti ingin mengeluarkan aplikasi "${app.appName}" daripada senarai kawalan ibu bapa?`,
    });
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);

    if (activeEditingApp) {
      await onUpdateAppRule(activeEditingApp);
      setActiveEditingApp(null);
    } else if (pendingAddApp && onAddAppRule) {
      await onAddAppRule(pendingAddApp);
      setPendingAddApp(null);
      // Keep section open so parent can see or add more, or notify
    } else if (pendingDeletePackage && onDeleteAppRule) {
      await onDeleteAppRule(pendingDeletePackage);
      setPendingDeletePackage(null);
    } else if (bulkAction) {
      await onBulkUpdateApps(bulkAction, bulkAction === 'SET_LIMIT' ? bulkLimit : undefined);
      setBulkAction(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Main Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">APP CONTROL (BLOCK & LIMIT APPS)</h2>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {appRules.length} Apps Dipantau
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kawal had masa penggunaan aplikasi (1 Jam – 8 Jam, gandaan 15 minit), sekat aplikasi mengikut peranti anak yang dipasang.
              </p>
            </div>
          </div>

          {/* Action Buttons: Add App by Device & Bulk Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddSection(!showAddSection)}
              className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                showAddSection
                  ? 'bg-sky-600 text-white shadow-sky-600/30 ring-2 ring-sky-400'
                  : 'bg-sky-500/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/40'
              }`}
            >
              <Plus className="w-4 h-4" />
              {showAddSection ? 'Tutup Ruangan Tambah' : '+ Tambah App (Pilih Peranti)'}
            </button>

            <button
              onClick={() => handleBulkActionClick('ALLOW_ALL')}
              className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
            >
              Benarkan Semua
            </button>
            <button
              onClick={() => handleBulkActionClick('BLOCK_ALL')}
              className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold cursor-pointer"
            >
              Sekat Hiburan
            </button>
          </div>
        </div>

        {/* Search, Device Filter & Category Filter */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama aplikasi, package, atau peranti..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>

            {/* Device Filter Dropdown */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2">
              <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">Peranti:</span>
              <select
                value={selectedDeviceFilter}
                onChange={(e) => setSelectedDeviceFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer font-medium max-w-[200px]"
              >
                <option value="all" className="bg-slate-900 text-white">Semua Peranti</option>
                {knownDevices.map((dev) => (
                  <option key={dev} value={dev} className="bg-slate-900 text-white">
                    {dev}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'social', 'video', 'games', 'education', 'utility'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat === 'all' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. RUANGAN TAMBAH APP SECARA MANUAL MELALUI PILIH PERANTI YANG DI-INSTALLKAN */}
      {showAddSection && (
        <AddAppManualSection
          existingAppRules={appRules}
          onRequestAddApp={handleRequestAddApp}
          onClose={() => setShowAddSection(false)}
          selectedDeviceFilter={selectedDeviceFilter !== 'all' ? selectedDeviceFilter : undefined}
          onSelectDeviceFilter={(dev) => setSelectedDeviceFilter(dev)}
        />
      )}

      {/* 3. Section Title & Statistics */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Senarai Aplikasi ({filteredApps.length} daripada {appRules.length})
          </h3>
          {selectedDeviceFilter !== 'all' && (
            <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              {selectedDeviceFilter}
              <button
                onClick={() => setSelectedDeviceFilter('all')}
                className="hover:text-white ml-0.5"
                title="Kosongkan penapis peranti"
              >
                ×
              </button>
            </span>
          )}
        </div>

        {!showAddSection && (
          <button
            onClick={() => setShowAddSection(true)}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            + Tambah Aplikasi Baru
          </button>
        )}
      </div>

      {/* 4. App Cards List */}
      {filteredApps.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-300">Tiada aplikasi dijumpai</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tiada aplikasi sepadan dengan carian atau penapis peranti ini. Anda boleh menambah aplikasi secara manual mengikut peranti yang dipasang.
          </p>
          <button
            onClick={() => setShowAddSection(true)}
            className="mt-2 py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-sky-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah App ke Peranti Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredApps.map((app) => {
            const isOverLimit = app.timeLimitMinutes > 0 && app.usedMinutesToday >= app.timeLimitMinutes;
            const remainingAppMin = app.timeLimitMinutes > 0 ? Math.max(0, app.timeLimitMinutes - app.usedMinutesToday) : -1;

            return (
              <div
                key={app.packageName}
                className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between transition-all relative ${
                  app.blocked
                    ? 'border-rose-500/40 bg-rose-950/10 shadow-sm shadow-rose-950/20'
                    : isOverLimit
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-sky-400 text-sm shadow-inner shrink-0">
                        {app.appName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white leading-tight">{app.appName}</p>
                          {app.isAlwaysAllowed && (
                            <span className="text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              Whitelist
                            </span>
                          )}
                          {app.isCustomAdded && (
                            <span className="text-[9px] font-bold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded">
                              Manual
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono truncate max-w-[170px] mt-0.5">
                          {app.packageName}
                        </p>
                      </div>
                    </div>

                    {/* Block / Allow Toggle Button */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleBlock(app)}
                        disabled={app.isAlwaysAllowed}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          app.blocked
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        } ${app.isAlwaysAllowed ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {app.blocked ? 'Disekat (Blocked)' : 'Dibenarkan (Allow)'}
                      </button>

                      {/* Delete button if manual or non-whitelisted */}
                      {!app.isAlwaysAllowed && (
                        <button
                          onClick={() => handleRequestDeleteApp(app)}
                          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                          title="Keluarkan aplikasi ini daripada senarai pantauan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Device Tag Badge */}
                  <div className="mt-3 flex items-center justify-between text-[10px]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                      <Smartphone className="w-3 h-3 text-sky-400" />
                      <strong className="text-slate-400 font-normal">Peranti:</strong>
                      <span className="font-semibold text-sky-300">
                        {app.installedDevice || 'Semua Peranti (Global)'}
                      </span>
                    </span>

                    <span className="text-slate-500 font-mono uppercase text-[9px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800/70">
                      {app.category}
                    </span>
                  </div>

                  {/* Usage vs Limit Status */}
                  <div className="mt-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Penggunaan Hari Ini:</span>
                      <span className="font-mono font-bold text-white">
                        {app.usedMinutesToday} minit
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Had Khusus:</span>
                      <span className="font-mono font-bold text-sky-400">
                        {app.timeLimitMinutes > 0 ? ScreenTimeEngine.formatHoursMinutes(app.timeLimitMinutes) : 'Tiada Had'}
                      </span>
                    </div>

                    {app.timeLimitMinutes > 0 && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                        <span className="text-slate-400">Baki Masa:</span>
                        <span
                          className={`font-mono font-bold ${
                            remainingAppMin === 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {remainingAppMin === 0 ? 'Had Dicapai (0m)' : `${remainingAppMin} minit`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Individual App Limit Selector */}
                {!app.isAlwaysAllowed && (
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <label className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      Tetapkan Had:
                    </label>
                    <select
                      value={app.timeLimitMinutes}
                      onChange={(e) => handleSetAppLimit(app, Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-sky-500 font-mono cursor-pointer"
                    >
                      <option value={0}>Tiada Had Khusus</option>
                      <option value={60}>1 Jam (60m)</option>
                      <option value={75}>1j 15m (75m)</option>
                      <option value={90}>1j 30m (90m)</option>
                      <option value={105}>1j 45m (105m)</option>
                      <option value={120}>2 Jam (120m)</option>
                      <option value={180}>3 Jam (180m)</option>
                      <option value={240}>4 Jam (240m)</option>
                      <option value={300}>5 Jam (300m)</option>
                      <option value={360}>6 Jam (360m)</option>
                      <option value={480}>8 Jam (480m)</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Parent Auth Modal */}
      <ParentAuthModal
        isOpen={showAuthModal}
        title={authModalDetails.title}
        description={authModalDetails.description}
        onSuccess={handleAuthSuccess}
        onCancel={() => {
          setShowAuthModal(false);
          setActiveEditingApp(null);
          setPendingAddApp(null);
          setPendingDeletePackage(null);
          setBulkAction(null);
        }}
      />
    </div>
  );
};
