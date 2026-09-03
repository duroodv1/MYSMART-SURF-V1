/**
 * MYSMART SURF - Core Types & Domain Models
 */

export type AppStateStatus =
  | 'NORMAL'
  | 'WARNING'
  | 'LIMIT_REACHED'
  | 'BLOCKED'
  | 'SCHEDULE_RESTRICTED'
  | 'DEVICE_LOCKED'
  | 'PARENT_OVERRIDE'
  | 'LOCKED';

export type PlatformType = 'android-apk' | 'pwa-standalone' | 'web-browser';

export interface UserCredential {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
  updatedAt: number;
}

export interface ScreenTimeConfig {
  dailyLimitMinutes: number; // 15, 30, ... 480 (8h), or -1 (Unlimited)
  usedMinutesToday: number;
  remainingMinutesToday?: number;
  enabled?: boolean;
  lastUpdatedDate: string; // 'YYYY-MM-DD'
}

export interface AppRule {
  packageName: string;
  appName: string;
  icon: string;
  category: 'social' | 'games' | 'video' | 'productivity' | 'education' | 'utility' | 'system';
  blocked: boolean;
  allowed?: boolean;
  timeLimitMinutes: number; // 0 = no individual limit, or 60 to 480 (15m increments)
  usedMinutesToday: number;
  isAlwaysAllowed: boolean; // Whitelist: Calculator, Calendar, Phone, etc.
  installedDevice?: string; // Target device name (e.g. "Tablet Anak 1", "Telefon Anak 2")
  isCustomAdded?: boolean;
}

export interface BrowserRule {
  packageName: string;
  browserName: string;
  icon: string;
  blocked: boolean;
  timeLimitMinutes: number;
  usedMinutesToday: number;
  internetRestricted: boolean;
}

export interface InternetControlState {
  blocked: boolean;
  status?: 'ALLOWED' | 'BLOCKED';
  mode?: 'VPN_LOCAL' | 'DEVICE_POLICY' | 'PWA_OFFLINE_GUARD';
  lastToggledAt?: number;
  reason?: string | null;
}

export interface ScheduleItem {
  id: string;
  name: string;
  days: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // '07:30'
  endTime: string; // '14:00'
  action: 'RESTRICT_DEVICE' | 'LOCK' | 'STUDY_ALLOWED_ONLY';
  allowedAppPackages: string[];
  enabled: boolean;
}

export type ActivityEventType =
  | 'USAGE'
  | 'BLOCKED_ATTEMPT'
  | 'WARNING'
  | 'LOCK_EVENT'
  | 'OVERRIDE_GRANTED'
  | 'UNINSTALL_ATTEMPT'
  | 'CONFIG_CHANGE';

export interface ActivityRecord {
  id: string;
  date: string; // 'YYYY-MM-DD'
  timestamp: number;
  packageName: string;
  appName: string;
  durationMinutes: number;
  eventType: ActivityEventType;
  details?: string;
}

export interface NotificationItem {
  id: string;
  timestamp: number;
  type:
    | 'WARNING_15M'
    | 'WARNING_5M'
    | 'LIMIT_REACHED'
    | 'BLOCKED'
    | 'SCHEDULE'
    | 'SECURITY'
    | 'LOCK'
    | 'OVERRIDE';
  title: string;
  message: string;
  read?: boolean;
  isRead?: boolean;
}

export interface ParentOverrideState {
  active: boolean;
  expiresAt: number | null;
  grantedDurationMinutes: number;
}

export interface SecurityConfig {
  id?: string;
  parentPasswordHash: string;
  parentPasswordSalt: string;
  sessionTimeoutMinutes: number;
  uninstallProtectionEnabled?: boolean;
  requireAuthForUninstall?: boolean;
  requireAuthOnAction?: boolean;
  failedAuthAttempts?: number;
  isLockedOut?: boolean;
  lockedUntil?: number | null;
  emergencyContact?: string;
}

export type SecuritySettings = SecurityConfig;

export interface AndroidBridgeStatus {
  isNativeBridgeAvailable: boolean;
  hasUsageAccess?: boolean;
  hasOverlayPermission?: boolean;
  isDeviceAdmin?: boolean;
  isDeviceOwner?: boolean;
  hasNotificationPermission?: boolean;
  isVpnActive?: boolean;
  isDeviceLocked?: boolean;
  isInternetBlocked?: boolean;
  deviceAdminGranted?: boolean;
  usageStatsGranted?: boolean;
  demoMode: boolean;
  deviceModel: string;
  androidVersion: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'screentime'
  | 'apps'
  | 'browsers'
  | 'internet'
  | 'schedule'
  | 'allowed'
  | 'devicelock'
  | 'activity'
  | 'reports'
  | 'notifications'
  | 'security'
  | 'native_apk'
  | 'settings';
