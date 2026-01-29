'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Lock, User } from 'lucide-react';
import Swal from 'sweetalert2';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDefaultPassword, setIsDefaultPassword] = useState(true);

  useEffect(() => {
    checkDefaultPassword();
  }, []);

  const checkDefaultPassword = async () => {
    try {
      const res = await fetch('/api/auth/check-default');
      if (res.ok) {
        const data = await res.json();
        setIsDefaultPassword(data.isDefault);
      }
    } catch (error) {
      console.error('Error checking default password:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Username dan password harus diisi',
        timer: 2000
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Save user data to localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Selamat datang, ${data.user.full_name}!`,
          timer: 1500,
          showConfirmButton: false
        });

        setTimeout(() => {
          onLoginSuccess();
        }, 1500);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: data.error || 'Username atau password salah',
          timer: 2000
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat login',
        timer: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
              <ShoppingCart className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">TokoPraktis</h1>
            <p className="text-sm text-slate-600">Masuk ke akun Anda</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Info - Only show if password is still default */}
          {isDefaultPassword && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-900 font-semibold mb-2">Akun Default:</p>
              <div className="space-y-1 text-xs text-blue-700">
                <p>Username: <span className="font-mono font-bold">admin</span></p>
                <p>Password: <span className="font-mono font-bold">admin123</span></p>
              </div>
              <p className="text-xs text-amber-600 mt-2 bg-amber-50 border border-amber-200 rounded p-2">
                ⚠️ Silakan ubah password default di menu Pengaturan setelah login
              </p>
            </div>
          )}

          {!isDefaultPassword && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-xs text-green-700">
                🔒 Password telah diubah dari default. Silakan gunakan kredensial Anda.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white text-sm mt-6 drop-shadow-lg">
          © 2026 TokoPraktis. All rights reserved.
        </p>
      </div>
    </div>
  );
}
