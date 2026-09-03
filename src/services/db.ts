/**
 * MYSMART SURF - Offline-First IndexedDB Database Layer
 */

import {
  UserCredential,
  ScreenTimeConfig,
  AppRule,
  BrowserRule,
  InternetControlState,
  ScheduleItem,
  ActivityRecord,
  NotificationItem,
  ParentOverrideState,
  SecurityConfig,
} from '../types';

const DB_NAME = 'mysmart_surf_db';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

// Initial Default Apps
export const DEFAULT_APP_RULES: AppRule[] = [
  {
    packageName: 'com.google.android.youtube',
    appName: 'YouTube',
    icon: 'youtube',
    category: 'video',
    blocked: false,
    allowed: true,
    timeLimitMinutes: 60, // 1 hour
    usedMinutesToday: 42,
    isAlwaysAllowed: false,
    installedDevice: 'Peranti Semasa Ini (Local Active Container)',
  },
  {
    packageName: 'com.zhiliaoapp.musically',
    appName: 'TikTok',
    icon: 'video',
    category: 'video',
    blocked: false,
    allowed: true,
    timeLimitMinutes: 45,
    usedMinutesToday: 30,
    isAlwaysAllowed: false,
    installedDevice: 'Peranti Semasa Ini (Local Active Container)',
  },
  {
    packageName: 'com.roblox.client',
    appName: 'Roblox',
    icon: 'gamepad-2',
    category: 'games',
    blocked: false,
    allowed: true,
    timeLimitMinutes: 60,
    usedMinutesToday: 55,
    isAlwaysAllowed: false,
    installedDevice: 'Peranti Semasa Ini (Local Active Container)',
  },
  {
    packageName: 'com.whatsapp',
    appName: 'WhatsApp',
    icon: 'message-circle',
    category: 'social',
    blocked: false,
    allowed: true,
    timeLimitMinutes: 120,
    usedMinutesToday: 35,
    isAlwaysAllowed: false,
    installedDevice: 'Peranti Semasa Ini (Local Active Container)',
  },
  {
    packageName: 'com.instagram.android',
    appName: 'Instagram',
    icon: 'camera',
    category: 'social',
    blocked: false,
    allowed: true,
    timeLimitMinutes: 60,
    usedMinutesToday: 20,
    isAlwaysAllowed: false,
    installedDevice: 'Peranti Semasa Ini (Local Active Container)',
  },
  {
    packageName: 'com.google.android.calculator',
    appName: 'Calculator',
    icon: 'calculator',
    category: 'utility',
    blocked: false,
    allowed: true,
    timeLimitMinutes: 0,
    usedMinutesToday: 5,
    isAlwaysAllowed: true, // Always allowed
    installedDevice: 'Peranti Semasa Ini (Local Active Container)',
  },
  {
    packageName: 'com.google.android.calendar',
    appName: 'Calendar',
    icon: 'calendar',
    category: 'utility',
    blocked: false,
    allowed: true,
    timeLimitMinutes: 0,
    usedMinutesToday: 3,
    isAlwaysAllowed: true, // Always allowed
    installedDevice: 'Peranti Semasa Ini (Local Active Container)',
  },
  {
    packageName: 'com.google.android.deskclock',
    appName: 'Clock',
    icon: 'clock',
    category: 'utility',
    blocked: false,
    allowed: true,
    timeLimitMinutes: 0,
    usedMinutesToday: 2,
    isAlwaysAllowed: true, // Always allowed
    installedDevice: 'Peranti Semasa Ini (Local Active Container)',
  },
  {
    packageName: 'com.google.android.dialer',
    appName: 'Phone / Emergency Contact',
    icon: 'phone',
    category: 'utility',
    blocked: false,
    allowed: true,
    timeLimitMinutes: 0,
    usedMinutesToday: 4,
    isAlwaysAllowed: true, // Always allowed
    installedDevice: 'Peranti Semasa Ini (Local Active Container)',
  },
  {
    packageName: 'org.khanacademy.android',
    appName: 'Khan Academy / Educational Apps',
    icon: 'book-open',
    category: 'education',
    blocked: false,
    allowed: true,
    timeLimitMinutes: 0,
    usedMinutesToday: 25,
    isAlwaysAllowed: true,
    installedDevice: 'Peranti Semasa Ini (Local Active Container)',
  },
];

