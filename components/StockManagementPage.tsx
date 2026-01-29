'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Calendar, Trash2, Search, TrendingUp, ShoppingCart, X } from 'lucide-react';
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

interface PurchaseItem {
  product_id: string;
  quantity: string;
  purchase_price: string;
}

export default function StockManagementPage() {
  const [purchases, setPurchases] = useState<StockPurchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    supplier_name: '',
    notes: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });
  const [items, setItems] = useState<PurchaseItem[]>([
    { product_id: '', quantity: '', purchase_price: '' }
  ]);

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

    // Validasi items
    const validItems = items.filter(item => 
      item.product_id && item.quantity && item.purchase_price
    );

    if (validItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Harap isi minimal satu item produk dengan lengkap',
        timer: 2000
      });
      return;
    }

    if (!formData.supplier_name) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Harap isi nama supplier',
        timer: 2000
      });
      return;
    }

    try {
      // Submit multiple items
      const promises = validItems.map(item =>
        fetch('/api/stock-purchases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: parseInt(item.product_id),
            supplier_name: formData.supplier_name,
            quantity: parseInt(item.quantity),
            purchase_price: parseFloat(item.purchase_price),
            notes: formData.notes,
            purchase_date: formData.purchase_date
          })
        })
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every(res => res.ok);

      if (allSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `${validItems.length} item pembelian stok berhasil ditambahkan`,
          timer: 2000
        });
        
        setFormData({
          supplier_name: '',
          notes: '',
          purchase_date: new Date().toISOString().split('T')[0]
        });
        setItems([{ product_id: '', quantity: '', purchase_price: '' }]);
        setShowForm(false);
        loadPurchases();
        loadProducts(); // Reload to update stock
      } else {
        throw new Error('Some purchases failed');
      }
    } catch (error) {
      console.error('Error adding purchases:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal menambahkan pembelian stok',
        timer: 2000
      });
    }
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: '', purchase_price: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill purchase price when product is selected
    if (field === 'product_id' && value) {
      const selectedProduct = products.find(p => p.id === parseInt(value));
      if (selectedProduct) {
        newItems[index].purchase_price = selectedProduct.purchase_price?.toString() || '';
      }
    }
    
    setItems(newItems);
  };

  const calculateTotalCost = () => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.purchase_price) || 0;
      return sum + (qty * price);
    }, 0);
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
              {/* Informasi Umum Pembelian */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Informasi Pembelian</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900">Item Produk</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Tambah Item
                  </button>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-900 mb-1">
                            Produk *
                          </label>
                          <select
                            value={item.product_id}
                            onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          >
                            <option value="">Pilih Produk</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} (Stok: {product.stock})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-900 mb-1">
                            Jumlah (Qty) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-900 mb-1">
                            Harga Beli/Unit *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.purchase_price}
                            onChange={(e) => updateItem(index, 'purchase_price', e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Item"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>

                    {/* Item Subtotal */}
                    {item.product_id && item.quantity && item.purchase_price && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600">Subtotal Item {index + 1}:</span>
                          <span className="text-sm font-bold text-green-600">
                            Rp {((parseFloat(item.quantity) || 0) * (parseFloat(item.purchase_price) || 0)).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Info jika belum ada produk */}
                {products.length === 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 mb-2">
                      ⚠️ Belum ada produk terdaftar. Tambahkan produk terlebih dahulu.
                    </p>
                  </div>
                )}
              </div>

              {/* Total Keseluruhan */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Total Biaya Keseluruhan:</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rp {calculateTotalCost().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Catatan */}
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
                  Simpan Semua Pembelian ({items.filter(i => i.product_id && i.quantity && i.purchase_price).length} Item)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setItems([{ product_id: '', quantity: '', purchase_price: '' }]);
                  }}
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
