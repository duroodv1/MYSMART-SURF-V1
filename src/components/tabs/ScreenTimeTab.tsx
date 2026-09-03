/**
 * MYSMART SURF - Screen Time Tab Component
 * 15-Minute increment slider & preset selection up to 8 Hours and Unlimited.
 */

import React, { useState } from 'react';
import {
  Clock,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Minus,
  RotateCcw,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { ScreenTimeConfig } from '../../types';
import { ScreenTimeEngine } from '../../services/screenTimeEngine';
import { ParentAuthModal } from '../ParentAuthModal';

interface ScreenTimeTabProps {
  screenTime: ScreenTimeConfig;
  onUpdateLimit: (minutes: number) => Promise<void>;
  onAddSimulatedUsage: (minutes: number) => Promise<void>;
  onResetUsageToday: () => Promise<void>;
}

export const ScreenTimeTab: React.FC<ScreenTimeTabProps> = ({
  screenTime,
  onUpdateLimit,
  onAddSimulatedUsage,
  onResetUsageToday,
}) => {
  const [selectedLimit, setSelectedLimit] = useState<number>(screenTime.dailyLimitMinutes);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'save_limit' | 'reset' | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Generate 15-minute intervals up to 480 minutes (8 hours)
  const increments: number[] = [];
  for (let m = 15; m <= 480; m += 15) {
    increments.push(m);
  }

  const handleApplyLimit = () => {
    setPendingAction('save_limit');
    setShowAuthModal(true);
  };

  const handleResetUsage = () => {
    setPendingAction('reset');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    if (pendingAction === 'save_limit') {
      await onUpdateLimit(selectedLimit);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } else if (pendingAction === 'reset') {
      await onResetUsageToday();
    }
    setPendingAction(null);
  };

  const usedMin = screenTime.usedMinutesToday;
  const currentLimit = screenTime.dailyLimitMinutes;
  const remainingMin = currentLimit > 0 ? Math.max(0, currentLimit - usedMin) : -1;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-[#11141A] border border-[#1E222C] rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-600/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">DAILY SCREEN TIME</h2>
            <p className="text-xs text-gray-500">
              Tetapkan had masa maksimum penggunaan peranti setiap hari (Gandaan 15 Minit).
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-[#1A1D23] border border-[#232731] rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Used Time (Terpakai)</p>
            <p className="text-2xl font-extrabold text-white font-mono mt-1">
              {ScreenTimeEngine.formatHoursMinutes(usedMin)}
            </p>
          </div>

          <div className="bg-[#1A1D23] border border-[#232731] rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Remaining Time (Berbaki)</p>
            <p className="text-2xl font-extrabold text-blue-400 font-mono mt-1">
              {ScreenTimeEngine.formatRemaining(remainingMin)}
            </p>
          </div>

          <div className="bg-[#1A1D23] border border-[#232731] rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Daily Limit (Had Semasa)</p>
            <p className="text-2xl font-extrabold text-[#E2E8F0] font-mono mt-1">
              {currentLimit === -1 ? 'Unlimited' : ScreenTimeEngine.formatHoursMinutes(currentLimit)}
            </p>
          </div>
        </div>
      </div>

      {/* Screen Time Limit Adjuster */}
      <div className="bg-[#11141A] border border-[#1E222C] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pilih Had Masa Harian</h3>
          <span className="text-xs font-bold text-blue-400 bg-blue-600/10 px-3 py-1 rounded-xl border border-blue-600/20">
            {selectedLimit === -1 ? 'Tanpa Had (Unlimited)' : ScreenTimeEngine.formatHoursMinutes(selectedLimit)}
          </span>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Pilihan Pantas (Quick Presets)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[60, 120, 180, 240, 300, 360, 480, -1].map((mins) => {
              const isSelected = selectedLimit === mins;
              return (
                <button
                  key={mins}
                  onClick={() => setSelectedLimit(mins)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 border border-blue-500/40'
                      : 'bg-[#1A1D23] text-gray-400 border border-[#232731] hover:border-[#2D3340] hover:text-white'
                  }`}
                >
                  {mins === -1 ? 'Unlimited' : ScreenTimeEngine.formatHoursMinutes(mins)}
                </button>
              );
            })}
          </div>
        </div>

        {/* 15-Minute Fine Increment Selector */}
        {selectedLimit !== -1 && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Pelaras Halus (15 Minit - 8 Jam)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedLimit((prev) => Math.max(15, prev - 15))}
                disabled={selectedLimit <= 15}
                className="p-3 rounded-xl bg-[#1E222C] hover:bg-[#252A36] text-white border border-[#2D3340] disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="flex-1 bg-[#1A1D23] border border-[#232731] rounded-xl p-3 text-center">
                <span className="text-xl font-bold text-white font-mono">
                  {ScreenTimeEngine.formatHoursMinutes(selectedLimit)}
                </span>
                <p className="text-[10px] text-gray-500">({selectedLimit} minit)</p>
              </div>

              <button
                onClick={() => setSelectedLimit((prev) => Math.min(480, prev + 15))}
                disabled={selectedLimit >= 480}
                className="p-3 rounded-xl bg-[#1E222C] hover:bg-[#252A36] text-white border border-[#2D3340] disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Apply Button */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            id="btn-apply-screen-time"
            onClick={handleApplyLimit}
            className="flex-1 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Had Masa Skrin (Parent Auth)
          </button>

          <button
            id="btn-reset-usage-today"
            onClick={handleResetUsage}
            className="py-3.5 px-4 rounded-xl bg-[#1E222C] hover:bg-[#252A36] text-[#E2E8F0] border border-[#2D3340] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Hari Ini
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3.5 flex items-center gap-2 text-green-400 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Had masa skrin berjaya dikemaskini dan disimpan ke IndexedDB.</span>
          </div>
        )}
      </div>

      {/* Simulator Tools for Testing */}
      <div className="bg-[#11141A]/60 border border-[#1E222C] rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Penguji Masa Nyata (Testing Simulation)
          </h4>
        </div>
        <p className="text-xs text-gray-500">
          Uji sistem amaran 15 minit, 5 minit, dan sekatan had masa dengan menambah masa terpakai secara manual:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAddSimulatedUsage(15)}
            className="py-2 px-3.5 rounded-xl bg-[#1E222C] hover:bg-[#252A36] text-xs text-[#E2E8F0] border border-[#2D3340] font-semibold cursor-pointer"
          >
            +15 Minit Terpakai
          </button>
          <button
            onClick={() => onAddSimulatedUsage(30)}
            className="py-2 px-3.5 rounded-xl bg-[#1E222C] hover:bg-[#252A36] text-xs text-[#E2E8F0] border border-[#2D3340] font-semibold cursor-pointer"
          >
            +30 Minit Terpakai
          </button>
          <button
            onClick={() => onAddSimulatedUsage(60)}
            className="py-2 px-3.5 rounded-xl bg-[#1E222C] hover:bg-[#252A36] text-xs text-[#E2E8F0] border border-[#2D3340] font-semibold cursor-pointer"
          >
            +1 Jam Terpakai
          </button>
        </div>
      </div>

      {/* Parent Auth Modal */}
      <ParentAuthModal
        isOpen={showAuthModal}
        title="Pengesahan Had Masa Skrin"
        description="Sila masukkan kata laluan ibu bapa untuk menukar had masa atau menetapkan semula kiraan hari ini."
        onSuccess={handleAuthSuccess}
        onCancel={() => {
          setShowAuthModal(false);
          setPendingAction(null);
        }}
      />
    </div>
  );
};
