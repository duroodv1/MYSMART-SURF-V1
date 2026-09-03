/**
 * MYSMART SURF - Reports Tab Component
 * Daily, Weekly, Two-Week, and Monthly Reports with Recharts visualizations.
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  Globe,
  LayoutGrid,
  ShieldAlert,
  AlertTriangle,
  Lock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  ReportService,
  DailyReportData,
  WeeklyReportData,
  TwoWeekReportData,
  MonthlyReportData,
} from '../../services/reportService';
import { ScreenTimeEngine } from '../../services/screenTimeEngine';

export const ReportsTab: React.FC = () => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'twoweek' | 'monthly'>('daily');
  const [dailyData, setDailyData] = useState<DailyReportData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyReportData | null>(null);
  const [twoWeekData, setTwoWeekData] = useState<TwoWeekReportData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    setLoading(true);
    try {
      const [d, w, tw, m] = await Promise.all([
        ReportService.getDailyReport(),
        ReportService.getWeeklyReport(),
        ReportService.getTwoWeekReport(),
        ReportService.getMonthlyReport(),
      ]);
      setDailyData(d);
      setWeeklyData(w);
      setTwoWeekData(tw);
      setMonthlyData(m);
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Sub-Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">REPORTS & ANALYTICS</h2>
              <p className="text-xs text-slate-400">
                Laporan komprehensif harian, mingguan, 2 minggu, dan bulanan tabiat penggunaan peranti.
              </p>
            </div>
          </div>

          {/* Report Type Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
            {[
              { id: 'daily', label: 'Harian' },
              { id: 'weekly', label: 'Mingguan' },
              { id: 'twoweek', label: '2 Minggu' },
              { id: 'monthly', label: 'Bulanan' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id as any)}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportType === tab.id
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          Memuatkan laporan analytics...
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. DAILY REPORT */}
          {/* ========================================================================= */}
          {reportType === 'daily' && dailyData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Jumlah Masa Skrin</p>
                  <p className="text-2xl font-extrabold text-white font-mono mt-1">
                    {ScreenTimeEngine.formatHoursMinutes(dailyData.totalScreenTimeMinutes)}
                  </p>
                  <p className="text-[11px] text-sky-400 mt-1">Hari Ini ({dailyData.date})</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Aplikasi Paling Kerap</p>
                  <p className="text-lg font-bold text-indigo-300 truncate mt-1">
                    {dailyData.mostUsedApp?.name || 'Tiada'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {dailyData.mostUsedApp?.minutes || 0} minit digunakan
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Percubaan Disekat</p>
                  <p className="text-2xl font-extrabold text-rose-400 font-mono mt-1">
                    {dailyData.blockedEventsCount}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Sekatan aplikasi / URL</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Amaran Dihantar</p>
                  <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
                    {dailyData.warningEventsCount}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Peringatan 15m & 5m</p>
                </div>
              </div>

              {/* Usage Breakdown List */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-sky-400" />
                  Pecahan Penggunaan Mengikut Aplikasi
                </h3>

                <div className="space-y-3">
                  {dailyData.appBreakdown.map((item) => {
                    const pct = Math.round(
                      (item.minutes / (dailyData.totalScreenTimeMinutes || 1)) * 100
                    );
                    return (
                      <div key={item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{item.name}</span>
                          <span className="font-mono text-slate-400">
                            {item.minutes}m ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-sky-500 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. WEEKLY REPORT */}
          {/* ========================================================================= */}
          {reportType === 'weekly' && weeklyData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Masa Mingguan</p>
                  <p className="text-2xl font-extrabold text-white font-mono mt-1">
                    {ScreenTimeEngine.formatHoursMinutes(weeklyData.totalWeekMinutes)}
                  </p>
                  <p className="text-[11px] text-sky-400 mt-1">Isnin – Ahad</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Purata Harian</p>
                  <p className="text-2xl font-extrabold text-indigo-300 font-mono mt-1">
                    {ScreenTimeEngine.formatHoursMinutes(weeklyData.dailyAverageMinutes)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Setiap hari</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Aplikasi Utama</p>
                  <p className="text-xl font-extrabold text-emerald-400 mt-1">{weeklyData.topApp}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Paling banyak diakses</p>
                </div>
              </div>

              {/* Bar Chart Monday - Sunday */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">
                  Penggunaan Mengikut Hari (Isnin – Ahad)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData.days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="dayName" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} unit="j" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090d16',
                          borderColor: '#334155',
                          borderRadius: '16px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="hours" fill="#0284c7" radius={[8, 8, 0, 0]} name="Jam" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. TWO-WEEK COMPARISON REPORT */}
          {/* ========================================================================= */}
          {reportType === 'twoweek' && twoWeekData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Minggu Lepas (Week 1)</p>
                  <p className="text-2xl font-extrabold text-slate-300 font-mono mt-1">
                    {ScreenTimeEngine.formatHoursMinutes(twoWeekData.week1TotalMinutes)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Purata: {ScreenTimeEngine.formatHoursMinutes(twoWeekData.week1AvgMinutes)}/hari</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Minggu Ini (Week 2)</p>
                  <p className="text-2xl font-extrabold text-sky-400 font-mono mt-1">
                    {ScreenTimeEngine.formatHoursMinutes(twoWeekData.week2TotalMinutes)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Purata: {ScreenTimeEngine.formatHoursMinutes(twoWeekData.week2AvgMinutes)}/hari</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Perubahan Peratusan</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p
                      className={`text-2xl font-extrabold font-mono ${
                        twoWeekData.percentageChange <= 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {twoWeekData.percentageChange > 0 ? `+${twoWeekData.percentageChange}%` : `${twoWeekData.percentageChange}%`}
                    </p>
                    {twoWeekData.percentageChange <= 0 ? (
                      <TrendingDown className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {twoWeekData.percentageChange <= 0 ? 'Penggunaan berkurangan 👍' : 'Penggunaan meningkat'}
                  </p>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">
                  Perbandingan Hari demi Hari (Week 1 vs Week 2)
                </h3>
                <div className="space-y-3">
                  {twoWeekData.comparisonDays.map((row) => (
                    <div
                      key={row.dayName}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-xs"
                    >
                      <span className="font-bold text-slate-200 w-24">{row.dayName}</span>
                      <div className="flex-1 flex items-center justify-center gap-4 font-mono">
                        <span className="text-slate-400">
                          W1: {ScreenTimeEngine.formatHoursMinutes(row.week1Minutes)}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-sky-400 font-bold">
                          W2: {ScreenTimeEngine.formatHoursMinutes(row.week2Minutes)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. MONTHLY REPORT */}
          {/* ========================================================================= */}
          {reportType === 'monthly' && monthlyData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Skrin Bulanan</p>
                  <p className="text-2xl font-extrabold text-white font-mono mt-1">
                    {monthlyData.totalScreenTimeHours} Jam
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">30 Hari Terakhir</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Purata Harian</p>
                  <p className="text-2xl font-extrabold text-indigo-300 font-mono mt-1">
                    {monthlyData.dailyAverageHours} Jam / Hari
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Kadar stabil</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Aplikasi No. 1</p>
                  <p className="text-lg font-bold text-emerald-400 truncate mt-1">
                    {monthlyData.mostUsedApp.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {monthlyData.mostUsedApp.hours} Jam keseluruhan
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Pelayar No. 1</p>
                  <p className="text-lg font-bold text-sky-400 truncate mt-1">
                    {monthlyData.mostUsedBrowser.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {monthlyData.mostUsedBrowser.hours} Jam layaran
                  </p>
                </div>
              </div>

              {/* Monthly Trend Area Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">
                  Trend Penggunaan Skrin 30 Hari (Jam)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData.dailyTrend}>
                      <defs>
                        <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={11} unit="j" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090d16',
                          borderColor: '#334155',
                          borderRadius: '16px',
                          color: '#fff',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="hours"
                        stroke="#38bdf8"
                        fillOpacity={1}
                        fill="url(#colorMonthly)"
                        name="Jam"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Block, Warning & Lock Event Counts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Jumlah Sekatan</p>
                    <p className="text-xl font-bold text-rose-400 font-mono mt-1">
                      {monthlyData.totalBlocks} kali
                    </p>
                  </div>
                  <ShieldAlert className="w-7 h-7 text-rose-400" />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Jumlah Amaran Masa</p>
                    <p className="text-xl font-bold text-amber-400 font-mono mt-1">
                      {monthlyData.totalWarnings} kali
                    </p>
                  </div>
                  <AlertTriangle className="w-7 h-7 text-amber-400" />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Jumlah Kunci Peranti</p>
                    <p className="text-xl font-bold text-purple-400 font-mono mt-1">
                      {monthlyData.totalLockEvents} kali
                    </p>
                  </div>
                  <Lock className="w-7 h-7 text-purple-400" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
