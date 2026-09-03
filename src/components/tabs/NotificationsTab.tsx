/**
 * MYSMART SURF - Notifications & Warnings Tab Component
 */

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
  Trash2,
  Shield,
  Filter,
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationsTabProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => Promise<void>;
  onClearNotifications: () => Promise<void>;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
  onMarkAllRead,
  onClearNotifications,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const getIconForNotif = (type: NotificationItem['type']) => {
    switch (type) {
      case 'WARNING_15M':
      case 'WARNING_5M':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'LIMIT_REACHED':
      case 'LOCK':
        return <Lock className="w-4 h-4 text-rose-400" />;
      case 'OVERRIDE':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">NOTIFIKASI & AMARAN MASA</h2>
              <p className="text-xs text-slate-400">
                Log sistem peringatan 15 minit, 5 minit sebelum tamat, dan sekatan had masa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Tanda Semua Dibaca
            </button>
            <button
              onClick={onClearNotifications}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
              title="Padam Semua Notifikasi"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setFilter('ALL')}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold cursor-pointer ${
              filter === 'ALL'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold cursor-pointer ${
              filter === 'UNREAD'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Belum Dibaca ({notifications.filter((n) => !n.read).length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-sm">
            Tiada notifikasi pada masa ini.
          </div>
        ) : (
          filteredNotifs.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 flex items-start gap-3 transition-colors ${
                !item.read ? 'border-sky-500/40 bg-sky-950/10' : 'border-slate-800/80'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-800 shrink-0 mt-0.5">
                {getIconForNotif(item.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
