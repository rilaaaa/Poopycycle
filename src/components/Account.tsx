/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  LogOut, 
  Database, 
  Trash2, 
  Sliders, 
  BellRing, 
  User,
  Plus, 
  Minus,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface AccountProps {
  displayName: string;
  email: string;
  waterGoal: number;
  notificationsEnabled: boolean;
  onUpdateProfile: (displayName: string) => Promise<void>;
  onUpdateWaterGoal: (newGoal: number) => Promise<void>;
  onToggleNotifications: (enabled: boolean) => Promise<void>;
  onSeedDatabase: () => Promise<void>;
  onClearDatabase: () => Promise<void>;
}

export default function Account({
  displayName,
  email,
  waterGoal,
  notificationsEnabled,
  onUpdateProfile,
  onUpdateWaterGoal,
  onToggleNotifications,
  onSeedDatabase,
  onClearDatabase
}: AccountProps) {
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(displayName);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Custom Confirmation Dialog state
  const [confirmAction, setConfirmAction] = useState<'logout' | 'seed' | 'clear' | null>(null);

  const handleLogout = () => {
    setConfirmAction('logout');
  };

  const handleWaterGoalChange = async (diff: number) => {
    const newGoal = Math.max(4, Math.min(16, waterGoal + diff));
    try {
      await onUpdateWaterGoal(newGoal);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerSeed = () => {
    setConfirmAction('seed');
  };

  const triggerClear = () => {
    setConfirmAction('clear');
  };

  const executeConfirmedAction = async () => {
    const action = confirmAction;
    setConfirmAction(null);

    if (action === 'logout') {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Error signing out:', err);
      }
    } else if (action === 'seed') {
      setSeeding(true);
      setSeedSuccess(false);
      try {
        await onSeedDatabase();
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 3000);
      } catch (err) {
        console.error(err);
      } finally {
        setSeeding(false);
      }
    } else if (action === 'clear') {
      setClearing(true);
      setClearSuccess(false);
      try {
        await onClearDatabase();
        setClearSuccess(true);
        setTimeout(() => setClearSuccess(false), 3000);
      } catch (err) {
        console.error(err);
      } finally {
        setClearing(false);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-24 px-4 pt-4 space-y-6">
      
      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-bold font-display text-slate-800">Pengaturan Akun</h2>
        <p className="text-xs text-slate-400 mt-0.5">Atur profil, parameter target harian, dan preferensi aplikasi</p>
      </div>

      {/* Profile Card Summary */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
            <User className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 truncate flex-1">
            {!isEditingProfile ? (
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-800 truncate max-w-[140px]" title={displayName}>{displayName}</h3>
                <button
                  id="start-edit-profile-btn"
                  onClick={() => { setEditedName(displayName); setIsEditingProfile(true); }}
                  className="text-[10px] text-teal-600 hover:text-teal-700 font-extrabold underline cursor-pointer shrink-0"
                >
                  Edit Nama
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  id="edit-display-name-input"
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Nama Lengkap Anda"
                  required
                />
                <div className="flex gap-2">
                  <button
                    id="save-profile-btn"
                    onClick={async () => {
                      if (!editedName.trim()) return;
                      setUpdatingProfile(true);
                      try {
                        await onUpdateProfile(editedName.trim());
                        setIsEditingProfile(false);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setUpdatingProfile(false);
                      }
                    }}
                    disabled={updatingProfile || !editedName.trim()}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg disabled:opacity-50 transition cursor-pointer"
                  >
                    {updatingProfile ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    id="cancel-edit-profile-btn"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-slate-400 truncate font-medium">{email || 'Akun Tamu / Demo'}</p>
            <span className="inline-flex items-center gap-1 text-[9px] bg-teal-50 border border-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              Keamanan Terenkripsi
            </span>
          </div>
        </div>
      </div>

      {/* Notifications and Water Goal Config */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
          <Sliders className="h-4.5 w-4.5 text-teal-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Konfigurasi Target</h3>
        </div>

        {/* Water Goal Selector */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-700">Target Air Minum</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Atur target konsumsi gelas harian</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="dec-water-target-btn"
              onClick={() => handleWaterGoalChange(-1)}
              disabled={waterGoal <= 4}
              className="h-8 w-8 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-35 cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-slate-800 font-display w-14 text-center">
              {waterGoal} Gelas
            </span>
            <button
              id="inc-water-target-btn"
              onClick={() => handleWaterGoalChange(1)}
              disabled={waterGoal >= 16}
              className="h-8 w-8 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-35 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mock Notifications Alert Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-700">Pemberitahuan Rutin</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Ingatkan untuk minum air & BAB teratur</p>
          </div>
          <button
            id="notification-toggle-btn"
            onClick={() => onToggleNotifications(!notificationsEnabled)}
            className={`w-12 h-6.5 rounded-full p-1 transition duration-200 cursor-pointer ${notificationsEnabled ? 'bg-teal-500' : 'bg-slate-200'}`}
          >
            <div className={`w-4.5 h-4.5 rounded-full bg-white transition duration-200 ${notificationsEnabled ? 'translate-x-5.5' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* Sandbox Seeding and Reset section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
          <Database className="h-4.5 w-4.5 text-teal-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Alat Simulasi Database</h3>
        </div>

        {/* Sandbox Success Feedback */}
        {seedSuccess && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 animate-pulse">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] font-bold">Berhasil mempopulasikan contoh data 7 hari terakhir!</span>
          </div>
        )}

        {clearSuccess && (
          <div className="bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-xl flex items-center gap-2 animate-pulse">
            <Trash2 className="h-4 w-4 text-rose-600" />
            <span className="text-[11px] font-bold">Database berhasil direset bersih!</span>
          </div>
        )}

        {/* Seed button */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-700">Seed Data Contoh Historis</p>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">
              Isi data simulasi BAB, makanan, gejala, air, dan aktivitas 7 hari ke belakang untuk mengaktifkan statistik grafik instan.
            </p>
          </div>
          <button
            id="seed-db-btn"
            onClick={triggerSeed}
            disabled={seeding}
            className="px-3 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
          >
            {seeding ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-teal-500" />
            )}
            Seed Data
          </button>
        </div>

        {/* Clear/Reset button */}
        <div className="flex items-start justify-between gap-4 pt-1">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-700 text-rose-600">Hapus Semua Data Log</p>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">
              Hapus seluruh riwayat log aktivitas yang telah Anda simpan di Firestore untuk memulai kembali pencatatan dari nol.
            </p>
          </div>
          <button
            id="clear-db-btn"
            onClick={triggerClear}
            disabled={clearing}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
          >
            {clearing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            )}
            Hapus Semua
          </button>
        </div>
      </div>

      {/* Logout button */}
      <button
        id="logout-btn"
        onClick={handleLogout}
        className="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold rounded-xl border border-rose-200 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
      >
        <LogOut className="h-5 w-5 text-rose-600" />
        Log Keluar Dari Aplikasi
      </button>

      {/* Elegant React Modal for Confirmation (Alternative to iframe-blocked window.confirm) */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div 
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                confirmAction === 'seed' 
                  ? 'bg-teal-50 text-teal-600' 
                  : 'bg-rose-50 text-rose-600'
              }`}>
                {confirmAction === 'logout' && <LogOut className="h-5 w-5" />}
                {confirmAction === 'seed' && <Sparkles className="h-5 w-5" />}
                {confirmAction === 'clear' && <Trash2 className="h-5 w-5" />}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-800">
                  {confirmAction === 'logout' && 'Keluar Akun'}
                  {confirmAction === 'seed' && 'Seed Data Contoh'}
                  {confirmAction === 'clear' && 'Hapus Semua Data'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Konfirmasi Tindakan</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {confirmAction === 'logout' && 'Apakah Anda yakin ingin keluar dari akun PoopCycle Anda? Sesi Anda akan diakhiri secara aman.'}
              {confirmAction === 'seed' && 'Apakah Anda ingin mempopulasikan database dengan contoh data historis 7 hari terakhir untuk simulasi grafik?'}
              {confirmAction === 'clear' && '⚠️ PERINGATAN: Apakah Anda yakin ingin menghapus seluruh log BAB, makanan, gejala, air, dan aktivitas Anda? Tindakan ini tidak dapat dibatalkan.'}
            </p>

            <div className="flex gap-2.5 mt-2">
              <button
                id="modal-confirm-action-btn"
                onClick={executeConfirmedAction}
                className={`flex-1 py-2.5 text-xs font-bold text-white rounded-xl transition cursor-pointer ${
                  confirmAction === 'seed'
                    ? 'bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-100'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-100'
                }`}
              >
                {confirmAction === 'logout' && 'Ya, Keluar'}
                {confirmAction === 'seed' && 'Ya, Isi Data'}
                {confirmAction === 'clear' && 'Ya, Hapus Semua'}
              </button>
              <button
                id="modal-cancel-action-btn"
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer text-center"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
