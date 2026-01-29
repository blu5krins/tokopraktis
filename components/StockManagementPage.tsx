'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Calendar, Trash2, Search, TrendingUp, ShoppingCart, X, Users, Building2, FileText } from 'lucide-react';
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

interface VendorSummary {
  supplier_name: string;
  total_purchases: number;
  total_quantity: number;
  total_cost: number;
  last_purchase_date: string;
}

interface Vendor {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  total_purchases: number;
  total_quantity: number;
  total_cost: number;
  last_purchase_date?: string;
}

export default function StockManagementPage() {
  const [activeTab, setActiveTab] = useState<'purchases' | 'vendors'>('purchases');
  const [purchases, setPurchases] = useState<StockPurchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    vendor_id: '',
    supplier_name: '',
    notes: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });
  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [items, setItems] = useState<PurchaseItem[]>([
    { product_id: '', quantity: '', purchase_price: '' }
  ]);

  useEffect(() => {
    loadPurchases();
    loadProducts();
    loadVendors();
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

  const loadVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading vendors:', error);
      setVendors([]);
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

    if (!formData.vendor_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Harap pilih vendor',
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
            vendor_id: parseInt(formData.vendor_id),
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
          vendor_id: '',
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

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorFormData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Nama vendor wajib diisi',
        timer: 2000
      });
      return;
    }

    try {
      const url = editingVendor ? `/api/vendors/${editingVendor.id}` : '/api/vendors';
      const method = editingVendor ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorFormData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save vendor');
      }

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editingVendor ? 'Vendor berhasil diupdate' : 'Vendor berhasil ditambahkan',
        timer: 2000
      });

      setVendorFormData({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
      });
      setEditingVendor(null);
      setShowVendorForm(false);
      loadVendors();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message || 'Gagal menyimpan vendor',
        timer: 2000
      });
    }
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVendorFormData({
      name: vendor.name,
      contact_person: vendor.contact_person || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      notes: vendor.notes || ''
    });
    setShowVendorForm(true);
  };

  const handleDeleteVendor = async (vendor: Vendor) => {
    const result = await Swal.fire({
      title: 'Hapus Vendor?',
      text: `Hapus vendor ${vendor.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/vendors/${vendor.id}`, {
          method: 'DELETE'
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to delete vendor');
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Vendor berhasil dihapus',
          timer: 2000
        });
        loadVendors();
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: error.message || 'Gagal menghapus vendor',
          timer: 2000
        });
      }
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
    (p.supplier_name && p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.vendor_name && p.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter vendors by search
  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.contact_person && v.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.phone && v.phone.includes(searchTerm))
  );

  // Get purchases for selected vendor
  const selectedVendorData = vendors.find(v => v.name === selectedVendor);
  const vendorPurchases = selectedVendor
    ? purchases.filter(p => p.vendor_name === selectedVendor || p.supplier_name === selectedVendor)
    : [];

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
            {activeTab === 'purchases' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                Tambah Pembelian
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 border-b border-slate-200">
            <button
              onClick={() => {
                setActiveTab('purchases');
                setSelectedVendor(null);
              }}
              className={`px-4 py-2 font-semibold text-sm transition-all relative ${
                activeTab === 'purchases'
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package size={18} />
                <span>Riwayat Pembelian</span>
              </div>
              {activeTab === 'purchases' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-4 py-2 font-semibold text-sm transition-all relative ${
                activeTab === 'vendors'
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>Daftar Vendor</span>
                <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                  {vendors.length}
                </span>
              </div>
              {activeTab === 'vendors' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        {activeTab === 'purchases' && (
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
        )}

        {activeTab === 'vendors' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium mb-1">Total Vendor</p>
                  <p className="text-2xl font-bold text-blue-600">{vendors.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium mb-1">Total Transaksi</p>
                  <p className="text-2xl font-bold text-purple-600">{totalPurchases}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium mb-1">Total Nilai Pembelian</p>
                  <p className="text-2xl font-bold text-green-600">Rp {totalCost.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && activeTab === 'purchases' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Tambah Pembelian Stok</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Informasi Umum Pembelian */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Informasi Pembelian</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Vendor *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.vendor_id}
                        onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Pilih Vendor</option>
                        {vendors.map(vendor => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowVendorForm(true)}
                        className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors flex items-center gap-1"
                        title="Tambah Vendor Baru"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {vendors.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Belum ada vendor. Klik tombol + untuk menambah vendor.
                      </p>
                    )}
                  </div>
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
              placeholder={activeTab === 'purchases' ? "Cari produk atau supplier..." : "Cari vendor..."}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Vendor List */}
        {activeTab === 'vendors' && !selectedVendor && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setEditingVendor(null);
                  setVendorFormData({
                    name: '',
                    contact_person: '',
                    phone: '',
                    email: '',
                    address: '',
                    notes: ''
                  });
                  setShowVendorForm(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                Tambah Vendor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1" onClick={() => setSelectedVendor(vendor.name)} className="cursor-pointer">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Building2 className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                          {vendor.name}
                        </h3>
                        <p className="text-xs text-slate-500">Vendor Supplier</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditVendor(vendor);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVendor(vendor);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {vendor.contact_person && (
                    <p className="text-xs text-slate-600 mb-1">👤 {vendor.contact_person}</p>
                  )}
                  {vendor.phone && (
                    <p className="text-xs text-slate-600 mb-2">📞 {vendor.phone}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-blue-50 rounded-lg p-3 cursor-pointer" onClick={() => setSelectedVendor(vendor.name)}>
                      <p className="text-xs text-slate-600 mb-1">Total Transaksi</p>
                      <p className="text-lg font-bold text-blue-600">{vendor.total_purchases || 0}x</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 cursor-pointer" onClick={() => setSelectedVendor(vendor.name)}>
                      <p className="text-xs text-slate-600 mb-1">Total Unit</p>
                      <p className="text-lg font-bold text-purple-600">{vendor.total_quantity || 0}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 cursor-pointer" onClick={() => setSelectedVendor(vendor.name)}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">Total Nilai</span>
                      <span className="text-sm font-bold text-green-600">
                        Rp {Number(vendor.total_cost || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {vendor.last_purchase_date && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                        <Calendar size={12} />
                        <span>Terakhir: {new Date(vendor.last_purchase_date).toLocaleDateString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredVendors.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white rounded-xl border border-slate-200">
                  <Users className="mx-auto text-slate-300 mb-3" size={40} />
                  <p className="text-sm text-slate-600">
                    {searchTerm ? 'Vendor tidak ditemukan' : 'Belum ada vendor'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Vendor Detail View */}
        {activeTab === 'vendors' && selectedVendor && (
          <div className="space-y-4">
            {/* Vendor Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <button
                onClick={() => setSelectedVendor(null)}
                className="mb-4 text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
              >
                ← Kembali ke Daftar Vendor
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedVendor}</h2>
                  <p className="text-sm text-slate-600">Riwayat Pembelian Vendor</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 mb-1">Total Transaksi</p>
                  <p className="text-2xl font-bold text-blue-600">{vendorPurchases.length}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 mb-1">Total Unit Dibeli</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {vendorPurchases.reduce((sum, p) => sum + Number(p.quantity), 0)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600 mb-1">Total Nilai Pembelian</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rp {vendorPurchases.reduce((sum, p) => sum + Number(p.total_cost), 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor Purchases Table */}
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
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Harga Beli
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Total Biaya
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {vendorPurchases.map((purchase) => (
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
                          <div>
                            <p className="font-semibold text-sm text-slate-900">{purchase.product_name}</p>
                            {purchase.category_name && (
                              <p className="text-xs text-slate-500">{purchase.category_name}</p>
                            )}
                          </div>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Purchases List */}
        {activeTab === 'purchases' && (
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
        )}

        {filteredPurchases.length === 0 && activeTab === 'purchases' && (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="text-center py-16">
              <Package className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-sm text-slate-600">
                {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada pembelian stok'}
              </p>
            </div>
          </div>
        )}

        {/* Vendor Form Modal */}
        {showVendorForm && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowVendorForm(false);
                setEditingVendor(null);
              }
            }}
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h2 className="text-lg font-bold">{editingVendor ? 'Edit Vendor' : 'Tambah Vendor Baru'}</h2>
                    <p className="text-xs opacity-90 mt-0.5">Isi informasi vendor</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowVendorForm(false);
                      setEditingVendor(null);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleVendorSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Nama Vendor *
                    </label>
                    <input
                      type="text"
                      value={vendorFormData.name}
                      onChange={(e) => setVendorFormData({ ...vendorFormData, name: e.target.value })}
                      placeholder="Contoh: PT Maju Jaya"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Nama Kontak
                    </label>
                    <input
                      type="text"
                      value={vendorFormData.contact_person}
                      onChange={(e) => setVendorFormData({ ...vendorFormData, contact_person: e.target.value })}
                      placeholder="Nama person in charge"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      value={vendorFormData.phone}
                      onChange={(e) => setVendorFormData({ ...vendorFormData, phone: e.target.value })}
                      placeholder="081234567890"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={vendorFormData.email}
                      onChange={(e) => setVendorFormData({ ...vendorFormData, email: e.target.value })}
                      placeholder="vendor@email.com"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Alamat
                  </label>
                  <textarea
                    value={vendorFormData.address}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, address: e.target.value })}
                    placeholder="Alamat lengkap vendor..."
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value={vendorFormData.notes}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, notes: e.target.value })}
                    placeholder="Catatan tambahan..."
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    {editingVendor ? 'Update Vendor' : 'Simpan Vendor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVendorForm(false);
                      setEditingVendor(null);
                    }}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
