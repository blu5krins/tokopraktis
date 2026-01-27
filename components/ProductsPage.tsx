'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, X, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

interface Product {
  id: number;
  name: string;
  category_id: number | null;
  price: number;
  cost_price?: number;
  sell_price?: number;
  stock: number;
  unit_type?: string;
  has_pieces?: boolean;
  pieces_per_pack?: number;
  price_per_piece?: number;
  debt_price?: number;
  debt_price_per_piece?: number;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    cost_price: '',
    sell_price: '',
    price: '',
    stock: '',
    unit_type: 'pcs',
    has_pieces: false,
    pieces_per_pack: '',
    price_per_piece: '',
    debt_price: '',
    debt_price_per_piece: ''
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: number | null): string => {
    if (!categoryId) return 'Tanpa Kategori';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Tanpa Kategori';
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        name: formData.name,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        cost_price: parseFloat(formData.cost_price) || 0,
        sell_price: parseFloat(formData.sell_price) || 0,
        price: parseFloat(formData.sell_price || formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        unit_type: formData.unit_type,
        has_pieces: formData.has_pieces,
        pieces_per_pack: parseInt(formData.pieces_per_pack) || 1,
        price_per_piece: parseFloat(formData.price_per_piece) || 0,
        debt_price: parseFloat(formData.debt_price) || 0,
        debt_price_per_piece: parseFloat(formData.debt_price_per_piece) || 0
      };

      if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        
        if (res.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Produk berhasil diupdate.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        
        if (res.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Produk berhasil ditambahkan.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }

      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal menyimpan produk.',
        timer: 2000
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      category_id: product.category_id ? product.category_id.toString() : '',
      cost_price: product.cost_price ? product.cost_price.toString() : '',
      sell_price: product.sell_price ? product.sell_price.toString() : product.price ? product.price.toString() : '',
      price: product.price ? product.price.toString() : '',
      stock: product.stock ? product.stock.toString() : '',
      unit_type: product.unit_type || 'pcs',
      has_pieces: !!product.has_pieces,
      pieces_per_pack: product.pieces_per_pack ? product.pieces_per_pack.toString() : '',
      price_per_piece: product.price_per_piece ? product.price_per_piece.toString() : '',
      debt_price: product.debt_price ? product.debt_price.toString() : '',
      debt_price_per_piece: product.debt_price_per_piece ? product.debt_price_per_piece.toString() : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus produk ini?')) {
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      category_id: '', 
      cost_price: '', 
      sell_price: '', 
      price: '', 
      stock: '',
      unit_type: 'pcs',
      has_pieces: false,
      pieces_per_pack: '',
      price_per_piece: '',
      debt_price: '',
      debt_price_per_piece: ''
    });
    setEditingId(null);
    setShowModal(false);
  };

  // Ekstrak kategori unik dari produk
  const productCategories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Produk</h1>
              <p className="text-xs text-slate-600 mt-1">{products.length} produk terdaftar</p>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl px-4 py-2 flex items-center gap-2">
              <Package size={18} className="text-white" />
              <div>
                <p className="text-xs text-white/80 font-medium">Total Stok</p>
                <p className="text-base font-bold text-white">
                  {products.reduce((sum, p) => sum + p.stock, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 order-first">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-3">
            {productCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category === 'all' ? 'Semua' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map(product => {
            const costPrice = product.cost_price || 0;
            const sellPrice = product.sell_price || product.price || 0;
            const profit = sellPrice - costPrice;
            const profitPercent = costPrice > 0 ? ((profit / costPrice) * 100).toFixed(1) : 0;
            
            return (
            <div
              key={product.id}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow"
            >
              {/* Header Row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {product.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 truncate">{product.name}</h3>
                  <p className="text-xs text-slate-500">{getCategoryName(product.category_id)}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-bold flex-shrink-0 ${
                  product.stock > 10 ? 'bg-green-100 text-green-700' : 
                  product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock}
                </span>
              </div>
              
              {/* Price Row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Jual</p>
                  <p className="text-sm font-bold text-indigo-600">Rp {Number(sellPrice).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs text-slate-500">Modal</p>
                  <p className="text-xs font-medium text-slate-600">Rp {Number(costPrice).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-slate-500">Profit</p>
                  <p className="text-xs font-bold text-green-600">{profitPercent}%</p>
                </div>
              </div>
              
              {/* Extra Info & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {product.has_pieces && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {product.pieces_per_pack} btg
                    </span>
                  )}
                  {product.debt_price && Number(product.debt_price) > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                      Hutang
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setViewProduct(product)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Detail"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Package className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm text-slate-600">Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => {
          setEditingId(null);
          setFormData({
            name: '',
            category_id: '',
            cost_price: '',
            sell_price: '',
            price: '',
            stock: '',
            unit_type: 'pcs',
            has_pieces: false,
            pieces_per_pack: '',
            price_per_piece: '',
            debt_price: '',
            debt_price_per_piece: ''
          });
          setShowModal(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 hover:scale-110"
      >
        <Plus size={28} />
      </button>

      {/* View Detail Modal */}
      {viewProduct && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewProduct(null);
          }}
        >
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Detail Produk</h2>
                <button
                  onClick={() => setViewProduct(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Product Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                  {viewProduct.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{viewProduct.name}</h3>
                  <p className="text-sm text-slate-500">{getCategoryName(viewProduct.category_id)}</p>
                </div>
              </div>

              {/* Price Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Harga Jual</p>
                  <p className="text-lg font-bold text-indigo-600">
                    Rp {Number(viewProduct.sell_price || viewProduct.price || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Harga Modal</p>
                  <p className="text-lg font-bold text-slate-700">
                    Rp {Number(viewProduct.cost_price || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Stock & Unit */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Stok</p>
                  <p className="text-lg font-bold text-green-600">
                    {viewProduct.stock} {viewProduct.unit_type || 'pcs'}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Profit</p>
                  <p className="text-lg font-bold text-purple-600">
                    {(() => {
                      const sell = Number(viewProduct.sell_price || viewProduct.price || 0);
                      const cost = Number(viewProduct.cost_price || 0);
                      const profit = cost > 0 ? ((sell - cost) / cost * 100).toFixed(0) : 0;
                      return `${profit}%`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Pieces Info */}
              {viewProduct.has_pieces && (
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-slate-500 mb-2">Penjualan per Batang</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Isi per Pack</span>
                    <span className="font-bold text-purple-700">{viewProduct.pieces_per_pack} btg</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-slate-600">Harga per Batang</span>
                    <span className="font-bold text-purple-700">
                      Rp {Number(viewProduct.price_per_piece || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              {/* Debt Price */}
              {viewProduct.debt_price && Number(viewProduct.debt_price) > 0 && (
                <div className="bg-amber-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-slate-500 mb-2">Harga Hutang</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Harga Hutang</span>
                    <span className="font-bold text-amber-700">
                      Rp {Number(viewProduct.debt_price).toLocaleString('id-ID')}
                    </span>
                  </div>
                  {viewProduct.has_pieces && viewProduct.debt_price_per_piece && Number(viewProduct.debt_price_per_piece) > 0 && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-slate-600">Harga Hutang/Batang</span>
                      <span className="font-bold text-amber-700">
                        Rp {Number(viewProduct.debt_price_per_piece).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    handleEdit(viewProduct);
                    setViewProduct(null);
                  }}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Edit Produk
                </button>
                <button
                  onClick={() => setViewProduct(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
        >
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Edit Produk' : 'Tambah Produk'}
                </h2>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-2">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama produk"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-2">
                  Kategori
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-2">
                    Harga Beli
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-2">
                    Harga Jual
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.sell_price}
                    onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-2">
                    Satuan
                  </label>
                  <select
                    value={formData.unit_type}
                    onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="pcs">Pcs</option>
                    <option value="bungkus">Bungkus</option>
                    <option value="pack">Pack</option>
                    <option value="box">Box</option>
                    <option value="kg">Kg</option>
                    <option value="liter">Liter</option>
                    <option value="botol">Botol</option>
                    <option value="sachet">Sachet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-2">
                    Stok
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Harga Hutang */}
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-xs font-semibold text-amber-600 mb-2">
                  💰 Harga Hutang (opsional)
                </label>
                <input
                  type="number"
                  value={formData.debt_price}
                  onChange={(e) => setFormData({ ...formData, debt_price: e.target.value })}
                  placeholder="Kosongkan jika sama dengan harga jual"
                  className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Harga jika pembeli hutang</p>
              </div>

              {/* Toggle untuk satuan kecil */}
              <div className="border-t border-slate-200 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_pieces}
                    onChange={(e) => setFormData({ ...formData, has_pieces: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-900">
                    Bisa dijual per satuan kecil (misal: per batang)
                  </span>
                </label>
              </div>

              {formData.has_pieces && (
                <div className="bg-indigo-50 rounded-lg p-4 space-y-4">
                  <p className="text-xs font-semibold text-indigo-700">⚡ Pengaturan Satuan Kecil</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-900 mb-2">
                        Isi per {formData.unit_type}
                      </label>
                      <input
                        type="number"
                        value={formData.pieces_per_pack}
                        onChange={(e) => setFormData({ ...formData, pieces_per_pack: e.target.value })}
                        placeholder="Misal: 16 batang"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-900 mb-2">
                        Harga per satuan
                      </label>
                      <input
                        type="number"
                        value={formData.price_per_piece}
                        onChange={(e) => setFormData({ ...formData, price_per_piece: e.target.value })}
                        placeholder="Misal: 2500"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-900 mb-2">
                      Harga hutang per satuan
                    </label>
                    <input
                      type="number"
                      value={formData.debt_price_per_piece}
                      onChange={(e) => setFormData({ ...formData, debt_price_per_piece: e.target.value })}
                      placeholder="Kosongkan jika sama"
                      className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  {editingId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
