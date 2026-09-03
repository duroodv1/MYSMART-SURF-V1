/**
 * MYSMART SURF - Analytics & Reporting Service
 * Computes Daily, Weekly, Two-Week, and Monthly Reports from IndexedDB Activity Records.
 */

import { ActivityRecord, AppRule, BrowserRule } from '../types';
import { dbGetAll } from './db';

export interface DailyReportData {
  date: string;
  totalScreenTimeMinutes: number;
  totalAppUsageMinutes: number;
  totalBrowserUsageMinutes: number;
  mostUsedApp: { name: string; minutes: number; icon: string } | null;
  blockedEventsCount: number;
  warningEventsCount: number;
  lockEventsCount: number;
  appBreakdown: { name: string; minutes: number; category: string }[];
}

export interface WeeklyReportData {
  days: {
    dayName: string; // 'Isnin', 'Selasa', etc.
    date: string;
    totalMinutes: number;
    hours: number;
    blockedCount: number;
  }[];
  totalWeekMinutes: number;
  dailyAverageMinutes: number;
  topApp: string;
}

export interface TwoWeekReportData {
  week1TotalMinutes: number;
  week2TotalMinutes: number;
  week1AvgMinutes: number;
  week2AvgMinutes: number;
  differenceMinutes: number;
  percentageChange: number;
  comparisonDays: {
    dayName: string;
    week1Minutes: number;
    week2Minutes: number;
  }[];
}

export interface MonthlyReportData {
  totalScreenTimeHours: number;
  dailyAverageHours: number;
  mostUsedApp: { name: string; hours: number };
  mostUsedBrowser: { name: string; hours: number };
  totalBlocks: number;
  totalWarnings: number;
  totalLockEvents: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  dailyTrend: { dayNumber: number; date: string; hours: number }[];
}

export class ReportService {
  private static DAY_NAMES = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

  public static async getDailyReport(targetDate?: string): Promise<DailyReportData> {
    const dateStr = targetDate || new Date().toISOString().split('T')[0];
    const allActivities = await dbGetAll<ActivityRecord>('activities');
    const dayRecords = allActivities.filter((r) => r.date === dateStr);

    let totalMinutes = 0;
    let browserMinutes = 0;
    let appMinutes = 0;
    let blockedCount = 0;
    let warningCount = 0;
    let lockCount = 0;

    const appUsageMap: Record<string, { minutes: number; category: string }> = {};

    dayRecords.forEach((rec) => {
      if (rec.eventType === 'USAGE') {
        totalMinutes += rec.durationMinutes;
        if (rec.packageName.includes('chrome') || rec.packageName.includes('firefox') || rec.packageName.includes('browser')) {
          browserMinutes += rec.durationMinutes;
        } else {
          appMinutes += rec.durationMinutes;
        }

        if (!appUsageMap[rec.appName]) {
          appUsageMap[rec.appName] = { minutes: 0, category: 'App' };
        }
        appUsageMap[rec.appName].minutes += rec.durationMinutes;
      } else if (rec.eventType === 'BLOCKED_ATTEMPT') {
        blockedCount++;
      } else if (rec.eventType === 'WARNING') {
        warningCount++;
      } else if (rec.eventType === 'LOCK_EVENT') {
        lockCount++;
      }
    });

    let topApp: { name: string; minutes: number; icon: string } | null = null;
    let maxMin = 0;
    const breakdown = Object.entries(appUsageMap).map(([name, data]) => {
      if (data.minutes > maxMin) {
        maxMin = data.minutes;
        topApp = { name, minutes: data.minutes, icon: 'app' };
      }
      return { name, minutes: data.minutes, category: data.category };
    });

    return {
      date: dateStr,
      totalScreenTimeMinutes: totalMinutes,
      totalAppUsageMinutes: appMinutes,
      totalBrowserUsageMinutes: browserMinutes,
      mostUsedApp: topApp || { name: 'Tiada Aktiviti', minutes: 0, icon: 'info' },
      blockedEventsCount: blockedCount,
      warningEventsCount: warningCount,
      lockEventsCount: lockCount,
      appBreakdown: breakdown.sort((a, b) => b.minutes - a.minutes),
    };
  }

  public static async getWeeklyReport(): Promise<WeeklyReportData> {
    const allActivities = await dbGetAll<ActivityRecord>('activities');
    const now = new Date();
    
    // Generate Monday through Sunday of current week
    const currentDay = now.getDay(); // 0 is Sun, 1 is Mon
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const days = [];
    let totalWeekMinutes = 0;
    const appFreq: Record<string, number> = {};

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      const dayName = ReportService.DAY_NAMES[d.getDay()];

      const dayRecords = allActivities.filter((r) => r.date === dStr);
      let dayMin = 0;
      let dayBlocks = 0;

      dayRecords.forEach((r) => {
        if (r.eventType === 'USAGE') {
          dayMin += r.durationMinutes;
          appFreq[r.appName] = (appFreq[r.appName] || 0) + r.durationMinutes;
        } else if (r.eventType === 'BLOCKED_ATTEMPT') {
          dayBlocks++;
        }
      });

      totalWeekMinutes += dayMin;
      days.push({
        dayName,
        date: dStr,
        totalMinutes: dayMin,
        hours: Number((dayMin / 60).toFixed(1)),
        blockedCount: dayBlocks,
      });
    }

