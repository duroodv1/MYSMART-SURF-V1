/**
 * MYSMART SURF - First Installation Setup Component ("JOM KAWAL ANAK")
 */

import React, { useState } from 'react';
import { Shield, Lock, User, CheckCircle2, AlertCircle, ArrowRight, Smartphone } from 'lucide-react';
import { generateSalt, hashPassword } from '../services/crypto';
import { dbPut, initializeDatabase } from '../services/db';
import { UserCredential, SecurityConfig } from '../types';

interface FirstSetupProps {
  onComplete: (user: UserCredential) => void;
}

export const FirstSetup: React.FC<FirstSetupProps> = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Sila masukkan nama pengguna (Username).');
      return;
    }
    if (username.length < 3) {
      setError('Username mestilah sekurang-kurangnya 3 aksara.');
      return;
    }
    if (!password) {
      setError('Sila masukkan kata laluan ibu bapa (Password).');
      return;
    }
    if (password.length < 4) {
      setError('Kata laluan mestilah sekurang-kurangnya 4 aksara.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Kata laluan pengesahan tidak sepadan!');
      return;
    }

    setLoading(true);
    try {
      // Initialize seed tables
      await initializeDatabase();

      // Cryptographically secure salt & PBKDF2 hash
      const salt = generateSalt(16);
      const passwordHash = await hashPassword(password, salt);

      const newUser: UserCredential = {
        id: 'parent_admin',
        username: username.trim(),
        passwordHash,
        salt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const securityConfig: SecurityConfig = {
        id: 'config',
        parentPasswordHash: passwordHash,
        parentPasswordSalt: salt,
        sessionTimeoutMinutes: 5,
        uninstallProtectionEnabled: true,
        requireAuthForUninstall: true,
        requireAuthOnAction: true,
        failedAuthAttempts: 0,
        isLockedOut: false,
        lockedUntil: null,
        emergencyContact: '+6012-3456789',
      };

      await dbPut('users', newUser.id, newUser);
      await dbPut('security', 'config', securityConfig);
      onComplete(newUser);
    } catch (err) {
      console.error('Setup failed:', err);
      setError('Gagal mencipta akaun. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-lg shadow-sky-500/20 mb-3">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
            MYSMART SURF
          </h1>
          <p className="text-xs sm:text-sm text-sky-400 font-medium tracking-wide uppercase">
            JOM KAWAL ANAK
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Kawal Masa. Lindungi Penggunaan. Bina Tabiat Digital Yang Sihat.
          </p>
        </div>

        {step === 1 ? (
          <div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-100">Konfigurasi Keselamatan Awal</p>
                  <p>
                    Sebagai ibu bapa atau penjaga, anda perlu menetapkan <strong>Username</strong> dan <strong>Password</strong> keselamatan.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-t border-slate-700/50 pt-2">
                <Lock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400">
                  Password diperlukan untuk membuka tetapan, menukar had masa, dan mengesahkan nyahpasang (Uninstall Protection).
                </p>
              </div>
            </div>

            <button
              id="btn-proceed-setup"
              onClick={() => setStep(2)}
              className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              Teruskan ke Pendaftaran
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-rose-300 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-setup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: Ibu / Bapa"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-setup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata laluan selamat"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <input
                  id="input-setup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulang semula kata laluan"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-submit-setup"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Menyimpan Kata Laluan...' : 'MULAKAN'}
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-500 mt-2">
              🔒 Kata laluan disulitkan secara kriptografi PBKDF2 (SHA-256) secara tempatan.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
