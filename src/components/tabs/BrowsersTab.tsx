/**
 * MYSMART SURF - Browser Control Tab Component
 */

import React, { useState } from 'react';
import {
  Globe,
  Shield,
  Clock,
  Ban,
  CheckCircle2,
  Lock,
  WifiOff,
  AlertTriangle,
} from 'lucide-react';
import { BrowserRule } from '../../types';
import { ScreenTimeEngine } from '../../services/screenTimeEngine';
import { ParentAuthModal } from '../ParentAuthModal';

interface BrowsersTabProps {
  browserRules: BrowserRule[];
  onUpdateBrowserRule: (updated: BrowserRule) => Promise<void>;
  onBulkUpdateBrowsers: (action: 'ALLOW_ALL' | 'BLOCK_ALL') => Promise<void>;
}

export const BrowsersTab: React.FC<BrowsersTabProps> = ({
  browserRules,
  onUpdateBrowserRule,
  onBulkUpdateBrowsers,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeEditingBrowser, setActiveEditingBrowser] = useState<BrowserRule | null>(null);
  const [bulkAction, setBulkAction] = useState<'ALLOW_ALL' | 'BLOCK_ALL' | null>(null);

  const handleToggleBlock = (browser: BrowserRule) => {
    setActiveEditingBrowser({
      ...browser,
      blocked: !browser.blocked,
    });
    setShowAuthModal(true);
  };

  const handleSetTimeLimit = (browser: BrowserRule, limit: number) => {
    setActiveEditingBrowser({
      ...browser,
      timeLimitMinutes: limit,
    });
    setShowAuthModal(true);
  };

  const handleToggleInternetRestricted = (browser: BrowserRule) => {
    setActiveEditingBrowser({
      ...browser,
      internetRestricted: !browser.internetRestricted,
    });
    setShowAuthModal(true);
  };

  const handleBulkActionClick = (action: 'ALLOW_ALL' | 'BLOCK_ALL') => {
    setBulkAction(action);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    if (activeEditingBrowser) {
      await onUpdateBrowserRule(activeEditingBrowser);
      setActiveEditingBrowser(null);
    } else if (bulkAction) {
      await onBulkUpdateBrowsers(bulkAction);
      setBulkAction(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Bulk Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">BROWSER CONTROL</h2>
              <p className="text-xs text-slate-400">
                Kawal pelayar web Android (Chrome, Firefox, Edge, Opera) untuk mengelakkan layaran tanpa kawalan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkActionClick('ALLOW_ALL')}
              className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
            >
              Benarkan Semua
            </button>
            <button
              onClick={() => handleBulkActionClick('BLOCK_ALL')}
              className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold cursor-pointer"
            >
              BLOCK ALL BROWSERS
            </button>
          </div>
        </div>
      </div>

      {/* Browser Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {browserRules.map((b) => (
          <div
            key={b.packageName}
            className={`bg-slate-900 border rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all ${
              b.blocked ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-sky-400 text-lg shadow-inner">
                    <Globe className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{b.browserName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{b.packageName}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleBlock(b)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    b.blocked
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {b.blocked ? 'Disekat (Blocked)' : 'Dibenarkan'}
                </button>
              </div>

              {/* Status & Usage */}
              <div className="mt-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Penggunaan Hari Ini:</span>
                  <span className="font-mono font-bold text-white">{b.usedMinutesToday} minit</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Sekatan Web / SafeSearch:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Enforced
                  </span>
                </div>
              </div>
            </div>

            {/* Time Limit & Internet Restriction */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-medium">Had Masa:</span>
              </div>
              <select
                value={b.timeLimitMinutes}
                onChange={(e) => handleSetTimeLimit(b, Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-sky-500 font-mono cursor-pointer"
              >
                <option value={0}>Tiada Had</option>
                <option value={30}>30 Minit</option>
                <option value={60}>1 Jam (60m)</option>
                <option value={90}>1j 30m (90m)</option>
                <option value={120}>2 Jam (120m)</option>
                <option value={180}>3 Jam (180m)</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Parent Auth Modal */}
      <ParentAuthModal
        isOpen={showAuthModal}
        title="Pengesahan Kawalan Browser"
        description="Sila masukkan kata laluan ibu bapa untuk mengubah sekatan pelayar web."
        onSuccess={handleAuthSuccess}
        onCancel={() => {
          setShowAuthModal(false);
          setActiveEditingBrowser(null);
          setBulkAction(null);
        }}
      />
    </div>
  );
};
