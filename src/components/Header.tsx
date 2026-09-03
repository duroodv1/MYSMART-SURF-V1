/**
 * MYSMART SURF - Top Application Header Component
 */

import React from 'react';
import { Shield, Bell, Lock, Sun, Moon, Sparkles, Smartphone, Check, Code2 } from 'lucide-react';
import { ActiveTab, AndroidBridgeStatus, AppStateStatus } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  appState: AppStateStatus;
  bridgeStatus: AndroidBridgeStatus;
  unreadNotifsCount: number;
  darkMode: boolean;
  onToggleTheme: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onRequestLock: () => void;
  onToggleDemoMode: () => void;
  developerMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  appState,
  bridgeStatus,
  unreadNotifsCount,
  darkMode,
  onToggleTheme,
  onNavigate,
  onRequestLock,
  onToggleDemoMode,
  developerMode = false,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#11141A]/95 border-b border-[#1E222C] backdrop-blur-md px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Status Pill */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
              MS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  MYSMART SURF
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  BERLINDUNG (ACTIVE)
                </span>
              </div>
              <p className="text-[10px] text-gray-500 hidden sm:block truncate max-w-[280px]">
                Kawal Masa & Lindungi
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-2.5">
          {/* Developer Mode Pill (Only visible when Developer Mode is active) */}
          {developerMode && (
            <button
              id="btn-header-dev-mode"
              onClick={() => onNavigate('native_apk')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold tracking-tight transition-all cursor-pointer"
              title="Mod Pembangun Aktif - Buka Portal APK & Bridge"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px]">DEV HUB</span>
            </button>
          )}

          {/* Mode Pill Toggle (Demo / PWA / Native APK) */}
          <button
            id="btn-toggle-demo-mode"
            onClick={onToggleDemoMode}
            title="Klik untuk menukar mod simulasi/pengesanan native"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              bridgeStatus.isNativeBridgeAvailable
                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                : bridgeStatus.demoMode
                ? 'bg-[#1E222C] text-[#E2E8F0] border-[#2D3340] hover:bg-[#252A36]'
                : 'bg-blue-600/10 text-blue-400 border-blue-600/30'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider text-[11px] font-bold">
              {bridgeStatus.isNativeBridgeAvailable
                ? 'APK NATIVE ACTIVE'
                : bridgeStatus.demoMode
                ? 'DEMO MODE'
                : 'PWA OFFLINE'}
            </span>
          </button>

          {/* Quick Lock Button */}
          <button
            id="btn-header-quick-lock"
            onClick={onRequestLock}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-red-900/20 flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
            title="Kunci Peranti Sekarang"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>LOCK DEVICE NOW</span>
          </button>

          {/* Notification Button with Badge */}
          <button
            id="btn-header-notifications"
            onClick={() => onNavigate('notifications')}
            className={`p-2 rounded-xl border transition-all relative cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-[#1E222C] hover:bg-[#252A36] text-[#E2E8F0] border-[#2D3340]'
            }`}
            title="Notifikasi & Amaran"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-[#1E222C] hover:bg-[#252A36] text-[#E2E8F0] border border-[#2D3340] transition-all cursor-pointer"
            title="Tukar Mod Cerah / Gelap"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
