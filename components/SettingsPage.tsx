'use client';

import { useState, useEffect } from 'react';
import { Save, Download, Upload, Image as ImageIcon, Building2, Camera, Trash2, CheckCircle, User as UserIcon } from 'lucide-react';
import Swal from 'sweetalert2';

interface Settings {
  bank_name: string;
  account_number: string;
  account_holder: string;
  qris_image?: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'account'>('general');
  const [settings, setSettings] = useState<Settings>({
    bank_name: '',
    account_number: '',
    account_holder: ''
  });
  const [qrisPreview, setQrisPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accountForm, setAccountForm] = useState({
    current_password: '',
    new_username: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    loadSettings();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.qris_image) {
          setQrisPreview(data.qris_image);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'File Tidak Valid',
        text: 'Harap pilih file gambar',
        timer: 2000
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Terlalu Besar',
        text: 'Ukuran maksimal 2MB',
        timer: 2000
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setQrisPreview(base64String);
      setSettings(prev => ({ ...prev, qris_image: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQris = () => {
    setQrisPreview('');
    setSettings(prev => ({ ...prev, qris_image: '' }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Pengaturan berhasil disimpan',
          timer: 2000
        });
        loadSettings();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal menyimpan pengaturan',
        timer: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccount = async () => {
    // Validation
    if (!accountForm.current_password) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Diperlukan',
        text: 'Masukkan password saat ini untuk verifikasi',
        timer: 2000
      });
      return;
    }

    if (!accountForm.new_username && !accountForm.new_password) {
      Swal.fire({
        icon: 'warning',
        title: 'Tidak Ada Perubahan',
        text: 'Masukkan username atau password baru',
        timer: 2000
      });
      return;
    }

    if (accountForm.new_password && accountForm.new_password !== accountForm.confirm_password) {
      Swal.fire({
        icon: 'error',
        title: 'Password Tidak Cocok',
        text: 'Password baru dan konfirmasi tidak sama',
        timer: 2000
      });
      return;
    }

    if (accountForm.new_password && accountForm.new_password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Password Terlalu Pendek',
        text: 'Password minimal 6 karakter',
        timer: 2000
      });
      return;
    }

    setAccountLoading(true);
    try {
      const res = await fetch('/api/auth/update-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.id,
          current_password: accountForm.current_password,
          new_username: accountForm.new_username || undefined,
          new_password: accountForm.new_password || undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Akun berhasil diperbarui. Silakan login kembali.',
          timer: 2000
        });

        // Clear form
        setAccountForm({
          current_password: '',
          new_username: '',
          new_password: '',
          confirm_password: ''
        });

        // Logout after 2 seconds
        setTimeout(() => {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('user');
          window.location.reload();
        }, 2000);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: data.error || 'Gagal memperbarui akun',
          timer: 2000
        });
      }
    } catch (error) {
      console.error('Error updating account:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Terjadi kesalahan saat memperbarui akun',
        timer: 2000
      });
    } finally {
      setAccountLoading(false);
    }
  };

  const handleBackupDatabase = async () => {
    try {
      const res = await fetch('/api/backup', {
        method: 'POST'
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Database berhasil dibackup',
          timer: 2000
        });
      } else {
        throw new Error('Backup failed');
      }
    } catch (error) {
      console.error('Error backing up database:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal membackup database',
        timer: 2000
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
          <p className="text-sm text-slate-600 mt-1">Kelola pengaturan aplikasi POS Anda</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'general'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Pengaturan Umum
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'account'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Akun
            </button>
          </div>
        </div>

        {/* Account Tab Content */}
        {activeTab === 'account' && (
          <>
            {/* Login Account Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserIcon className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Kelola Akun</h2>
              <p className="text-sm text-slate-600 mb-4">
                Ubah username dan password akun Anda untuk keamanan yang lebih baik
              </p>

              {/* Current User Info */}
              <div className="bg-white rounded-lg border border-indigo-200 p-3 mb-4">
                <p className="text-xs text-slate-500 mb-1">Akun Saat Ini</p>
                <p className="text-sm font-semibold text-slate-900">{currentUser?.full_name || 'Administrator'}</p>
                <p className="text-xs text-slate-500">Username: <span className="font-mono text-indigo-600">{currentUser?.username || 'admin'}</span></p>
              </div>

              {/* Update Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    Password Saat Ini (Wajib) *
                  </label>
                  <input
                    type="password"
                    value={accountForm.current_password}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, current_password: e.target.value }))}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    Username Baru (Opsional)
                  </label>
                  <input
                    type="text"
                    value={accountForm.new_username}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, new_username: e.target.value }))}
                    placeholder="Kosongkan jika tidak ingin mengubah"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    Password Baru (Opsional)
                  </label>
                  <input
                    type="password"
                    value={accountForm.new_password}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, new_password: e.target.value }))}
                    placeholder="Kosongkan jika tidak ingin mengubah"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={accountForm.confirm_password}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                    placeholder="Masukkan ulang password baru"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={!accountForm.new_password}
                  />
                </div>

                <button
                  onClick={handleUpdateAccount}
                  disabled={accountLoading}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {accountLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Update Akun
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-amber-600 mt-3 bg-amber-50 border border-amber-200 rounded p-2">
                ⚠️ Setelah mengubah akun, Anda akan otomatis logout dan harus login kembali dengan kredensial baru.
              </p>
            </div>
          </div>
        </div>
          </>
        )}

        {/* General Tab Content */}
        {activeTab === 'general' && (
          <>
        {/* Backup Database */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Download className="text-blue-600" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Backup Database</h2>
              <p className="text-sm text-slate-600 mb-4">
                Download backup database dalam format SQL. Backup akan mencakup semua data transaksi, produk, kategori, dan pelanggan.
              </p>
              <button
                onClick={handleBackupDatabase}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <Download size={18} />
                Download Backup
              </button>
            </div>
          </div>
        </div>

        {/* QRIS Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ImageIcon className="text-purple-600" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 mb-1">QR Code QRIS</h2>
              <p className="text-sm text-slate-600">
                Upload gambar QR Code QRIS untuk pembayaran digital
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {qrisPreview ? (
              <div className="relative inline-block">
                <img
                  src={qrisPreview}
                  alt="QRIS Preview"
                  className="w-64 h-64 object-contain border-2 border-slate-200 rounded-xl bg-white"
                />
                <button
                  onClick={handleRemoveQris}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-64 h-64 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-purple-500 transition-colors bg-slate-50 hover:bg-purple-50">
                <Camera className="text-slate-400 mb-2" size={32} />
                <span className="text-sm text-slate-600 font-medium">Upload QR Code QRIS</span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG (Max 2MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrisUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Bank Account Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="text-green-600" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Rekening Bank</h2>
              <p className="text-sm text-slate-600">
                Informasi rekening bank untuk pembayaran transfer
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Nama Bank
              </label>
              <input
                type="text"
                value={settings.bank_name}
                onChange={(e) => setSettings(prev => ({ ...prev, bank_name: e.target.value }))}
                placeholder="Contoh: Bank BCA"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={settings.account_number}
                onChange={(e) => setSettings(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="Contoh: 1234567890"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                value={settings.account_holder}
                onChange={(e) => setSettings(prev => ({ ...prev, account_holder: e.target.value }))}
                placeholder="Contoh: John Doe"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
