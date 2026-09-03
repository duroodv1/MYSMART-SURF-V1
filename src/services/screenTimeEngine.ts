/**
 * MYSMART SURF - Screen Time, Schedule & Protection Engine
 */

import {
  ScreenTimeConfig,
  ScheduleItem,
  AppStateStatus,
  NotificationItem,
  ActivityRecord,
  ParentOverrideState,
  InternetControlState,
} from '../types';
import { dbGet, dbPut, dbGetAll } from './db';
import { androidBridge } from './androidBridge';

export interface EvaluatedState {
  state: AppStateStatus;
  isLocked: boolean;
  reason: string;
  remainingMinutes: number;
}

export class ScreenTimeEngine {
  private static instance: ScreenTimeEngine;
  private warned15m = false;
  private warned5m = false;
  private warnedLimit = false;

  private constructor() {}

  public static getInstance(): ScreenTimeEngine {
    if (!ScreenTimeEngine.instance) {
      ScreenTimeEngine.instance = new ScreenTimeEngine();
    }
    return ScreenTimeEngine.instance;
  }

  // Format minutes into Malay display string: e.g. 225 min -> "03j 45m"
  public static formatHoursMinutes(totalMinutes: number): string {
    if (totalMinutes < 0) return 'Tanpa Had (Unlimited)';
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const hStr = hours < 10 ? `0${hours}` : `${hours}`;
    const mStr = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hStr}j ${mStr}m`;
  }

  // Format short: e.g. "1j 15m berbaki"
  public static formatRemaining(remainingMinutes: number): string {
    if (remainingMinutes < 0) return 'Masa tanpa had';
    if (remainingMinutes === 0) return '0 minit berbaki';
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}j ${mins}m berbaki`;
    } else if (hours > 0) {
      return `${hours} jam berbaki`;
    } else {
      return `${mins} minit berbaki`;
    }
  }

  // Check if current time falls within schedule
  public static isScheduleActiveNow(sch: ScheduleItem): boolean {
    if (!sch.enabled) return false;

    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = sch.startTime.split(':').map(Number);
    const [endH, endM] = sch.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      if (sch.days.includes(currentDay)) {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      }
      return false;
    }

    // Overnight schedule
    const prevDay = currentDay === 0 ? 6 : currentDay - 1;
    const isAfterStartOnDay = sch.days.includes(currentDay) && currentMinutes >= startMinutes;
    const isBeforeEndNextDay = sch.days.includes(prevDay) && currentMinutes <= endMinutes;

    return isAfterStartOnDay || isBeforeEndNextDay;
  }

  public static async evaluateCurrentState(
    screenTime?: ScreenTimeConfig,
    schedules?: ScheduleItem[],
    internet?: InternetControlState
  ): Promise<EvaluatedState> {
    return ScreenTimeEngine.getInstance().evaluate(screenTime, schedules, internet);
  }

  public static async grantTemporaryOverride(minutes: number): Promise<EvaluatedState> {
    const override: ParentOverrideState = {
      active: true,
      expiresAt: Date.now() + minutes * 60 * 1000,
      grantedDurationMinutes: minutes,
    };
    await dbPut('parent_override', 'current', override);

    return {
      state: 'PARENT_OVERRIDE',
      isLocked: false,
      reason: `Akses sementara ibu bapa aktif (${minutes} minit).`,
      remainingMinutes: minutes,
    };
  }

  public async evaluate(
    passedScreenTime?: ScreenTimeConfig,
    passedSchedules?: ScheduleItem[],
    passedInternet?: InternetControlState
  ): Promise<EvaluatedState> {
    const today = new Date().toISOString().split('T')[0];
    let screenTime = passedScreenTime || (await dbGet<ScreenTimeConfig>('screenTime', 'daily'));

    if (!screenTime) {
      screenTime = {
        dailyLimitMinutes: 300,
        usedMinutesToday: 225,
        remainingMinutesToday: 75,
        enabled: true,
        lastUpdatedDate: today,
      };
    }

    // Reset on new day
    if (screenTime.lastUpdatedDate !== today) {
      screenTime.usedMinutesToday = 0;
      screenTime.lastUpdatedDate = today;
      await dbPut('screenTime', 'daily', screenTime);
      this.warned15m = false;
      this.warned5m = false;
      this.warnedLimit = false;
    }

    // Check Parent Override
    const override = await dbGet<ParentOverrideState>('parent_override', 'current');
    if (override && override.active && override.expiresAt && Date.now() < override.expiresAt) {
      const remainingMs = override.expiresAt - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return {
        state: 'PARENT_OVERRIDE',
        isLocked: false,
        reason: `Akses sementara ibu bapa aktif (${remainingMin} minit lagi)`,
        remainingMinutes: remainingMin,
      };
    }

    // Check Active Schedules
    const schedules = passedSchedules || (await dbGetAll<ScheduleItem>('schedules'));
    for (const sch of schedules) {
      if (ScreenTimeEngine.isScheduleActiveNow(sch)) {
        if (sch.action === 'LOCK') {
          return {
            state: 'DEVICE_LOCKED',
            isLocked: true,
            reason: `Peranti dikunci mengikut jadual: ${sch.name} (${sch.startTime} - ${sch.endTime})`,
            remainingMinutes: 0,
          };
        } else if (sch.action === 'RESTRICT_DEVICE' || sch.action === 'STUDY_ALLOWED_ONLY') {
          return {
            state: 'SCHEDULE_RESTRICTED',
            isLocked: false,
            reason: `Jadual aktif: ${sch.name} (Hanya aplikasi terpilih dibenarkan)`,
            remainingMinutes: 0,
          };
        }
      }
    }

    // Check Daily Screen Time Limit
    if (screenTime.dailyLimitMinutes > 0) {
      const remaining = screenTime.dailyLimitMinutes - screenTime.usedMinutesToday;

      if (remaining <= 0) {
        if (!this.warnedLimit) {
          this.warnedLimit = true;
          this.triggerNotification(
            'LIMIT_REACHED',
            '🔒 Had Masa Skrin Tamat',
            'Had masa skrin harian telah tamat. Peranti dikunci.'
          );
        }
        return {
          state: 'LIMIT_REACHED',
          isLocked: true,
          reason: 'Had masa penggunaan skrin harian telah tamat.',
          remainingMinutes: 0,
        };
      }

      if (remaining <= 5) {
        if (!this.warned5m) {
          this.warned5m = true;
          this.triggerNotification(
            'WARNING_5M',
            '⚠️ Masa Skrin Tinggal 5 Minit',
            'Sila simpan tugasan anda. Masa skrin harian tinggal 5 minit.'
          );
        }
        return {
          state: 'WARNING',
          isLocked: false,
          reason: '⚠️ Masa skrin tinggal 5 minit.',
          remainingMinutes: remaining,
        };
      }

      if (remaining <= 15) {
        if (!this.warned15m) {
          this.warned15m = true;
          this.triggerNotification(
            'WARNING_15M',
            '⚠️ Masa Skrin Tinggal 15 Minit',
            'Peringatan: Masa skrin harian tinggal 15 minit.'
          );
        }
        return {
          state: 'WARNING',
          isLocked: false,
          reason: '⚠️ Masa skrin tinggal 15 minit.',
          remainingMinutes: remaining,
        };
      }

      return {
        state: 'NORMAL',
        isLocked: false,
        reason: 'Sistem beroperasi normal',
        remainingMinutes: remaining,
      };
    }

    return {
      state: 'NORMAL',
      isLocked: false,
      reason: 'Masa skrin tanpa had aktif',
      remainingMinutes: -1,
    };
  }

  private async triggerNotification(type: NotificationItem['type'], title: string, message: string) {
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      timestamp: Date.now(),
      type,
      title,
      message,
      isRead: false,
    };

    await dbPut('notifications', notif.id, notif);
    await androidBridge.sendNotification(title, message);

    const act: ActivityRecord = {
      id: `act_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      packageName: 'system',
      appName: 'Sistem Kawalan MYSMART SURF',
      durationMinutes: 0,
      eventType: type === 'LIMIT_REACHED' ? 'LOCK_EVENT' : 'WARNING',
      details: message,
    };
    await dbPut('activities', act.id, act);
  }
}

export const screenTimeEngine = ScreenTimeEngine.getInstance();
