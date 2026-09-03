/**
 * MYSMART SURF - Schedule Tab Component
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  BookOpen,
  Moon,
  School,
  Sparkles,
} from 'lucide-react';
import { ScheduleItem } from '../../types';
import { ScreenTimeEngine } from '../../services/screenTimeEngine';
import { ParentAuthModal } from '../ParentAuthModal';

interface ScheduleTabProps {
  schedules: ScheduleItem[];
  onSaveSchedule: (schedule: ScheduleItem) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
  onToggleSchedule: (id: string, enabled: boolean) => Promise<void>;
}

const DAY_LABELS = [
  { id: 1, name: 'Isnin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Khamis' },
  { id: 5, name: 'Jumaat' },
  { id: 6, name: 'Sabtu' },
  { id: 0, name: 'Ahad' },
];

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  schedules,
  onSaveSchedule,
  onDeleteSchedule,
  onToggleSchedule,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Form State for creating/editing
  const [name, setName] = useState('');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('14:00');
  const [action, setAction] = useState<ScheduleItem['action']>('RESTRICT_DEVICE');

  const handleOpenCreate = () => {
    setName('');
    setDays([1, 2, 3, 4, 5]);
    setStartTime('08:00');
    setEndTime('14:00');
    setAction('RESTRICT_DEVICE');
    setEditingSchedule(null);
    setIsNewModalOpen(true);
  };

  const handleOpenEdit = (sch: ScheduleItem) => {
    setName(sch.name);
    setDays(sch.days);
    setStartTime(sch.startTime);
    setEndTime(sch.endTime);
    setAction(sch.action);
    setEditingSchedule(sch);
    setIsNewModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || days.length === 0) return;
    setShowAuthModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setShowAuthModal(true);
  };

  const handleToggleClick = (id: string, current: boolean) => {
    onToggleSchedule(id, !current);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);

    if (pendingDeleteId) {
      await onDeleteSchedule(pendingDeleteId);
      setPendingDeleteId(null);
      return;
    }

    const newSchedule: ScheduleItem = {
      id: editingSchedule ? editingSchedule.id : `sch_${Date.now()}`,
      name: name.trim(),
      days,
      startTime,
      endTime,
      action,
      allowedAppPackages: [
        'com.google.android.calculator',
        'com.google.android.calendar',
        'org.khanacademy.android',
      ],
      enabled: editingSchedule ? editingSchedule.enabled : true,
    };

    await onSaveSchedule(newSchedule);
    setIsNewModalOpen(false);
    setEditingSchedule(null);
  };

  const toggleDay = (dayId: number) => {
    if (days.includes(dayId)) {
      if (days.length > 1) {
        setDays(days.filter((d) => d !== dayId));
      }
    } else {
      setDays([...days, dayId]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">SCHEDULE (JADUAL PENGGUNAAN)</h2>
            <p className="text-xs text-slate-400">
              Wujudkan jadual waktu sekolah, waktu belajar, atau waktu tidur dengan sekatan automatik.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-3 px-5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Jadual Baru
        </button>
      </div>

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.map((sch) => {
          const isActiveNow = ScreenTimeEngine.isScheduleActiveNow(sch);

          return (
            <div
              key={sch.id}
              className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between transition-all ${
                isActiveNow
                  ? 'border-sky-500/60 bg-sky-950/20 shadow-lg shadow-sky-500/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl ${
                        sch.action === 'LOCK'
                          ? 'bg-rose-500/20 text-rose-400'
                          : sch.action === 'STUDY_ALLOWED_ONLY'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-sky-500/20 text-sky-400'
                      }`}
                    >
                      {sch.action === 'LOCK' ? (
                        <Moon className="w-4 h-4" />
                      ) : sch.action === 'STUDY_ALLOWED_ONLY' ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <School className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{sch.name}</p>
                      {isActiveNow && (
                        <span className="text-[10px] text-sky-400 font-extrabold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                          SEDANG BERKUAT KUASA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle Enable */}
                  <button
                    onClick={() => handleToggleClick(sch.id, sch.enabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      sch.enabled ? 'bg-sky-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        sch.enabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Time & Action Badge */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Masa:
                    </span>
                    <span className="font-mono font-bold text-white">
                      {sch.startTime} – {sch.endTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Tindakan:</span>
                    <span
                      className={`font-semibold ${
                        sch.action === 'LOCK'
                          ? 'text-rose-400'
                          : sch.action === 'STUDY_ALLOWED_ONLY'
                          ? 'text-amber-400'
                          : 'text-sky-400'
                      }`}
                    >
                      {sch.action === 'LOCK'
                        ? 'Kunci Peranti'
                        : sch.action === 'STUDY_ALLOWED_ONLY'
                        ? 'Mod Belajar (Whitelist Sahaja)'
                        : 'Sekat Peranti'}
                    </span>
                  </div>
                </div>

                {/* Days of Week Badges */}
                <div className="flex flex-wrap gap-1">
                  {DAY_LABELS.map((d) => {
                    const isIncluded = sch.days.includes(d.id);
                    return (
                      <span
                        key={d.id}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${
                          isIncluded
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-slate-950 text-slate-600'
                        }`}
                      >
                        {d.name.slice(0, 3)}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Edit / Delete Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(sch)}
                  className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(sch.id)}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingSchedule ? 'Kemaskini Jadual' : 'Cipta Jadual Baru'}
            </h3>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Jadual
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Waktu Belajar Petang"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Masa Mula
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl px-4 py-2.5 text-xs text-slate-100 font-mono outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Masa Tamat
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl px-4 py-2.5 text-xs text-slate-100 font-mono outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hari Berkuat Kuasa
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {DAY_LABELS.map((d) => {
                    const isSelected = days.includes(d.id);
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => toggleDay(d.id)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tindakan Semasa Jadual
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl px-4 py-2.5 text-xs text-slate-100 outline-none cursor-pointer"
                >
                  <option value="RESTRICT_DEVICE">RESTRICT DEVICE (Sekat Aplikasi Umum)</option>
                  <option value="STUDY_ALLOWED_ONLY">STUDY TIME (Benarkan Aplikasi Pendidikan Sahaja)</option>
                  <option value="LOCK">SLEEP TIME (Kunci Peranti Sepenuhnya)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 cursor-pointer"
                >
                  Simpan Jadual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parent Auth Modal */}
      <ParentAuthModal
        isOpen={showAuthModal}
        title="Pengesahan Jadual"
        description="Sila masukkan kata laluan ibu bapa untuk menyimpan perubahan jadual."
        onSuccess={handleAuthSuccess}
        onCancel={() => setShowAuthModal(false)}
      />
    </div>
  );
};
