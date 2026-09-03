/**
 * MYSMART SURF - Dashboard Tab Component
 */

import React, { useState } from 'react';
import {
  Clock,
  Lock,
  Wifi,
  Shield,
  LayoutGrid,
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Smartphone,
  ShieldAlert,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ScreenTimeConfig,
  AppRule,
  BrowserRule,
  InternetControlState,
  ActivityRecord,
  ActiveTab,
} from '../../types';
import { ScreenTimeEngine } from '../../services/screenTimeEngine';
import { ParentAuthModal } from '../ParentAuthModal';

interface DashboardTabProps {
  screenTime: ScreenTimeConfig;
  appRules: AppRule[];
  browserRules: BrowserRule[];
  internetState: InternetControlState;
  activities: ActivityRecord[];
  onNavigate: (tab: ActiveTab) => void;
  onLockDevice: () => void;
  onToggleInternet: () => void;
  onToggleAppRestrictions: () => void;
  onPauseDevice: (minutes: number) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  screenTime,
  appRules,
  browserRules,
  internetState,
  activities,
  onNavigate,
  onLockDevice,
  onToggleInternet,
  onToggleAppRestrictions,
  onPauseDevice,
}) => {
  const [authAction, setAuthAction] = useState<
    'lock' | 'internet' | 'block_apps' | 'pause' | null
  >(null);

  // Calculate percentages
  const usedMinutes = screenTime.usedMinutesToday;
  const limitMinutes = screenTime.dailyLimitMinutes;
  const remainingMinutes = limitMinutes > 0 ? Math.max(0, limitMinutes - usedMinutes) : -1;
  const progressPct = limitMinutes > 0 ? Math.min(100, Math.round((usedMinutes / limitMinutes) * 100)) : 0;

  // Counts
  const blockedAppsCount = appRules.filter((a) => a.blocked).length;
  const blockedBrowsersCount = browserRules.filter((b) => b.blocked).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter((a) => a.date === todayStr);
  const blockedEventsCount = todayActivities.filter((a) => a.eventType === 'BLOCKED_ATTEMPT').length;
  const warningEventsCount = todayActivities.filter((a) => a.eventType === 'WARNING').length;

  const handleExecuteAuth = () => {
    if (authAction === 'lock') {
      onLockDevice();
    } else if (authAction === 'internet') {
      onToggleInternet();
    } else if (authAction === 'block_apps') {
      onToggleAppRestrictions();
    } else if (authAction === 'pause') {
      onPauseDevice(30);
    }
    setAuthAction(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TODAY'S SCREEN TIME HERO CARD */}
      <div className="bg-[#11141A] border border-[#1E222C] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-6">
          <div className="space-y-2 max-w-lg">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
              TODAY'S SCREEN TIME
            </p>

            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-5xl font-light text-white font-mono tracking-tight">
                {ScreenTimeEngine.formatHoursMinutes(usedMinutes)}{' '}
                <span className="text-lg sm:text-2xl text-gray-600 font-normal">
                  / {ScreenTimeEngine.formatHoursMinutes(limitMinutes)}
                </span>
              </h2>
            </div>

            <p className="text-blue-400 text-sm font-medium flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {ScreenTimeEngine.formatRemaining(remainingMinutes)}
            </p>
          </div>

          {/* Metric Pill */}
          <div className="bg-[#1A1D23] border border-[#232731] rounded-2xl px-5 py-3 flex items-center gap-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Kadar Terpakai</p>
              <p className="text-xl font-bold text-white font-mono">{progressPct}%</p>
            </div>
            <div className="h-8 w-px bg-[#2D3340]" />
            <button
              onClick={() => onNavigate('screentime')}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              Ubah Had <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="h-3.5 w-full bg-[#1A1D23] rounded-full overflow-hidden border border-[#232731]">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              progressPct >= 90
                ? 'bg-gradient-to-r from-red-600 to-red-400'
                : progressPct >= 75
                ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                : 'bg-gradient-to-r from-blue-600 to-blue-400'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 2. QUICK CONTROLS SECTION */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">
          QUICK CONTROL (KAWALAN PANTAS)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* LOCK DEVICE */}
          <button
            id="btn-quick-lock"
            onClick={() => setAuthAction('lock')}
            className="p-4 rounded-2xl bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-left transition-all active:scale-98 cursor-pointer flex flex-col justify-between group"
          >
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-400 uppercase tracking-wider">LOCK DEVICE</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Kunci peranti serta-merta</p>
            </div>
          </button>

          {/* BLOCK INTERNET */}
          <button
            id="btn-quick-internet"
            onClick={() => setAuthAction('internet')}
            className={`p-4 rounded-2xl border text-left transition-all active:scale-98 cursor-pointer flex flex-col justify-between group ${
              internetState.blocked
                ? 'bg-red-600/10 border-red-600/30'
                : 'bg-[#11141A] border-[#1E222C] hover:border-[#2D3340]'
            }`}
          >
            <div
              className={`p-2 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform ${
                internetState.blocked
                  ? 'bg-red-600/20 text-red-400'
                  : 'bg-blue-600/10 text-blue-400'
              }`}
            >
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                {internetState.blocked ? 'ALLOW INTERNET' : 'BLOCK INTERNET'}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {internetState.blocked ? 'Sekatan Internet Aktif' : 'Sekat akses rangkaian'}
              </p>
            </div>
          </button>

          {/* BLOCK APPS */}
          <button
            id="btn-quick-apps"
            onClick={() => setAuthAction('block_apps')}
            className="p-4 rounded-2xl bg-[#11141A] border border-[#1E222C] hover:border-[#2D3340] text-left transition-all active:scale-98 cursor-pointer flex flex-col justify-between group"
          >
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">BLOCK APPS</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {blockedAppsCount > 0 ? `${blockedAppsCount} disekat` : 'Sekat aplikasi hiburan'}
              </p>
            </div>
          </button>

          {/* PAUSE DEVICE */}
          <button
            id="btn-quick-pause"
            onClick={() => setAuthAction('pause')}
            className="p-4 rounded-2xl bg-[#11141A] border border-[#1E222C] hover:border-[#2D3340] text-left transition-all active:scale-98 cursor-pointer flex flex-col justify-between group"
          >
            <div className="p-2 rounded-xl bg-[#1E222C] text-gray-300 w-fit mb-3 group-hover:scale-110 transition-transform">
              <PauseCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">PAUSE DEVICE</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Rehat sementara 30 minit</p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. APP RESTRICTIONS & INTERNET USAGE BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* App Restrictions */}
        <div className="md:col-span-6 bg-[#11141A] border border-[#1E222C] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">App Restrictions</h3>
            <button
              onClick={() => onNavigate('apps')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Urus Apps
            </button>
          </div>
          <div className="space-y-3">
            {appRules.slice(0, 3).map((app) => (
              <div
                key={app.packageName}
                className="flex items-center justify-between p-3.5 bg-[#1A1D23] rounded-xl border border-[#232731]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    app.blocked ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {app.appName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{app.appName}</p>
                    <p className="text-[10px] text-gray-500">{app.usedMinutesToday}m hari ini</p>
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  app.blocked ? 'text-red-500' : 'text-blue-400'
                }`}>
                  {app.blocked ? 'Limit Hit / Blocked' : `${Math.max(0, (app.timeLimitMinutes || 60) - app.usedMinutesToday)}m Left`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Internet Usage */}
        <div className="md:col-span-6 bg-[#11141A] border border-[#1E222C] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Internet Usage</h3>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
              {internetState.blocked ? '🔴 BLOCKED' : '🟢 ACTIVE FILTER'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full h-28 bg-[#1A1D23] rounded-2xl border border-dashed border-[#2D3340] flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">1.2 GB</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Data Usage Today</span>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-36">
              <button
                onClick={() => {
                  if (internetState.blocked) onToggleInternet();
                }}
                className={`w-full px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  !internetState.blocked
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600/20'
                }`}
              >
                ALLOW WEB
              </button>
              <button
                onClick={() => {
                  if (!internetState.blocked) onToggleInternet();
                }}
                className={`w-full px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  internetState.blocked
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600/20'
                }`}
              >
                BLOCK WEB
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. UPCOMING SCHEDULE & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Schedule Highlight */}
        <div className="md:col-span-5 bg-blue-600 rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl shadow-blue-950/40">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
              Upcoming Schedule
            </p>
            <h4 className="text-2xl font-bold tracking-tight">SLEEP TIME</h4>
            <p className="text-sm opacity-90 mt-1">Mula: 10:00 PM (Lagi 2 jam)</p>
          </div>
          <div className="mt-6 p-4 bg-white/10 rounded-2xl flex items-center gap-3 border border-white/15">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            <p className="text-xs font-medium">Auto-Lock System Diaktifkan</p>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="md:col-span-7 bg-[#11141A] border border-[#1E222C] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Activity</h3>
            <button
              onClick={() => onNavigate('activity')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Lihat Log Lengkap
            </button>
          </div>
          <div className="space-y-3">
            {todayActivities.slice(0, 3).map((act, idx) => {
              const isBlocked = act.eventType === 'BLOCKED_ATTEMPT';
              const isWarning = act.eventType === 'WARNING';
              return (
                <div key={act.id || idx} className="flex items-start gap-3 p-2 rounded-xl bg-[#1A1D23]/50 border border-[#232731]">
                  <div className={`w-1 rounded-full h-8 shrink-0 mt-1 ${
                    isBlocked ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-white truncate">{act.appName}</p>
                    <p className="text-[10px] text-gray-500">{act.reason || 'Aktiviti dikesan'} • {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Parent Auth Modal for Quick Controls */}
      <ParentAuthModal
        isOpen={!!authAction}
        title="Pengesahan Kawalan Pantas"
        description="Sila masukkan kata laluan ibu bapa untuk melaksanakan tindakan kawalan ini."
        onSuccess={handleExecuteAuth}
        onCancel={() => setAuthAction(null)}
      />
    </div>
  );
};
