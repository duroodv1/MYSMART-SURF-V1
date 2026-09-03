/**
 * MYSMART SURF - Security & Access Control Tab Component
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { SecurityConfig, AndroidBridgeStatus } from '../../types';
import { CryptoService } from '../../services/crypto';
import { ParentAuthModal } from '../ParentAuthModal';

interface SecurityTabProps {
  securityConfig: SecurityConfig;
  bridgeStatus: AndroidBridgeStatus;
  onChangePassword: (newHash: string, newSalt: string) => Promise<void>;
  onUpdateSecurityConfig: (updated: SecurityConfig) => Promise<void>;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  securityConfig,
  bridgeStatus,
  onChangePassword,
  onUpdateSecurityConfig,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [sessionTimeout, setSessionTimeout] = useState<number>(securityConfig.sessionTimeoutMinutes);
  const [showConfigAuthModal, setShowConfigAuthModal] = useState(false);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Kata laluan baru mestilah sekurang-kurangnya 6 aksara.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Pengesahan kata laluan baru tidak sepadan.');
      return;
    }

    setLoading(true);
    try {
      // Verify old password first
      const isValidOld = await CryptoService.verifyPassword(
        oldPassword,
        securityConfig.parentPasswordHash,
        securityConfig.parentPasswordSalt
      );

      if (!isValidOld) {
        setErrorMsg('Kata laluan semasa (lama) tidak tepat.');
        setLoading(false);
        return;
      }

      // Hash new password
      const salt = CryptoService.generateSalt(16);
      const hash = await CryptoService.hashPassword(newPassword, salt);
      await onChangePassword(hash, salt);

      setSuccessMsg('Kata laluan ibu bapa berjaya ditukar!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg('Ralat semasa menukar kata laluan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecuritySettings = () => {
    setShowConfigAuthModal(true);
  };

  const handleConfigAuthSuccess = async () => {
    setShowConfigAuthModal(false);
    await onUpdateSecurityConfig({
      ...securityConfig,
      sessionTimeoutMinutes: sessionTimeout,
    });
    setSuccessMsg('Tetapan keselamatan dikemaskini.');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">SECURITY & ACCESS CONTROL</h2>
            <p className="text-xs text-slate-400">
              Urus kata laluan ibu bapa, tamat masa sesi keselamatan, dan perlindungan daripada dinyahpasang (Anti-Uninstall).
            </p>
          </div>
        </div>

        {/* Protection Status Banner */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">Perlindungan Nyahpasang (Anti-Uninstall)</p>
              <p className="text-[10px] text-slate-400">
                {bridgeStatus.isNativeBridgeAvailable
                  ? 'Aktif melalui Android Device Admin (DeviceAdminReceiver)'
                  : 'Aktif: Dilindungi kata laluan ibu bapa'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            PROTECTED
          </span>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-sky-400">
          <KeyRound className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Tukar Kata Laluan Ibu Bapa</h3>
        </div>

        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Kata Laluan Semasa (Lama)
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan kata laluan lama"
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Kata Laluan Baru (Min 6 Aksara)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kata laluan baru"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Sahkan Kata Laluan Baru
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Taip semula kata laluan baru"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
          >
            {loading ? 'Mengemas kini...' : 'Simpan Kata Laluan Baru'}
          </button>
        </form>
      </div>

      {/* Session Timeout */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-sky-400">
          <Clock className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Tamat Masa Sesi Ibu Bapa (Session Timeout)</h3>
        </div>
        <p className="text-xs text-slate-400">
          Sistem akan mengunci semula zon kawalan ibu bapa secara automatik selepas tiada aktiviti untuk mengelakkan anak menukar tetapan.
        </p>

        <div className="flex items-center gap-3">
          <select
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value={1}>1 Minit</option>
            <option value={3}>3 Minit</option>
            <option value={5}>5 Minit (Disyorkan)</option>
            <option value={10}>10 Minit</option>
            <option value={15}>15 Minit</option>
          </select>

          <button
            onClick={handleSaveSecuritySettings}
            className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            Simpan Tamat Masa
          </button>
        </div>
      </div>

      {/* Parent Auth Modal */}
      <ParentAuthModal
        isOpen={showConfigAuthModal}
        title="Pengesahan Keselamatan"
        description="Sila masukkan kata laluan untuk mengubah tetapan tamat masa sesi."
        onSuccess={handleConfigAuthSuccess}
        onCancel={() => setShowConfigAuthModal(false)}
      />
    </div>
  );
};
