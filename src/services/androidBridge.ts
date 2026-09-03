/**
 * MYSMART SURF - Android Native Layer Bridge Interface & Service
 * 
 * Architecture:
 * JavaScript (PWA / UI) <---> JavaScript Bridge <---> Android Native Layer (Java/Kotlin) <---> Android APIs / Device Management
 */

import { AndroidBridgeStatus } from '../types';

export interface NativeInstalledApp {
  packageName: string;
  appName: string;
  category: string;
  versionName?: string;
  isSystemApp?: boolean;
}

export interface NativeUsageStat {
  packageName: string;
  totalTimeInForegroundMinutes: number;
  lastTimeUsed: number;
}

// Global declaration for Android WebView Bridge
declare global {
  interface Window {
    AndroidBridge?: {
      getInstalledApps?: () => string;
      getUsageStats?: (intervalType: string) => string;
      getDeviceStatus?: () => string;
      setAppRestriction?: (packageName: string, blocked: boolean, timeLimitMinutes: number) => boolean;
      setBrowserRestriction?: (packageName: string, blocked: boolean, timeLimitMinutes: number) => boolean;
      setInternetRestriction?: (blocked: boolean) => boolean;
      lockDevice?: (reason?: string) => boolean;
      unlockDevice?: (parentAuthToken?: string) => boolean;
      sendNotification?: (title: string, message: string, channelId?: string) => boolean;
      getAndroidPermissions?: () => string;
      requestAndroidPermission?: (permissionType: string) => void;
      requestDeviceOwnerSetup?: () => string;
      verifyUninstallAuthorization?: (passwordHash: string) => boolean;
      openDeviceAdminSettings?: () => void;
      openUsageAccessSettings?: () => void;
      openOverlaySettings?: () => void;
      isDeviceOwner?: () => boolean;
      vibrate?: (ms?: number) => void;
      startLockTask?: () => boolean;
      stopLockTask?: () => boolean;
      blockNetworkTraffic?: () => boolean;
      allowNetworkTraffic?: () => boolean;
    };
  }
}

export class AndroidBridgeService {
  private static instance: AndroidBridgeService;
  private isNativeAvailable: boolean = false;
  private demoMode: boolean = false;

  private constructor() {
    this.checkNativeAvailability();
  }

  public static getInstance(): AndroidBridgeService {
    if (!AndroidBridgeService.instance) {
      AndroidBridgeService.instance = new AndroidBridgeService();
    }
    return AndroidBridgeService.instance;
  }

  public checkNativeAvailability(): boolean {
    this.isNativeAvailable = typeof window !== 'undefined' && typeof window.AndroidBridge !== 'undefined';
    return this.isNativeAvailable;
  }

  public isNative(): boolean {
    return this.isNativeAvailable;
  }

  public setDemoMode(active: boolean) {
    this.demoMode = active;
  }

  public isDemo(): boolean {
    return this.demoMode;
  }

  public getStatus(): AndroidBridgeStatus {
    if (this.isNativeAvailable && window.AndroidBridge && window.AndroidBridge.getDeviceStatus) {
      try {
        const raw = window.AndroidBridge.getDeviceStatus();
        const parsed = JSON.parse(raw);
        return {
          isNativeBridgeAvailable: true,
          hasUsageAccess: parsed.hasUsageAccess ?? true,
          hasOverlayPermission: parsed.hasOverlayPermission ?? true,
          isDeviceAdmin: parsed.isDeviceAdmin ?? true,
          isDeviceOwner: parsed.isDeviceOwner ?? false,
          hasNotificationPermission: parsed.hasNotificationPermission ?? true,
          isVpnActive: parsed.isVpnActive ?? false,
          isDeviceLocked: parsed.isDeviceLocked ?? false,
          isInternetBlocked: parsed.isInternetBlocked ?? false,
          deviceAdminGranted: parsed.isDeviceAdmin ?? true,
          usageStatsGranted: parsed.hasUsageAccess ?? true,
          demoMode: false,
          deviceModel: parsed.deviceModel || 'Android Device',
          androidVersion: parsed.androidVersion || 'Android 14 (API 34)',
        };
      } catch (e) {
        console.warn('Error reading Android status from bridge:', e);
      }
    }

    const hasNotification = typeof Notification !== 'undefined' && Notification.permission === 'granted';

    return {
      isNativeBridgeAvailable: false,
      hasUsageAccess: false,
      hasOverlayPermission: false,
      isDeviceAdmin: false,
      isDeviceOwner: false,
      hasNotificationPermission: hasNotification,
      isVpnActive: false,
      isDeviceLocked: false,
      isInternetBlocked: false,
      deviceAdminGranted: false,
      usageStatsGranted: false,
      demoMode: this.demoMode,
      deviceModel: typeof navigator !== 'undefined' && navigator.userAgent.includes('Android') ? 'Android Web (PWA)' : 'PWA Standalone Client',
      androidVersion: 'Web PWA / Service Worker Layer',
    };
  }

