/**
 * MYSMART SURF - Navigation Component (Sidebar on Tablet/Desktop, Bottom Nav + Menu Drawer on Mobile)
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Clock,
  LayoutGrid,
  Globe,
  Wifi,
  Calendar,
  ShieldCheck,
  Lock,
  Activity,
  BarChart3,
  Bell,
  ShieldAlert,
  Smartphone,
  Settings,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  unreadNotifsCount: number;
  developerMode?: boolean;
}

interface NavItemDef {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isDev?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unreadNotifsCount,
  developerMode = false,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const mainNavItems: NavItemDef[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'screentime', label: 'Screen Time', icon: Clock },
    { id: 'apps', label: 'Apps', icon: LayoutGrid },
    { id: 'browsers', label: 'Browsers', icon: Globe },
    { id: 'internet', label: 'Internet', icon: Wifi },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'allowed', label: 'Allowed Apps', icon: ShieldCheck },
    { id: 'devicelock', label: 'Device Lock', icon: Lock },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    ...(developerMode
      ? [{ id: 'native_apk' as ActiveTab, label: 'Android APK & Bridge', icon: Smartphone, isDev: true }]
      : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Primary 4 items shown in mobile bottom bar
  const mobilePrimaryTabs: ActiveTab[] = ['dashboard', 'screentime', 'apps', 'reports'];

  const handleTabClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* DESKTOP / TABLET SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#11141A] border-r border-[#1E222C] p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Main Menu
        </div>

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold border border-blue-500/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#1A1D23]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span>{item.label}</span>
                {item.isDev && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold tracking-tight">
                    DEV
                  </span>
                )}
              </div>
              {item.badge && item.badge > 0 ? (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white text-blue-700' : 'bg-red-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Bottom Status Card */}
        <div className="pt-4 mt-auto border-t border-[#1E222C]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#1A1D23] border border-[#232731]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xs">
              AK
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Parent Admin</p>
              <p className="text-[10px] text-gray-500">Super Admin Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#11141A]/95 border-t border-[#1E222C] backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
        {mobilePrimaryTabs.map((tabId) => {
          const item = mainNavItems.find((i) => i.id === tabId)!;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-item-${item.id}`}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-blue-400 font-bold' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}

        {/* More Menu Drawer Trigger */}
        <button
          id="mobile-nav-more"
          onClick={() => setMobileDrawerOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            !mobilePrimaryTabs.includes(activeTab) ? 'text-blue-400 font-bold' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider">Menu</span>
        </button>
      </nav>

      {/* MOBILE FULL DRAWER MENU */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#090A0C]/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in">
          <div className="bg-[#11141A] border-t border-[#1E222C] rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E222C]">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Semua Modul & Kawalan</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white bg-[#1A1D23] border border-[#232731]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#1A1D23] text-gray-400 hover:text-white border border-[#232731]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-blue-400" />
                    <span className="truncate">{item.label}</span>
                    {item.isDev && (
                      <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                        DEV
                      </span>
                    )}
                    {item.badge && item.badge > 0 ? (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500 text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
