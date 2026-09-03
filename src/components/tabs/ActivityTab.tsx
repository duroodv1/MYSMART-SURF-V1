/**
 * MYSMART SURF - Activity Monitoring Tab Component
 */

import React, { useState } from 'react';
import {
  Activity as ActivityIcon,
  Search,
  Filter,
  Clock,
  ShieldAlert,
  Lock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { ActivityRecord, ActivityEventType } from '../../types';

interface ActivityTabProps {
  activities: ActivityRecord[];
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ activities }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.details && act.details.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'ALL' || act.eventType === filterType;
    return matchesSearch && matchesType;
  });

  const getEventBadge = (type: ActivityEventType) => {
    switch (type) {
      case 'USAGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Clock className="w-3 h-3" /> PENGGUNAAN
          </span>
        );
      case 'BLOCKED_ATTEMPT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-3 h-3" /> DISEKAT
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> AMARAN MASA
          </span>
        );
      case 'LOCK_EVENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Lock className="w-3 h-3" /> PERANTI DIKUNCI
          </span>
        );
      case 'OVERRIDE_GRANTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> AKSES IBU BAPA
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <ActivityIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">ACTIVITY MONITORING (LOG AKTIVITI)</h2>
            <p className="text-xs text-slate-400">
              Rekod masa nyata penggunaan aplikasi, amaran masa, percubaan pembukaan disekat, dan status kunci.
            </p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam rekod aktiviti..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'USAGE', label: 'Penggunaan' },
              { id: 'BLOCKED_ATTEMPT', label: 'Disekat' },
              { id: 'WARNING', label: 'Amaran' },
              { id: 'LOCK_EVENT', label: 'Kunci' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  filterType === f.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-sm">
            Tiada rekod aktiviti dijumpai untuk kriteria carian semasa.
          </div>
        ) : (
          filteredActivities.map((act) => {
            const timeStr = new Date(act.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={act.id}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs mt-0.5 shrink-0">
                    {act.appName.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-white">{act.appName}</p>
                      {getEventBadge(act.eventType)}
                    </div>
                    {act.details && (
                      <p className="text-xs text-slate-400 leading-relaxed">{act.details}</p>
                    )}
                    <p className="text-[10px] text-slate-500 font-mono">{act.packageName}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 shrink-0">
                  {act.durationMinutes > 0 ? (
                    <span className="text-xs font-bold text-slate-200 font-mono">
                      {act.durationMinutes} minit
                    </span>
                  ) : null}
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {act.date} {timeStr}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