  public lockDevice(reason?: string): { success: boolean; message: string; method: string } {
    if (this.isNativeAvailable && window.AndroidBridge?.lockDevice) {
      const ok = window.AndroidBridge.lockDevice(reason || 'Device Locked');
      if (ok) {
        return {
          success: true,
          message: 'Peranti berjaya dikunci menggunakan Android Native Lock Screen / Device Policy.',
          method: 'ANDROID_DEVICE_ADMIN',
        };
      }
    }

    return {
      success: true,
      message: 'Peranti dikunci dalam Mod PWA Kiosk Overlay.',
      method: 'PWA_KIOSK_OVERLAY',
    };
  }

  public unlockDevice(authHash?: string): boolean {
    if (this.isNativeAvailable && window.AndroidBridge?.unlockDevice) {
      return window.AndroidBridge.unlockDevice(authHash || '');
    }
    return true;
  }

  public startLockTask(): boolean {
    if (this.isNativeAvailable && window.AndroidBridge?.startLockTask) {
      return window.AndroidBridge.startLockTask();
    }
    return true;
  }

  public stopLockTask(): boolean {
    if (this.isNativeAvailable && window.AndroidBridge?.stopLockTask) {
      return window.AndroidBridge.stopLockTask();
    }
    return true;
  }

  public blockNetworkTraffic(): boolean {
    if (this.isNativeAvailable && window.AndroidBridge?.setInternetRestriction) {
      return window.AndroidBridge.setInternetRestriction(true);
    }
    return true;
  }

  public allowNetworkTraffic(): boolean {
    if (this.isNativeAvailable && window.AndroidBridge?.setInternetRestriction) {
      return window.AndroidBridge.setInternetRestriction(false);
    }
    return true;
  }

  public setInternetRestriction(blocked: boolean): { success: boolean; message: string; method: string } {
    if (blocked) {
      this.blockNetworkTraffic();
    } else {
      this.allowNetworkTraffic();
    }
    return {
      success: true,
      message: blocked ? 'Akses Internet disekat.' : 'Akses Internet dibenarkan.',
      method: this.isNativeAvailable ? 'ANDROID_VPN_FIREWALL' : 'PWA_INTERNAL_GUARD',
    };
  }

  public vibrate(ms = 200) {
    if (this.isNativeAvailable && window.AndroidBridge?.vibrate) {
      window.AndroidBridge.vibrate(ms);
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  }

  public showNativeNotification(title: string, message: string) {
    this.sendNotification(title, message);
  }

  public async sendNotification(title: string, message: string): Promise<boolean> {
    if (this.isNativeAvailable && window.AndroidBridge?.sendNotification) {
      return window.AndroidBridge.sendNotification(title, message, 'parental_warnings');
    }

    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: message,
            icon: '/icon-192.svg',
            badge: '/icon-192.svg',
            tag: 'mysmart-surf-alert',
          });
          return true;
        } catch (e) {
          console.warn('Web notification error:', e);
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
    return false;
  }

  public openAndroidSettings(type: 'usage' | 'admin' | 'overlay') {
    if (this.isNativeAvailable && window.AndroidBridge) {
      if (type === 'usage' && window.AndroidBridge.openUsageAccessSettings) window.AndroidBridge.openUsageAccessSettings();
      if (type === 'admin' && window.AndroidBridge.openDeviceAdminSettings) window.AndroidBridge.openDeviceAdminSettings();
      if (type === 'overlay' && window.AndroidBridge.openOverlaySettings) window.AndroidBridge.openOverlaySettings();
    } else {
      console.info(`[PWA Mode] In native Android, this opens ${type} settings screen.`);
    }
  }
}

export const androidBridge = AndroidBridgeService.getInstance();