// Initial Default Browsers
export const DEFAULT_BROWSER_RULES: BrowserRule[] = [
  {
    packageName: 'com.android.chrome',
    browserName: 'Google Chrome',
    icon: 'globe',
    blocked: false,
    timeLimitMinutes: 60,
    usedMinutesToday: 28,
    internetRestricted: false,
  },
  {
    packageName: 'org.mozilla.firefox',
    browserName: 'Mozilla Firefox',
    icon: 'globe',
    blocked: false,
    timeLimitMinutes: 60,
    usedMinutesToday: 0,
    internetRestricted: false,
  },
  {
    packageName: 'com.microsoft.emmx',
    browserName: 'Microsoft Edge',
    icon: 'globe',
    blocked: false,
    timeLimitMinutes: 60,
    usedMinutesToday: 0,
    internetRestricted: false,
  },
  {
    packageName: 'com.sec.android.app.sbrowser',
    browserName: 'Samsung Internet',
    icon: 'globe',
    blocked: false,
    timeLimitMinutes: 60,
    usedMinutesToday: 0,
    internetRestricted: false,
  },
  {
    packageName: 'com.opera.browser',
    browserName: 'Opera Browser',
    icon: 'globe',
    blocked: false,
    timeLimitMinutes: 60,
    usedMinutesToday: 0,
    internetRestricted: false,
  },
];

// Initial Schedules
export const DEFAULT_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch_school',
    name: 'School Time',
    days: [1, 2, 3, 4, 5], // Monday - Friday
    startTime: '07:30',
    endTime: '14:00',
    action: 'RESTRICT_DEVICE',
    allowedAppPackages: [
      'com.google.android.calculator',
      'com.google.android.calendar',
      'com.google.android.dialer',
      'org.khanacademy.android',
    ],
    enabled: true,
  },
  {
    id: 'sch_study',
    name: 'Study Time',
    days: [1, 2, 3, 4, 5],
    startTime: '16:00',
    endTime: '18:00',
    action: 'STUDY_ALLOWED_ONLY',
    allowedAppPackages: [
      'com.google.android.calculator',
      'com.google.android.calendar',
      'org.khanacademy.android',
    ],
    enabled: true,
  },
  {
    id: 'sch_sleep',
    name: 'Sleep Time',
    days: [0, 1, 2, 3, 4, 5, 6], // Everyday
    startTime: '22:00',
    endTime: '07:00',
    action: 'LOCK',
    allowedAppPackages: ['com.google.android.dialer'],
    enabled: true,
  },
];

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      const stores = [
        { name: 'users', keyPath: 'id' },
        { name: 'screenTime', keyPath: 'id' },
        { name: 'screentime', keyPath: 'id' },
        { name: 'appRules', keyPath: 'packageName' },
        { name: 'app_rules', keyPath: 'packageName' },
        { name: 'browserRules', keyPath: 'packageName' },
        { name: 'browser_rules', keyPath: 'packageName' },
        { name: 'internet', keyPath: 'id' },
        { name: 'internet_control', keyPath: 'id' },
        { name: 'schedules', keyPath: 'id' },
        { name: 'activities', keyPath: 'id' },
        { name: 'notifications', keyPath: 'id' },
        { name: 'security', keyPath: 'id' },
        { name: 'security_settings', keyPath: 'id' },
        { name: 'parent_override', keyPath: 'id' },
      ];

      for (const s of stores) {
        if (!db.objectStoreNames.contains(s.name)) {
          db.createObjectStore(s.name, { keyPath: s.keyPath });
        }
      }
    };
  });
}

