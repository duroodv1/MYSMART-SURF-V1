/**
 * MYSMART SURF - Parent Authentication Modal Dialog
 * Used to guard critical settings, overrides, and administrative actions.
 */

import React, { useState } from 'react';
import { Lock, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { dbGet, dbPut } from '../services/db';
import { verifyPassword } from '../services/crypto';
import { UserCredential, SecuritySettings } from '../types';

interface ParentAuthModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ParentAuthModal: React.FC<ParentAuthModalProps> = ({
  isOpen,
  title = 'Pengesahan Ibu Bapa Diperlukan',
  description = 'Sila masukkan kata laluan ibu bapa untuk meneruskan tindakan ini.',
  onSuccess,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Sila masukkan kata laluan.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await dbGet<UserCredential>('users', 'parent_admin');
      const sec = (await dbGet<SecuritySettings & { id: string }>('security_settings', 'current')) || {
        id: 'current',
        sessionTimeoutMinutes: 5,
        uninstallProtectionEnabled: true,
        requireAuthForUninstall: true,
        requireAuthOnAction: true,
        failedAuthAttempts: 0,
        isLockedOut: false,
        lockedUntil: null,
        emergencyContact: '',
      };

      // Check lockout status
      if (sec.isLockedOut && sec.lockedUntil && Date.now() < sec.lockedUntil) {
        const remainingSec = Math.ceil((sec.lockedUntil - Date.now()) / 1000);
        setError(`Akaun dikunci sementara akibat cubaan gagal berulang. Sila cuba lagi dalam ${remainingSec} saat.`);
        setLoading(false);
        return;
      }

      if (!user) {
        setError('Akaun ibu bapa belum disetkan.');
        setLoading(false);
        return;
      }

      const isValid = await verifyPassword(password, user.passwordHash, user.salt);

      if (isValid) {
        // Reset failed attempts
        sec.failedAuthAttempts = 0;
        sec.isLockedOut = false;
        sec.lockedUntil = null;
        await dbPut('security_settings', sec);

        setPassword('');
        setError(null);
        onSuccess();
      } else {
        sec.failedAuthAttempts = (sec.failedAuthAttempts || 0) + 1;
        if (sec.failedAuthAttempts >= 5) {
          sec.isLockedOut = true;
          sec.lockedUntil = Date.now() + 60000; // 1 minute lockout
          await dbPut('security_settings', sec);
          setError('5 kali cubaan gagal. Sistem dikunci selama 1 minit untuk keselamatan.');
        } else {
          await dbPut('security_settings', sec);
          setError(`Kata laluan salah! Cubaan: ${sec.failedAuthAttempts}/5`);
        }
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      setError('Ralat semasa mengesahkan kata laluan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <button
          id="btn-close-auth-modal"
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 leading-tight mt-0.5">{description}</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 mb-4 flex items-start gap-2 text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Kata Laluan Ibu Bapa
            </label>
            <input
              id="input-parent-auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all font-mono"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              id="btn-cancel-auth"
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-confirm-auth"
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Mengesahkan...' : 'Sahkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
