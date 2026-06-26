/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Sparkles, Activity, Key, Mail, User, ShieldAlert, ArrowRight } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isReset) {
        await sendPasswordResetEmail(auth, email);
        setMessage('Link reset password telah dikirim ke email Anda. Silakan periksa inbox.');
      } else if (isRegister) {
        if (!name.trim()) throw new Error('Nama lengkap wajib diisi');
        if (password.length < 6) throw new Error('Password minimal 6 karakter');
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Initialize user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          dailyWaterGoal: 8,
          notificationsEnabled: true,
          registeredAt: new Date().toISOString()
        });

        onAuthSuccess();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error(err);
      let localErr = err.message;
      if (err.code === 'auth/user-not-found') localErr = 'Email tidak terdaftar.';
      if (err.code === 'auth/wrong-password') localErr = 'Password salah.';
      if (err.code === 'auth/email-already-in-use') localErr = 'Email sudah digunakan.';
      if (err.code === 'auth/invalid-email') localErr = 'Format email tidak valid.';
      if (err.code === 'auth/weak-password') localErr = 'Password terlalu lemah.';
      if (err.code === 'auth/operation-not-allowed') {
        localErr = 'Pendaftaran dengan Email/Password dinonaktifkan di proyek Firebase Anda. Silakan klik tombol "Masuk dengan Google" atau "Cobalah dengan Akun Demo (Tamu)" di bagian bawah.';
      }
      setError(localErr);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Check if user profile already exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: 'demo@poopcycle.com',
          displayName: 'Rila (Demo)',
          dailyWaterGoal: 8,
          notificationsEnabled: true,
          registeredAt: new Date().toISOString()
        });
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      setError('Gagal masuk sebagai demo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user profile already exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Pengguna Google',
          dailyWaterGoal: 8,
          notificationsEnabled: true,
          registeredAt: new Date().toISOString()
        });
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Proses masuk dibatalkan oleh pengguna.');
      } else {
        setError('Gagal masuk dengan Google: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transition-all">
        
        {/* Header Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-100 mb-4 animate-bounce">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-800">
            PoopCycle
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isReset 
              ? 'Atur Ulang Sandi Akun Anda' 
              : isRegister 
                ? 'Mulai perjalanan kesehatan pencernaan Anda' 
                : 'Pencatat & Prediksi Pencernaan Pintar'}
          </p>
        </div>

        {/* Info Box / Messages */}
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-md flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-700 leading-normal">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-md flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 leading-normal">{message}</p>
          </div>
        )}

        {/* Firebase Config Info Notice */}
        <div className="bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl flex items-start gap-2.5 shadow-sm">
          <span className="text-lg leading-none select-none mt-0.5">💡</span>
          <div>
            <p className="text-xs font-bold text-amber-900">Gunakan Google atau Akun Demo</p>
            <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
              Pendaftaran menggunakan Email/Password saat ini dinonaktifkan di konfigurasi Firebase. Silakan gunakan tombol <strong>"Masuk dengan Google"</strong> atau <strong>"Cobalah dengan Akun Demo"</strong> di bagian bawah untuk langsung mencoba aplikasi secara instan dan aman.
            </p>
          </div>
        </div>

        {/* Main Form */}
        <form className="mt-8 space-y-5" onSubmit={handleAuth}>
          {!isReset && (
            <div className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-slate-50/50"
                      placeholder="Nama lengkap Anda"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-slate-50/50"
                    placeholder="email@contoh.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-slate-50/50"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>
            </div>
          )}

          {isReset && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="reset-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-slate-50/50"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>
          )}

          {!isReset && !isRegister && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => { setIsReset(true); setError(''); setMessage(''); }}
                className="text-xs font-medium text-teal-600 hover:text-teal-700 transition"
              >
                Lupa Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              id="submit-auth-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isReset ? 'Kirim Link Reset' : isRegister ? 'Daftar Sekarang' : 'Masuk'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Button */}
        {!isReset && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">Atau</span>
            </div>
          </div>
        )}

        {!isReset && (
          <div className="space-y-3">
            <button
              id="google-login-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Masuk dengan Google
            </button>

            <button
              id="demo-login-btn"
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 border border-dashed border-teal-300 rounded-xl text-sm font-medium text-teal-700 bg-teal-50/40 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-teal-500" />
              Cobalah dengan Akun Demo (Tamu)
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="text-center mt-6">
          {isReset ? (
            <button
              type="button"
              onClick={() => { setIsReset(false); setError(''); setMessage(''); }}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition"
            >
              Kembali Ke Login
            </button>
          ) : (
            <p className="text-xs text-slate-500">
              {isRegister ? 'Sudah punya akun? ' : 'Belum memiliki akun? '}
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); setMessage(''); }}
                className="font-bold text-teal-600 hover:text-teal-700 transition"
              >
                {isRegister ? 'Masuk Di Sini' : 'Daftar Di Sini'}
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
