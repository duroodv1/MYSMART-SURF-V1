/**
 * MYSMART SURF - Master Application Entry Point
 * Offline-First Android Parental Control Application (PWA + APK Native Bridge)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  ScreenTimeConfig,
  AppRule,
  BrowserRule,
  InternetControlState,
  ScheduleItem,
  ActivityRecord,
  NotificationItem,
  SecurityConfig,
  AndroidBridgeStatus,
} from './types';
import { dbGet, dbPut, dbGetAll, dbDelete, dbClearAll } from './services/db';
import { ScreenTimeEngine, EvaluatedState } from './services/screenTimeEngine';
import { androidBridge } from './services/androidBridge';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { FirstSetup } from './components/FirstSetup';
import { DeviceLockOverlay } from './components/DeviceLockOverlay';
import { ParentAuthModal } from './components/ParentAuthModal';

// Tab Views
import { DashboardTab } from './components/tabs/DashboardTab';
import { ScreenTimeTab } from './components/tabs/ScreenTimeTab';
import { AppsTab } from './components/tabs/AppsTab';
import { BrowsersTab } from './components/tabs/BrowsersTab';
import { InternetTab } from './components/tabs/InternetTab';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { AllowedAppsTab } from './components/tabs/AllowedAppsTab';
import { DeviceLockTab } from './components/tabs/DeviceLockTab';
import { ActivityTab } from './components/tabs/ActivityTab';
import { ReportsTab } from './components/tabs/ReportsTab';
import { NotificationsTab } from './components/tabs/NotificationsTab';
import { SecurityTab } from './components/tabs/SecurityTab';
import { NativeApkTab } from './components/tabs/NativeApkTab';
import { SettingsTab } from './components/tabs/SettingsTab';

export default function App() {
  // Setup & Loading State
  const [isInitializing, setIsInitializing] = useState(true);
  const [isFirstSetupNeeded, setIsFirstSetupNeeded] = useState(false);

  // Core Data State from IndexedDB
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [screenTime, setScreenTime] = useState<ScreenTimeConfig>({
    dailyLimitMinutes: 300,
    usedMinutesToday: 225,
    lastUpdatedDate: new Date().toISOString().split('T')[0],
  });
  const [appRules, setAppRules] = useState<AppRule[]>([]);
  const [browserRules, setBrowserRules] = useState<BrowserRule[]>([]);
  const [internetState, setInternetState] = useState<InternetControlState>({
    blocked: false,
    reason: null,
  });
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null);

  // Evaluated App State
  const [appState, setAppState] = useState<EvaluatedState>({
    state: 'NORMAL',
    isLocked: false,
    reason: 'Sistem beroperasi normal',
    remainingMinutes: 75,
  });

  // Bridge Diagnostics & UI Preferences
  const [bridgeStatus, setBridgeStatus] = useState<AndroidBridgeStatus>(androidBridge.getStatus());
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [quickLockAuthModal, setQuickLockAuthModal] = useState(false);

  // Developer Mode State (Persisted in localStorage & hidden by default for normal users)
  const [developerMode, setDeveloperMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('dev') === 'true' || window.location.hash === '#developer') {
          localStorage.setItem('mysmartsurf_dev_mode', 'true');
          return true;
        }
        return localStorage.getItem('mysmartsurf_dev_mode') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const handleToggleDeveloperMode = useCallback((enabled?: boolean) => {
    setDeveloperMode((prev) => {
      const next = typeof enabled === 'boolean' ? enabled : !prev;
      try {
        localStorage.setItem('mysmartsurf_dev_mode', String(next));
      } catch {}
      if (!next) {
        setActiveTab((curr) => (curr === 'native_apk' ? 'dashboard' : curr));
      }
      return next;
    });
  }, []);

  // Load all initial state from IndexedDB
  const loadInitialData = useCallback(async () => {
    try {
      const sec = await dbGet<SecurityConfig>('security', 'config');
      if (!sec || !sec.parentPasswordHash) {
        setIsFirstSetupNeeded(true);
        setIsInitializing(false);
        return;
      }
      setSecurityConfig(sec);
      setIsFirstSetupNeeded(false);

      const [st, apps, browsers, net, schs, acts, notifs] = await Promise.all([
        dbGet<ScreenTimeConfig>('screenTime', 'daily'),
        dbGetAll<AppRule>('appRules'),
        dbGetAll<BrowserRule>('browserRules'),
        dbGet<InternetControlState>('internet', 'status'),
        dbGetAll<ScheduleItem>('schedules'),
        dbGetAll<ActivityRecord>('activities'),
        dbGetAll<NotificationItem>('notifications'),
      ]);

      if (st) setScreenTime(st);
      if (apps && apps.length > 0) {
        const cleanedApps = apps.map((app) => {
          if (
            !app.installedDevice ||
            app.installedDevice.includes('Tablet Anak 1') ||
            app.installedDevice.includes('Telefon Anak 1') ||
            app.installedDevice.includes('Telefon Anak 2') ||
            app.installedDevice.includes('Peranti Semasa (Peranti Ini')
          ) {
            const updated = {
              ...app,
              installedDevice: 'Peranti Semasa Ini (Local Active Container)',
            };
            dbPut('appRules', app.packageName, updated);
            return updated;
          }
          return app;
        });
        setAppRules(cleanedApps);
      }
      if (browsers && browsers.length > 0) setBrowserRules(browsers);
      if (net) setInternetState(net);
      if (schs) setSchedules(schs);
      if (acts) setActivities(acts.sort((a, b) => b.timestamp - a.timestamp));
      if (notifs) setNotifications(notifs.sort((a, b) => b.timestamp - a.timestamp));

      // Initial state evaluation
      if (st && net) {
        const evaluated = await ScreenTimeEngine.evaluateCurrentState(st, schs || [], net);
        setAppState(evaluated);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Periodic heartbeat evaluation (every 10 seconds) to check schedules and limits
  useEffect(() => {
    if (isFirstSetupNeeded || isInitializing) return;

    const interval = setInterval(async () => {
      try {
        const evaluated = await ScreenTimeEngine.evaluateCurrentState(
          screenTime,
          schedules,
          internetState
        );
        setAppState(evaluated);
      } catch (e) {
        console.error('Heartbeat check error:', e);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isFirstSetupNeeded, isInitializing, screenTime, schedules, internetState]);

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // =========================================================================
  // Handlers for App Actions & State Mutations
  // =========================================================================

  const handleFirstSetupComplete = async () => {
    await loadInitialData();
  };

  const handleUpdateScreenTimeLimit = async (newLimit: number) => {
    const updated: ScreenTimeConfig = {
      ...screenTime,
      dailyLimitMinutes: newLimit,
      lastUpdatedDate: new Date().toISOString().split('T')[0],
    };
    await dbPut('screenTime', 'daily', updated);
    setScreenTime(updated);

    const evaluated = await ScreenTimeEngine.evaluateCurrentState(updated, schedules, internetState);
    setAppState(evaluated);

    // Record activity
    const newAct: ActivityRecord = {
      id: `act_${Date.now()}`,
      appName: 'Screen Time Manager',
      packageName: 'com.mysmartsurf.parentalcontrol',
      durationMinutes: 0,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      eventType: 'OVERRIDE_GRANTED',
      details: `Had masa skrin harian diubah kepada ${newLimit === -1 ? 'Unlimited' : newLimit + ' minit'}.`,
    };
    await dbPut('activities', newAct.id, newAct);
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleAddSimulatedUsage = async (minutes: number) => {
    const newUsed = screenTime.usedMinutesToday + minutes;
    const updated: ScreenTimeConfig = {
      ...screenTime,
      usedMinutesToday: newUsed,
    };
    await dbPut('screenTime', 'daily', updated);
    setScreenTime(updated);

    const evaluated = await ScreenTimeEngine.evaluateCurrentState(updated, schedules, internetState);
    setAppState(evaluated);
  };

  const handleResetUsageToday = async () => {
    const updated: ScreenTimeConfig = {
      ...screenTime,
      usedMinutesToday: 0,
    };
    await dbPut('screenTime', 'daily', updated);
    setScreenTime(updated);

    const evaluated = await ScreenTimeEngine.evaluateCurrentState(updated, schedules, internetState);
    setAppState(evaluated);
  };

  const handleUpdateAppRule = async (updatedApp: AppRule) => {
    await dbPut('appRules', updatedApp.packageName, updatedApp);
    setAppRules((prev) => prev.map((a) => (a.packageName === updatedApp.packageName ? updatedApp : a)));

    // Record activity
    const newAct: ActivityRecord = {
      id: `act_${Date.now()}`,
      appName: updatedApp.appName,
      packageName: updatedApp.packageName,
      durationMinutes: 0,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      eventType: updatedApp.blocked ? 'BLOCKED_ATTEMPT' : 'OVERRIDE_GRANTED',
      details: updatedApp.blocked ? `Aplikasi ${updatedApp.appName} disekat oleh ibu bapa.` : `Aplikasi ${updatedApp.appName} dibenarkan.`,
    };
    await dbPut('activities', newAct.id, newAct);
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleAddAppRule = async (newApp: AppRule) => {
    await dbPut('appRules', newApp.packageName, newApp);
    setAppRules((prev) => {
      const idx = prev.findIndex((a) => a.packageName.toLowerCase() === newApp.packageName.toLowerCase());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newApp;
        return copy;
      }
      return [newApp, ...prev];
    });

    // Record activity
    const newAct: ActivityRecord = {
      id: `act_${Date.now()}`,
      appName: newApp.appName,
      packageName: newApp.packageName,
      durationMinutes: 0,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      eventType: newApp.blocked ? 'BLOCKED_ATTEMPT' : 'CONFIG_CHANGE',
      details: `Aplikasi ${newApp.appName} didaftarkan secara manual untuk ${newApp.installedDevice || 'Semua Peranti'} (${newApp.blocked ? 'Disekat Serta-merta' : 'Dihadkan ' + newApp.timeLimitMinutes + 'm'}).`,
    };
    await dbPut('activities', newAct.id, newAct);
    setActivities((prev) => [newAct, ...prev]);

    // Notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: Date.now(),
      type: newApp.blocked ? 'BLOCKED' : 'SECURITY',
      title: 'Aplikasi Ditambah ke Senarai Sekatan',
      message: `Aplikasi "${newApp.appName}" (${newApp.installedDevice || 'Peranti Anak'}) telah didaftarkan dan ${newApp.blocked ? 'disekat' : 'ditetapkan had'}.`,
      isRead: false,
    };
    await dbPut('notifications', newNotif.id, newNotif);
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleDeleteAppRule = async (packageName: string) => {
    const target = appRules.find((a) => a.packageName.toLowerCase() === packageName.toLowerCase());
    await dbDelete('appRules', packageName);
    setAppRules((prev) => prev.filter((a) => a.packageName.toLowerCase() !== packageName.toLowerCase()));

    if (target) {
      const newAct: ActivityRecord = {
        id: `act_${Date.now()}`,
        appName: target.appName,
        packageName: target.packageName,
        durationMinutes: 0,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        eventType: 'CONFIG_CHANGE',
        details: `Aplikasi ${target.appName} telah dikeluarkan daripada senarai sekatan oleh ibu bapa.`,
      };
      await dbPut('activities', newAct.id, newAct);
      setActivities((prev) => [newAct, ...prev]);
    }
  };

  const handleBulkUpdateApps = async (
    action: 'ALLOW_ALL' | 'BLOCK_ALL' | 'SET_LIMIT',
    limitMin?: number
  ) => {
    const updatedList = appRules.map((app) => {
      if (app.isAlwaysAllowed) return app;
      if (action === 'ALLOW_ALL') {
        return { ...app, blocked: false };
      }
      if (action === 'BLOCK_ALL') {
        return { ...app, blocked: true };
      }
      if (action === 'SET_LIMIT' && limitMin !== undefined) {
        return { ...app, timeLimitMinutes: limitMin };
      }
      return app;
    });

    for (const app of updatedList) {
      await dbPut('appRules', app.packageName, app);
    }
    setAppRules(updatedList);
  };

  const handleUpdateBrowserRule = async (updated: BrowserRule) => {
    await dbPut('browserRules', updated.packageName, updated);
    setBrowserRules((prev) =>
      prev.map((b) => (b.packageName === updated.packageName ? updated : b))
    );
  };

  const handleBulkUpdateBrowsers = async (action: 'ALLOW_ALL' | 'BLOCK_ALL') => {
    const updatedList = browserRules.map((b) => ({
      ...b,
      blocked: action === 'BLOCK_ALL',
    }));
    for (const b of updatedList) {
      await dbPut('browserRules', b.packageName, b);
    }
    setBrowserRules(updatedList);
  };

  const handleToggleInternet = async () => {
    const updated: InternetControlState = {
      blocked: !internetState.blocked,
      reason: !internetState.blocked ? 'Sekatan Internet Ibu Bapa' : null,
    };
    await dbPut('internet', 'status', updated);
    setInternetState(updated);

    if (updated.blocked) {
      androidBridge.blockNetworkTraffic();
    } else {
      androidBridge.allowNetworkTraffic();
    }

    const evaluated = await ScreenTimeEngine.evaluateCurrentState(screenTime, schedules, updated);
    setAppState(evaluated);
  };

  const handleToggleAlwaysAllowed = async (packageName: string, isAllowed: boolean) => {
    const target = appRules.find((a) => a.packageName === packageName);
    if (!target) return;
    const updated: AppRule = {
      ...target,
      isAlwaysAllowed: isAllowed,
      blocked: isAllowed ? false : target.blocked,
    };
    await dbPut('appRules', updated.packageName, updated);
    setAppRules((prev) => prev.map((a) => (a.packageName === packageName ? updated : a)));
  };

  const handleLockDeviceNow = async () => {
    const lockedState: EvaluatedState = {
      state: 'LOCKED',
      isLocked: true,
      reason: 'Peranti dikunci secara manual oleh ibu bapa.',
      remainingMinutes: 0,
    };
    setAppState(lockedState);
    androidBridge.lockDevice();
    androidBridge.startLockTask();

    const newAct: ActivityRecord = {
      id: `act_${Date.now()}`,
      appName: 'Device Lock System',
      packageName: 'com.mysmartsurf.parentalcontrol',
      durationMinutes: 0,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      eventType: 'LOCK_EVENT',
      details: 'Peranti dikunci serta-merta oleh ibu bapa.',
    };
    await dbPut('activities', newAct.id, newAct);
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleUnlockDeviceNow = async () => {
    const evaluated = await ScreenTimeEngine.evaluateCurrentState(
      screenTime,
      schedules,
      internetState
    );
    setAppState(evaluated);
    androidBridge.stopLockTask();
  };

  const handleGrantTemporaryAccess = async (minutes: number) => {
    const result = await ScreenTimeEngine.grantTemporaryOverride(minutes);
    setAppState(result);
    androidBridge.stopLockTask();

    const newAct: ActivityRecord = {
      id: `act_${Date.now()}`,
      appName: 'Parent Override',
      packageName: 'com.mysmartsurf.parentalcontrol',
      durationMinutes: minutes,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      eventType: 'OVERRIDE_GRANTED',
      details: `Akses sementara selama ${minutes} minit diberikan oleh ibu bapa.`,
    };
    await dbPut('activities', newAct.id, newAct);
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleSaveSchedule = async (sch: ScheduleItem) => {
    await dbPut('schedules', sch.id, sch);
    setSchedules((prev) => {
      const idx = prev.findIndex((s) => s.id === sch.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = sch;
        return copy;
      }
      return [...prev, sch];
    });

    const evaluated = await ScreenTimeEngine.evaluateCurrentState(screenTime, schedules, internetState);
    setAppState(evaluated);
  };

  const handleDeleteSchedule = async (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    // Remove from db
    const evaluated = await ScreenTimeEngine.evaluateCurrentState(screenTime, updated, internetState);
    setAppState(evaluated);
  };

  const handleToggleSchedule = async (id: string, enabled: boolean) => {
    const target = schedules.find((s) => s.id === id);
    if (!target) return;
    const updated = { ...target, enabled };
    await dbPut('schedules', id, updated);
    setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));

    const evaluated = await ScreenTimeEngine.evaluateCurrentState(
      screenTime,
      schedules.map((s) => (s.id === id ? updated : s)),
      internetState
    );
    setAppState(evaluated);
  };

  const handleChangeParentPassword = async (newHash: string, newSalt: string) => {
    if (!securityConfig) return;
    const updated: SecurityConfig = {
      ...securityConfig,
      parentPasswordHash: newHash,
      parentPasswordSalt: newSalt,
    };
    await dbPut('security', 'config', updated);
    setSecurityConfig(updated);
  };

  const handleUpdateSecurityConfig = async (updated: SecurityConfig) => {
    await dbPut('security', 'config', updated);
    setSecurityConfig(updated);
  };

  const handleMarkAllNotifsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    for (const n of updated) {
      await dbPut('notifications', n.id, n);
    }
    setNotifications(updated);
  };

  const handleClearNotifications = async () => {
    setNotifications([]);
  };

  const handleResetAllData = async () => {
    await dbClearAll();
    setIsFirstSetupNeeded(true);
  };

  const handleToggleDemoMode = () => {
    const newDemo = !bridgeStatus.demoMode;
    androidBridge.setDemoMode(newDemo);
    setBridgeStatus(androidBridge.getStatus());
  };

  // Unread notifications counter
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Render initial loading screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#090A0C] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 animate-pulse flex items-center justify-center text-white font-black text-xl mb-4 shadow-xl shadow-blue-600/30">
          MS
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight">MYSMART SURF</h1>
        <p className="text-xs text-gray-500 mt-1 font-mono">Memulakan Enjin Pangkalan Data Offline...</p>
      </div>
    );
  }

  // Render First Setup Onboarding Flow if not initialized
  if (isFirstSetupNeeded) {
    return <FirstSetup onComplete={handleFirstSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#090A0C] text-[#E2E8F0] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. TOP HEADER */}
      <Header
        activeTab={activeTab}
        appState={appState}
        bridgeStatus={bridgeStatus}
        unreadNotifsCount={unreadCount}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onNavigate={(tab) => {
          if (tab === 'native_apk' && !developerMode) {
            setActiveTab('dashboard');
          } else {
            setActiveTab(tab);
          }
        }}
        onRequestLock={() => setQuickLockAuthModal(true)}
        onToggleDemoMode={handleToggleDemoMode}
        developerMode={developerMode}
      />

      {/* 2. MAIN WORKSPACE WITH SIDEBAR + TAB CONTENT */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto overflow-hidden">
        {/* Navigation Sidebar & Drawer */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'native_apk' && !developerMode) {
              setActiveTab('dashboard');
            } else {
              setActiveTab(tab);
            }
          }}
          unreadNotifsCount={unreadCount}
          developerMode={developerMode}
        />

        {/* Content Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-65px)]">
          {activeTab === 'dashboard' && (
            <DashboardTab
              screenTime={screenTime}
              appRules={appRules}
              browserRules={browserRules}
              internetState={internetState}
              activities={activities}
              onNavigate={(tab) => setActiveTab(tab)}
              onLockDevice={handleLockDeviceNow}
              onToggleInternet={handleToggleInternet}
              onToggleAppRestrictions={() => handleBulkUpdateApps('BLOCK_ALL')}
              onPauseDevice={handleGrantTemporaryAccess}
            />
          )}

          {activeTab === 'screentime' && (
            <ScreenTimeTab
              screenTime={screenTime}
              onUpdateLimit={handleUpdateScreenTimeLimit}
              onAddSimulatedUsage={handleAddSimulatedUsage}
              onResetUsageToday={handleResetUsageToday}
            />
          )}

          {activeTab === 'apps' && (
            <AppsTab
              appRules={appRules}
              onUpdateAppRule={handleUpdateAppRule}
              onBulkUpdateApps={handleBulkUpdateApps}
              onAddAppRule={handleAddAppRule}
              onDeleteAppRule={handleDeleteAppRule}
            />
          )}

          {activeTab === 'browsers' && (
            <BrowsersTab
              browserRules={browserRules}
              onUpdateBrowserRule={handleUpdateBrowserRule}
              onBulkUpdateBrowsers={handleBulkUpdateBrowsers}
            />
          )}

          {activeTab === 'internet' && (
            <InternetTab
              internetState={internetState}
              bridgeStatus={bridgeStatus}
              onToggleInternet={handleToggleInternet}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleTab
              schedules={schedules}
              onSaveSchedule={handleSaveSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              onToggleSchedule={handleToggleSchedule}
            />
          )}

          {activeTab === 'allowed' && (
            <AllowedAppsTab
              appRules={appRules}
              onToggleAlwaysAllowed={handleToggleAlwaysAllowed}
            />
          )}

          {activeTab === 'devicelock' && (
            <DeviceLockTab
              isDeviceLocked={appState.isLocked}
              onLockNow={handleLockDeviceNow}
              onUnlockNow={handleUnlockDeviceNow}
              onGrantTemporaryAccess={handleGrantTemporaryAccess}
            />
          )}

          {activeTab === 'activity' && <ActivityTab activities={activities} />}

          {activeTab === 'reports' && <ReportsTab />}

          {activeTab === 'notifications' && (
            <NotificationsTab
              notifications={notifications}
              onMarkAllRead={handleMarkAllNotifsRead}
              onClearNotifications={handleClearNotifications}
            />
          )}

          {activeTab === 'security' && securityConfig && (
            <SecurityTab
              securityConfig={securityConfig}
              bridgeStatus={bridgeStatus}
              onChangePassword={handleChangeParentPassword}
              onUpdateSecurityConfig={handleUpdateSecurityConfig}
            />
          )}

          {activeTab === 'native_apk' && (
            <NativeApkTab
              bridgeStatus={bridgeStatus}
              onRefreshBridge={() => setBridgeStatus(androidBridge.getStatus())}
              developerMode={developerMode}
              onToggleDeveloperMode={handleToggleDeveloperMode}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              darkMode={darkMode}
              onToggleTheme={() => setDarkMode(!darkMode)}
              onResetAllData={handleResetAllData}
              developerMode={developerMode}
              onToggleDeveloperMode={handleToggleDeveloperMode}
              onNavigate={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* 3. FULLSCREEN KIOSK LOCK OVERLAY (When device is locked or limit reached) */}
      <DeviceLockOverlay
        isOpen={appState.isLocked}
        reason={appState.reason}
        whitelistApps={appRules.filter((a) => a.isAlwaysAllowed)}
        onUnlockSuccess={handleUnlockDeviceNow}
        onGrantTemporary={handleGrantTemporaryAccess}
      />

      {/* Quick Lock Confirmation Modal */}
      <ParentAuthModal
        isOpen={quickLockAuthModal}
        title="Kunci Peranti Serta-Merta"
        description="Sila masukkan kata laluan ibu bapa untuk mengunci peranti ini serta-merta."
        onSuccess={() => {
          setQuickLockAuthModal(false);
          handleLockDeviceNow();
        }}
        onCancel={() => setQuickLockAuthModal(false)}
      />
    </div>
  );
}