// Normalize store names
function normalizeStore(name: string): string {
  if (name === 'screentime') return 'screenTime';
  if (name === 'app_rules') return 'appRules';
  if (name === 'browser_rules') return 'browserRules';
  if (name === 'internet_control') return 'internet';
  if (name === 'security_settings') return 'security';
  return name;
}

// Generic store operations
export async function dbGet<T>(storeName: string, key: string | number): Promise<T | null> {
  try {
    const db = await getDB();
    const actualStore = normalizeStore(storeName);
    const storeToUse = db.objectStoreNames.contains(actualStore) ? actualStore : storeName;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeToUse, 'readonly');
      const store = tx.objectStore(storeToUse);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn(`dbGet error on ${storeName}:`, e);
    return null;
  }
}

export async function dbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await getDB();
    const actualStore = normalizeStore(storeName);
    const storeToUse = db.objectStoreNames.contains(actualStore) ? actualStore : storeName;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeToUse, 'readonly');
      const store = tx.objectStore(storeToUse);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn(`dbGetAll error on ${storeName}:`, e);
    return [];
  }
}

export async function dbPut<T>(storeName: string, keyOrValue: any, maybeValue?: any): Promise<void> {
  const db = await getDB();
  const actualStore = normalizeStore(storeName);
  const storeToUse = db.objectStoreNames.contains(actualStore) ? actualStore : storeName;

  let valueToStore = maybeValue !== undefined ? maybeValue : keyOrValue;
  if (maybeValue !== undefined && typeof keyOrValue === 'string' && typeof valueToStore === 'object' && valueToStore !== null) {
    // If the object doesn't have an id or packageName matching, add id
    if (!valueToStore.id && !valueToStore.packageName) {
      valueToStore = { ...valueToStore, id: keyOrValue };
    }
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeToUse, 'readwrite');
    const store = tx.objectStore(storeToUse);
    const req = store.put(valueToStore);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbDelete(storeName: string, key: string | number): Promise<void> {
  const db = await getDB();
  const actualStore = normalizeStore(storeName);
  const storeToUse = db.objectStoreNames.contains(actualStore) ? actualStore : storeName;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeToUse, 'readwrite');
    const store = tx.objectStore(storeToUse);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbClearAll(): Promise<void> {
  const db = await getDB();
  const stores = Array.from(db.objectStoreNames);
  for (const storeName of stores) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

// Initialize seed data if empty
export async function initializeDatabase() {
  const db = await getDB();

  // Screen time
  const screenTime = await dbGet<ScreenTimeConfig & { id: string }>('screenTime', 'daily');
  if (!screenTime) {
    const today = new Date().toISOString().split('T')[0];
    await dbPut('screenTime', 'daily', {
      id: 'daily',
      dailyLimitMinutes: 300, // 5 hours (05j 00m)
      usedMinutesToday: 225, // 3 hours 45 mins (03j 45m)
      remainingMinutesToday: 75, // 1 hour 15 mins (01j 15m)
      enabled: true,
      lastUpdatedDate: today,
    });
  }

  // App Rules
  const existingApps = await dbGetAll<AppRule>('appRules');
  if (existingApps.length === 0) {
    for (const app of DEFAULT_APP_RULES) {
      await dbPut('appRules', app.packageName, app);
    }
  }

  // Browser Rules
  const existingBrowsers = await dbGetAll<BrowserRule>('browserRules');
  if (existingBrowsers.length === 0) {
    for (const browser of DEFAULT_BROWSER_RULES) {
      await dbPut('browserRules', browser.packageName, browser);
    }
  }

  // Internet Control
  const internetControl = await dbGet<InternetControlState & { id: string }>('internet', 'status');
  if (!internetControl) {
    await dbPut('internet', 'status', {
      id: 'status',
      blocked: false,
      status: 'ALLOWED',
      mode: 'DEVICE_POLICY',
      lastToggledAt: Date.now(),
    });
  }

  // Schedules
  const existingSchedules = await dbGetAll<ScheduleItem>('schedules');
  if (existingSchedules.length === 0) {
    for (const sch of DEFAULT_SCHEDULES) {
      await dbPut('schedules', sch.id, sch);
    }
  }

  // Security Settings
  const sec = await dbGet<SecurityConfig & { id: string }>('security', 'config');
  if (!sec) {
    await dbPut('security', 'config', {
      id: 'config',
      parentPasswordHash: '',
      parentPasswordSalt: '',
      sessionTimeoutMinutes: 5,
      uninstallProtectionEnabled: true,
      requireAuthForUninstall: true,
      requireAuthOnAction: true,
      failedAuthAttempts: 0,
      isLockedOut: false,
      lockedUntil: null,
      emergencyContact: '+6012-3456789 (Ibu / Bapa)',
    });
  }

  // Initial Seed Activities for Reports
  const activities = await dbGetAll<ActivityRecord>('activities');
  if (activities.length === 0) {
    const seedRecords: ActivityRecord[] = generateHistoricalActivities();
    for (const record of seedRecords) {
      await dbPut('activities', record.id, record);
    }
  }
}

// Generate rich activity logs spanning last 30 days
function generateHistoricalActivities(): ActivityRecord[] {
  const records: ActivityRecord[] = [];
  const now = new Date();

  const appProfiles = [
    { pkg: 'com.google.android.youtube', name: 'YouTube', avgMin: 45 },
    { pkg: 'com.zhiliaoapp.musically', name: 'TikTok', avgMin: 35 },
    { pkg: 'com.roblox.client', name: 'Roblox', avgMin: 50 },
    { pkg: 'com.whatsapp', name: 'WhatsApp', avgMin: 25 },
    { pkg: 'com.android.chrome', name: 'Google Chrome', avgMin: 30 },
    { pkg: 'org.khanacademy.android', name: 'Khan Academy', avgMin: 25 },
  ];

  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    const dateStr = d.toISOString().split('T')[0];

    appProfiles.forEach((app, idx) => {
      const variation = ((daysAgo * 7 + idx * 13) % 25) - 10;
      const duration = Math.max(5, app.avgMin + variation);
      
      records.push({
        id: `act_${dateStr}_${app.pkg}`,
        date: dateStr,
        timestamp: new Date(`${dateStr}T${10 + idx}:30:00`).getTime(),
        packageName: app.pkg,
        appName: app.name,
        durationMinutes: duration,
        eventType: 'USAGE',
      });
    });

    if (daysAgo % 2 === 0) {
      records.push({
        id: `warn_${dateStr}_15m`,
        date: dateStr,
        timestamp: new Date(`${dateStr}T19:45:00`).getTime(),
        packageName: 'system',
        appName: 'Masa Skrin',
        durationMinutes: 0,
        eventType: 'WARNING',
        details: '⚠️ Masa skrin tinggal 15 minit.',
      });
    }

    if (daysAgo % 3 === 0) {
      records.push({
        id: `block_${dateStr}_roblox`,
        date: dateStr,
        timestamp: new Date(`${dateStr}T20:15:00`).getTime(),
        packageName: 'com.roblox.client',
        appName: 'Roblox',
        durationMinutes: 0,
        eventType: 'BLOCKED_ATTEMPT',
        details: 'Aplikasi disekat selepas had masa 1 jam dicapai.',
      });
    }

    if (daysAgo % 7 === 0) {
      records.push({
        id: `lock_${dateStr}_schedule`,
        date: dateStr,
        timestamp: new Date(`${dateStr}T22:00:00`).getTime(),
        packageName: 'system',
        appName: 'Sleep Time Schedule',
        durationMinutes: 0,
        eventType: 'LOCK_EVENT',
        details: 'Peranti dikunci mengikut jadual waktu tidur.',
      });
    }
  }

  return records;
}
