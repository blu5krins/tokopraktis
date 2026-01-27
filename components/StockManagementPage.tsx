'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Calendar, Trash2, Search, TrendingUp, ShoppingCart } from 'lucide-react';
import Swal from 'sweetalert2';

interface Product {
  id: number;
  name: string;
  stock: number;
  purchase_price: number;
  price: number;
  category_name?: string;
}

interface StockPurchase {
  id: number;
  product_id: number;
  product_name: string;
  category_name: string;
  supplier_name: string;
  quantity: number;
  purchase_price: number;
  total_cost: number;
  notes: string;
  purchase_date: string;
  created_at: string;
}

export default function StockManagementPage() {
  const [purchases, setPurchases] = useState<StockPurchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    supplier_name: '',
    quantity: '',
    purchase_price: '',
    notes: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadPurchases();
    loadProducts();
  }, []);

  const loadPurchases = async () => {
    try {
      const res = await fetch('/api/stock-purchases');
      const data = await res.json();
      setPurchases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading purchases:', error);
      setPurchases([]);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_id || !formData.supplier_name || !formData.quantity || !formData.purchase_price) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Harap isi semua field yang wajib',
        timer: 2000
      });
      return;
    }

    try {
      const res = await fetch('/api/stock-purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: parseInt(formData.product_id),
          supplier_name: formData.supplier_name,
          quantity: parseInt(formData.quantity),
          purchase_price: parseFloat(formData.purchase_price),
          notes: formData.notes,
          purchase_date: formData.purchase_date
        })
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Pembelian stok berhasil ditambahkan',
          timer: 2000
        });
        
        setFormData({
          product_id: '',
          supplier_name: '',
          quantity: '',
          purchase_price: '',
          notes: '',
          purchase_date: new Date().toISOString().split('T')[0]
        });
        setShowForm(false);
        loadPurchases();
        loadProducts(); // Reload to update stock
      } else {
        throw new Error('Failed to add purchase');
      }
    } catch (error) {
      console.error('Error adding purchase:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal menambahkan pembelian stok',
        timer: 2000
      });
    }
  };

  const handleDelete = async (id: number, productName: string) => {
    const result = await Swal.fire({
      title: 'Hapus Pembelian?',
      text: `Hapus pembelian stok ${productName}? Stok produk akan dikurangi sesuai jumlah pembelian ini.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/stock-purchases/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Pembelian stok berhasil dihapus',
            timer: 2000
          });
          loadPurchases();
          loadProducts();
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        console.error('Error deleting purchase:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Gagal menghapus pembelian stok',
          timer: 2000
        });
      }
    }
  };

  const filteredPurchases = purchases.filter(p =>
    (p.product_name && p.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.supplier_name && p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPurchases = purchases.length;
  const totalCost = purchases.reduce((sum, p) => sum + Number(p.total_cost), 0);
  const totalQuantity = purchases.reduce((sum, p) => sum + Number(p.quantity), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manajemen Stok</h1>
              <p className="text-sm text-slate-600 mt-1">Kelola pembelian dan stok barang</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Tambah Pembelian
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <ShoppingCart className="text-white" size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Total Pembelian</p>
                <p className="text-2xl font-bold text-blue-600">{totalPurchases}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Total Unit Dibeli</p>
                <p className="text-2xl font-bold text-purple-600">{totalQuantity}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Total Biaya</p>
                <p className="text-2xl font-bold text-green-600">Rp {totalCost.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Tambah Pembelian Stok</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Produk *
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => {
                      const selectedProduct = products.find(p => p.id === parseInt(e.target.value));
                      setFormData({
                        ...formData,
                        product_id: e.target.value,
                        purchase_price: selectedProduct?.purchase_price?.toString() || ''
                      });
                    }}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Pilih Produk</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stok: {product.stock})
                      </option>
                    ))}
                  </select>
                  
                  {/* Info jika belum ada produk */}
                  {products.length === 0 && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800 mb-2">
                        ⚠️ Belum ada produk terdaftar. Tambahkan produk terlebih dahulu.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          // Navigate to products page
                          window.dispatchEvent(new CustomEvent('navigate-to-products'));
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold underline"
                      >
                        Buka Halaman Produk
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Nama Supplier *
                  </label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    placeholder="Contoh: Toko ABC"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Jumlah (Qty) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Harga Beli per Unit *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Tanggal Pembelian *
                  </label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Total Biaya
                  </label>
                  <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-900">
                    Rp {((parseFloat(formData.quantity) || 0) * (parseFloat(formData.purchase_price) || 0)).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tambahkan catatan jika perlu..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={products.length === 0}
                  className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Pembelian
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk atau supplier..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Purchases List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Harga Beli
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Total Biaya
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-900">
                          {new Date(purchase.purchase_date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                          {purchase.product_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{purchase.product_name}</p>
                          {purchase.category_name && (
                            <p className="text-xs text-slate-500">{purchase.category_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-900">{purchase.supplier_name}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-slate-900">{purchase.quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-slate-600">
                        Rp {Number(purchase.purchase_price).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-green-600">
                        Rp {Number(purchase.total_cost).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleDelete(purchase.id, purchase.product_name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPurchases.length === 0 && (
            <div className="text-center py-16">
              <Package className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-sm text-slate-600">
                {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada pembelian stok'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