    let topAppName = 'YouTube';
    let max = 0;
    Object.entries(appFreq).forEach(([name, min]) => {
      if (min > max) {
        max = min;
        topAppName = name;
      }
    });

    return {
      days,
      totalWeekMinutes,
      dailyAverageMinutes: Math.round(totalWeekMinutes / 7),
      topApp: topAppName,
    };
  }

  public static async getTwoWeekReport(): Promise<TwoWeekReportData> {
    const allActivities = await dbGetAll<ActivityRecord>('activities');
    const now = new Date();

    // Week 2 (Current past 7 days) and Week 1 (Previous 7-14 days)
    const dayPairs: { dayName: string; week1Minutes: number; week2Minutes: number }[] = [];
    let week1Total = 0;
    let week2Total = 0;

    const dayLabels = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'];

    for (let i = 6; i >= 0; i--) {
      // Week 2 day (recent)
      const d2 = new Date(now);
      d2.setDate(now.getDate() - i);
      const d2Str = d2.toISOString().split('T')[0];

      // Week 1 day (7 days prior)
      const d1 = new Date(now);
      d1.setDate(now.getDate() - i - 7);
      const d1Str = d1.toISOString().split('T')[0];

      const w2Min = allActivities
        .filter((r) => r.date === d2Str && r.eventType === 'USAGE')
        .reduce((sum, r) => sum + r.durationMinutes, 0);

      const w1Min = allActivities
        .filter((r) => r.date === d1Str && r.eventType === 'USAGE')
        .reduce((sum, r) => sum + r.durationMinutes, 0);

      week2Total += w2Min;
      week1Total += w1Min;

      dayPairs.push({
        dayName: dayLabels[6 - i],
        week1Minutes: w1Min,
        week2Minutes: w2Min,
      });
    }

    const diff = week2Total - week1Total;
    const pct = week1Total > 0 ? ((diff / week1Total) * 100) : 0;

    return {
      week1TotalMinutes: week1Total,
      week2TotalMinutes: week2Total,
      week1AvgMinutes: Math.round(week1Total / 7),
      week2AvgMinutes: Math.round(week2Total / 7),
      differenceMinutes: diff,
      percentageChange: Number(pct.toFixed(1)),
      comparisonDays: dayPairs,
    };
  }

  public static async getMonthlyReport(): Promise<MonthlyReportData> {
    const allActivities = await dbGetAll<ActivityRecord>('activities');
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const minDateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const recentRecords = allActivities.filter((r) => r.date >= minDateStr);

    let totalMin = 0;
    let totalBlocks = 0;
    let totalWarnings = 0;
    let totalLocks = 0;
    const appMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const dailyMap: Record<string, number> = {};

    recentRecords.forEach((r) => {
      if (r.eventType === 'USAGE') {
        totalMin += r.durationMinutes;
        dailyMap[r.date] = (dailyMap[r.date] || 0) + r.durationMinutes;

        if (r.packageName.includes('chrome') || r.packageName.includes('firefox') || r.packageName.includes('browser')) {
          browserMap[r.appName] = (browserMap[r.appName] || 0) + r.durationMinutes;
        } else {
          appMap[r.appName] = (appMap[r.appName] || 0) + r.durationMinutes;
        }
      } else if (r.eventType === 'BLOCKED_ATTEMPT') {
        totalBlocks++;
      } else if (r.eventType === 'WARNING') {
        totalWarnings++;
      } else if (r.eventType === 'LOCK_EVENT') {
        totalLocks++;
      }
    });

    let topApp = { name: 'YouTube', hours: 0 };
    Object.entries(appMap).forEach(([name, min]) => {
      const h = Number((min / 60).toFixed(1));
      if (h > topApp.hours) topApp = { name, hours: h };
    });

    let topBrowser = { name: 'Google Chrome', hours: 0 };
    Object.entries(browserMap).forEach(([name, min]) => {
      const h = Number((min / 60).toFixed(1));
      if (h > topBrowser.hours) topBrowser = { name, hours: h };
    });

    const dailyTrend = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, min], idx) => ({
        dayNumber: idx + 1,
        date: date.slice(5),
        hours: Number((min / 60).toFixed(1)),
      }));

    return {
      totalScreenTimeHours: Number((totalMin / 60).toFixed(1)),
      dailyAverageHours: Number((totalMin / 30 / 60).toFixed(1)),
      mostUsedApp: topApp,
      mostUsedBrowser: topBrowser,
      totalBlocks,
      totalWarnings,
      totalLockEvents: totalLocks,
      trend: 'stable',
      dailyTrend,
    };
  }
}
