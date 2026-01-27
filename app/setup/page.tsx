'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, Database, Server, HardDrive, Rocket } from 'lucide-react';

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checks, setChecks] = useState({
    node: false,
    dependencies: false
  });

  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pos_warung1'
  });

  // No auto-check on mount - let proxy handle redirect

  const runSystemChecks = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/setup/check-system');
      const data = await res.json();

      setChecks(data);
      
      if (data.node && data.dependencies) {
        setSuccess('Semua requirement terpenuhi!');
        setTimeout(() => setStep(2), 1500);
      } else {
        setError('Beberapa requirement tidak terpenuhi. Pastikan Node.js dan dependencies sudah terinstall.');
      }
    } catch (error) {
      setError('Gagal memeriksa system requirements');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/setup/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbConfig)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('✅ Koneksi database berhasil!');
        setTimeout(() => setStep(3), 1500);
      } else {
        setError(data.error || 'Koneksi database gagal. Periksa konfigurasi Anda.');
      }
    } catch (error) {
      setError('Gagal menghubungi server. Pastikan aplikasi berjalan.');
    } finally {
      setLoading(false);
    }
  };

  const installDatabase = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/setup/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbConfig),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('✅ Database berhasil disetup!');
        setStep(4);
      } else {
        setError(data.error || 'Setup database gagal');
      }
    } catch (error) {
      setError('Gagal setup database');
    } finally {
      setLoading(false);
    }
  };

  const finishSetup = () => {
    console.log('finishSetup called - forcing redirect');
    // Force hard redirect to clear any cache
    window.location.replace('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <Rocket className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Setup Installer</h1>
              <p className="text-indigo-100">Sistem POS untuk Warung</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s 
                    ? 'bg-white text-indigo-600' 
                    : 'bg-white/20 text-white'
                }`}>
                  {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-20 h-1 ${step > s ? 'bg-white' : 'bg-white/20'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: System Check */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">System Requirements</h2>
              <p className="text-slate-600 mb-6">Memeriksa kelengkapan sistem Anda</p>

              <div className="space-y-4 mb-6">
                <div className={`p-4 rounded-lg border ${checks.node ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <Server className={checks.node ? 'text-green-600' : 'text-slate-400'} />
                    <div>
                      <p className="font-semibold text-slate-900">Node.js Runtime</p>
                      <p className="text-sm text-slate-600">Versi 16.x atau lebih tinggi</p>
                    </div>
                    {checks.node && <CheckCircle className="ml-auto text-green-600" />}
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${checks.dependencies ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <HardDrive className={checks.dependencies ? 'text-green-600' : 'text-slate-400'} />
                    <div>
                      <p className="font-semibold text-slate-900">Dependencies</p>
                      <p className="text-sm text-slate-600">NPM packages terinstall</p>
                    </div>
                    {checks.dependencies && <CheckCircle className="ml-auto text-green-600" />}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <button
                onClick={runSystemChecks}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Memeriksa...
                  </>
                ) : (
                  'Periksa System'
                )}
              </button>
            </div>
          )}

          {/* Step 2: Database Config */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Konfigurasi Database</h2>
              <p className="text-slate-600 mb-6">Masukkan informasi database MySQL Anda</p>

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">⚠️ Penting: Buat Database Manual Dulu!</p>
                <p className="text-xs text-blue-800 mb-2">
                  Sebelum melanjutkan, buat database manual terlebih dahulu:
                </p>
                <ol className="text-xs text-blue-800 list-decimal list-inside space-y-1">
                  <li>Buka phpMyAdmin (Laragon/XAMPP)</li>
                  <li>Klik tab "Databases" atau "SQL"</li>
                  <li>Jalankan: <code className="bg-white px-2 py-0.5 rounded font-mono">CREATE DATABASE pos_warung1;</code></li>
                  <li>Database siap digunakan untuk setup</li>
                </ol>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Database Host
                  </label>
                  <input
                    type="text"
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
                    placeholder="localhost"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Database User
                  </label>
                  <input
                    type="text"
                    value={dbConfig.user}
                    onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
                    placeholder="root"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Database Password
                  </label>
                  <input
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
                    placeholder="Kosongkan jika tidak ada password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value={dbConfig.database}
                    onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
                    placeholder="pos_warung1"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-1">Koneksi Gagal</p>
                    <p className="text-sm text-red-800">{error}</p>
                    <p className="text-xs text-red-700 mt-2">
                      Pastikan MySQL sudah running (Laragon/XAMPP) dan kredensial benar.
                    </p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                >
                  Kembali
                </button>
                <button
                  onClick={testConnection}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Database size={20} />
                      Test Koneksi
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Install Database */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Install Database</h2>
              <p className="text-slate-600 mb-6">Setup database dan import data awal</p>

              <div className="bg-slate-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">Yang akan dilakukan:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-slate-700">Import struktur tabel ke database <code className="bg-white px-2 py-0.5 rounded">{dbConfig.database}</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-slate-700">Membuat tabel (products, categories, customers, transactions, dll)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-slate-700">Membuat user admin dengan password default</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-slate-700">Generate file konfigurasi</span>
                  </li>
                </ul>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                >
                  Kembali
                </button>
                <button
                  onClick={installDatabase}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Rocket size={20} />
                      Install Sekarang
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Selesai!</h2>
              <p className="text-slate-600 mb-8">Aplikasi POS siap digunakan</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-blue-900 mb-3">Login dengan:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-blue-700 font-mono bg-white px-3 py-1 rounded">Username:</span>
                    <span className="text-sm font-bold text-blue-900">admin</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-blue-700 font-mono bg-white px-3 py-1 rounded">Password:</span>
                    <span className="text-sm font-bold text-blue-900">admin123</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-red-900 font-semibold mb-2">
                  ⚠️ PENTING: Ganti password setelah login pertama kali!
                </p>
                <p className="text-xs text-red-700">
                  Setelah setup selesai, halaman ini akan otomatis terkunci dan tidak bisa diakses lagi untuk keamanan.
                </p>
              </div>

              <button
                onClick={finishSetup}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Rocket size={20} />
                Mulai Menggunakan Aplikasi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
