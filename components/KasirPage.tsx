'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Minus, X, ShoppingCart, CreditCard, Banknote, Building2, QrCode, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface Product {
  id: number;
  name: string;
  price: number;
  cost_price?: number;
  sell_price?: number;
  stock: number;
  category_id?: number | null;
  category_name?: string;
  unit_type?: string;
  has_pieces?: boolean;
  pieces_per_pack?: number;
  price_per_piece?: number;
  debt_price?: number;
  debt_price_per_piece?: number;
}

interface CartItem extends Product {
  quantity: number;
  selectedUnit: 'pack' | 'piece'; // pack = bungkus/satuan besar, piece = batang/satuan kecil
  unitPrice: number; // harga per unit yang dipilih
}

interface Customer {
  id: number;
  name: string;
  phone: string;
}

// Format harga dengan format Indonesia (titik sebagai pemisah ribuan)
const formatPrice = (price: number) => {
  return price.toLocaleString('id-ID');
};

export default function KasirPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customerName, setCustomerName] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isDebtMode, setIsDebtMode] = useState(false);
  const [payment, setPayment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'qris'>('cash');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [settings, setSettings] = useState<any>({ bank_name: '', account_number: '', account_holder: '', qris_image: '' });

  useEffect(() => {
    loadProducts();
    loadCustomers();
    loadSettings();
  }, []);

  const loadProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const loadCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    setCustomers(data);
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Fungsi untuk mendapatkan harga berdasarkan unit dan mode hutang
  const getPrice = (product: Product, unit: 'pack' | 'piece', isDebt: boolean) => {
    if (unit === 'piece') {
      // Satuan kecil (batang)
      if (isDebt && product.debt_price_per_piece && Number(product.debt_price_per_piece) > 0) {
        return Number(product.debt_price_per_piece);
      }
      return Number(product.price_per_piece) || 0;
    } else {
      // Satuan besar (bungkus)
      if (isDebt && product.debt_price && Number(product.debt_price) > 0) {
        return Number(product.debt_price);
      }
      return Number(product.sell_price) || Number(product.price) || 0;
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Stok Habis!',
        text: 'Produk ini sudah habis.',
        timer: 2000
      });
      return;
    }

    // Jika produk bisa dijual per satuan kecil, tampilkan modal pilihan
    if (product.has_pieces && Number(product.pieces_per_pack) > 1) {
      setSelectedProduct(product);
      setShowUnitModal(true);
      return;
    }

    // Langsung tambahkan dengan unit default (pack)
    addToCartWithUnit(product, 'pack');
  };

  const addToCartWithUnit = (product: Product, unit: 'pack' | 'piece') => {
    const unitPrice = getPrice(product, unit, isDebtMode);
    const cartKey = `${product.id}-${unit}`; // Unique key untuk produk + unit
    
    const existing = cart.find(item => item.id === product.id && item.selectedUnit === unit);
    if (existing) {
      // Cek stok berdasarkan unit
      const maxQty = unit === 'piece' 
        ? product.stock * (Number(product.pieces_per_pack) || 1)
        : product.stock;
      
      if (existing.quantity < maxQty) {
        setCart(cart.map(item =>
          (item.id === product.id && item.selectedUnit === unit)
            ? { ...item, quantity: item.quantity + 1, unitPrice }
            : item
        ));
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Stok Tidak Mencukupi!',
          text: 'Jumlah melebihi stok yang tersedia.',
          timer: 2000
        });
      }
    } else {
      setCart([...cart, { 
        ...product, 
        quantity: 1, 
        selectedUnit: unit,
        unitPrice 
      }]);
    }
    
    setShowUnitModal(false);
    setSelectedProduct(null);
  };

  const updateQuantity = (id: number, unit: 'pack' | 'piece', delta: number) => {
    const item = cart.find(i => i.id === id && i.selectedUnit === unit);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    const maxQty = unit === 'piece' 
      ? item.stock * (Number(item.pieces_per_pack) || 1)
      : item.stock;
      
    if (newQuantity <= 0) {
      setCart(cart.filter(i => !(i.id === id && i.selectedUnit === unit)));
    } else if (newQuantity <= maxQty) {
      setCart(cart.map(i =>
        (i.id === id && i.selectedUnit === unit) ? { ...i, quantity: newQuantity } : i
      ));
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Stok Tidak Mencukupi!',
        text: 'Jumlah melebihi stok yang tersedia.',
        timer: 2000
      });
    }
  };

  const removeFromCart = (id: number, unit: 'pack' | 'piece') => {
    setCart(cart.filter(item => !(item.id === id && item.selectedUnit === unit)));
  };

  const total = cart.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity;
  }, 0);
  const paymentAmount = parseFloat(payment) || 0;
  const change = isDebtMode ? 0 : paymentAmount - total;
  const debt = isDebtMode ? total - paymentAmount : 0;

  const processTransaction = async () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Keranjang Kosong!',
        text: 'Tambahkan produk ke keranjang terlebih dahulu.',
        timer: 2000
      });
      return;
    }

    if (!customerName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Nama Pelanggan Kosong!',
        text: 'Masukkan nama pelanggan terlebih dahulu.',
        timer: 2000
      });
      return;
    }

    let customer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
    if (!customer) {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customerName, phone: '', address: '' })
      });
      customer = await res.json();
      await loadCustomers();
    }

    if (!customer || !customer.id) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal membuat/menemukan pelanggan.',
        timer: 2000
      });
      return;
    }

    if (isDebtMode) {
      if (paymentAmount > total) {
        Swal.fire({
          icon: 'warning',
          title: 'Pembayaran Melebihi Total!',
          text: 'Untuk transaksi utang, pembayaran tidak boleh melebihi total.',
          timer: 2500
        });
        return;
      }

      const transactionData = {
        items: cart.map(item => {
          const unitLabel = item.selectedUnit === 'piece' ? 'btg' : (item.unit_type || 'pcs');
          return {
            id: item.id,
            name: `${item.name} (${unitLabel})`,
            quantity: item.quantity,
            price: item.unitPrice,
            subtotal: item.unitPrice * item.quantity,
            selectedUnit: item.selectedUnit
          };
        }),
        total,
        payment: paymentAmount,
        change: 0,
        customer_id: customer.id,
        debt_amount: debt
      };

      const res = await fetch('/api/transactions/debt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Transaksi Berhasil!',
          html: `
            <div>
              <p><strong>Total:</strong> Rp ${total.toLocaleString()}</p>
              <p><strong>Bayar:</strong> Rp ${paymentAmount.toLocaleString()}</p>
              <p><strong>Utang:</strong> Rp ${debt.toLocaleString()}</p>
            </div>
          `,
          timer: 3000
        });
        resetCart();
        setShowCheckoutModal(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Transaksi Gagal!',
          text: 'Terjadi kesalahan saat memproses transaksi.',
          timer: 2000
        });
      }
    } else {
      if (paymentAmount < total) {
        Swal.fire({
          icon: 'warning',
          title: 'Pembayaran Kurang!',
          text: 'Jumlah pembayaran kurang dari total.',
          timer: 2000
        });
        return;
      }

      const transactionData = {
        items: cart.map(item => {
          const unitLabel = item.selectedUnit === 'piece' ? 'btg' : (item.unit_type || 'pcs');
          return {
            id: item.id,
            name: `${item.name} (${unitLabel})`,
            quantity: item.quantity,
            price: item.unitPrice,
            subtotal: item.unitPrice * item.quantity,
            selectedUnit: item.selectedUnit
          };
        }),
        total,
        payment: paymentAmount,
        change,
        customer_id: customer.id,
        payment_method: paymentMethod
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Transaksi Berhasil!',
          html: `
            <div>
              <p><strong>Total:</strong> Rp ${total.toLocaleString()}</p>
              <p><strong>Bayar:</strong> Rp ${paymentAmount.toLocaleString()}</p>
              <p><strong>Kembalian:</strong> Rp ${change.toLocaleString()}</p>
            </div>
          `,
          timer: 3000
        });
        resetCart();
        setShowCheckoutModal(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Transaksi Gagal!',
          text: 'Terjadi kesalahan saat memproses transaksi.',
          timer: 2000
        });
      }
    }
  };

  const resetCart = () => {
    setCart([]);
    setPayment('');
    setPaymentMethod('cash');
    setCustomerName('');
    setIsDebtMode(false);
    setShowPaymentModal(false);
    loadProducts();
  };

  // Update harga di cart ketika mode hutang berubah
  const updateCartPrices = (debtMode: boolean) => {
    setCart(cart.map(item => ({
      ...item,
      unitPrice: getPrice(item, item.selectedUnit, debtMode)
    })));
  };

  const handleDebtModeChange = (checked: boolean) => {
    setIsDebtMode(checked);
    updateCartPrices(checked);
    // Reset payment saat mode hutang aktif
    if (checked) {
      setPayment('0');
    } else {
      setPayment('');
    }
  };

  // Ekstrak kategori unik dari produk
  const categories: string[] = ['all', ...new Set(products.map(p => p.category_name).filter(Boolean) as string[])];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'all' || p.category_name === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">Kasir</h1>
              <p className="text-xs text-slate-600 mt-1">Point of Sale - Transaksi Penjualan</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map(category => (
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

      {/* Main Content - Split Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Side - Products Grid */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <button
            key={product.id}
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className="bg-white rounded-xl p-3 hover:shadow-lg transition-all duration-200 border border-slate-200 hover:border-indigo-300 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <h3 className="font-semibold text-xs text-slate-900 mb-1 text-center leading-tight min-h-[2rem] flex items-center justify-center">{product.name}</h3>
            <p className="text-xs text-slate-400 mb-1 text-center">{product.category}</p>
            <p className="text-xs font-bold text-indigo-600 text-center mb-1">
              Rp {formatPrice(product.sell_price || product.price)}
            </p>
            <div className="flex justify-center">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                product.stock > 10 ? 'bg-green-100 text-green-700' : 
                product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
                {product.stock}
              </span>
            </div>
          </button>
        ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <Search className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 text-sm">Produk tidak ditemukan</p>
            </div>
          )}
          
          {/* Spacer for mobile floating button */}
          <div className="lg:hidden h-20"></div>
        </div>

        {/* Right Side - Cart Panel (Hidden on Mobile) */}
        <div className="hidden lg:flex w-full lg:w-96 bg-white rounded-2xl border border-slate-200 shadow-sm flex-col overflow-hidden">
          {/* Cart Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} />
                <h2 className="text-base font-semibold">Keranjang</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-medium">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
              </div>
            </div>
            <div className="text-2xl font-bold">
              Rp {total.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto text-slate-300 mb-2" size={36} />
                <p className="text-slate-500 text-sm">Keranjang masih kosong</p>
                <p className="text-slate-400 text-xs mt-1">Pilih produk untuk memulai transaksi</p>
              </div>
            ) : (
              cart.map(item => {
                const unitLabel = item.selectedUnit === 'piece' ? 'btg' : (item.unit_type || 'pcs');
                return (
                <div key={`${item.id}-${item.selectedUnit}`} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-base font-bold text-indigo-600">{item.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Rp {formatPrice(item.unitPrice)} / {unitLabel}
                        {isDebtMode && <span className="ml-1 text-amber-600">(hutang)</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedUnit, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 text-slate-900"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm w-8 text-center text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedUnit, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 text-slate-900"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedUnit)}
                          className="w-7 h-7 flex items-center justify-center bg-red-50 rounded-lg hover:bg-red-100 text-red-600 transition-colors ml-auto"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm">
                        Rp {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>

          {/* Checkout Section */}
          {cart.length > 0 && (
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl py-4 font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Cart Button */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setShowMobileCart(true)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl py-4 font-bold shadow-lg flex items-center justify-center gap-3"
          >
            <div className="relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2 bg-white text-indigo-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <span>Lihat Keranjang</span>
            <span className="ml-auto bg-white/20 px-3 py-1 rounded-lg text-sm">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </button>
        </div>
      )}

      {/* Mobile Cart Modal */}
      {showMobileCart && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-50 flex items-end justify-center backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMobileCart(false);
          }}
        >
          <div className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Mobile Cart Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} />
                  <h2 className="text-lg font-bold">Keranjang</h2>
                </div>
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-2xl font-bold">
                Rp {total.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Mobile Cart Items */}
            <div className="overflow-y-auto p-3 space-y-2" style={{ maxHeight: 'calc(85vh - 180px)' }}>
              {cart.map(item => {
                const unitLabel = item.selectedUnit === 'piece' ? 'btg' : (item.unit_type || 'pcs');
                return (
                  <div key={`mobile-${item.id}-${item.selectedUnit}`} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-indigo-600">{item.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-slate-500">
                          Rp {formatPrice(item.unitPrice)} / {unitLabel}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedUnit, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-slate-900"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm w-6 text-center text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedUnit, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-slate-900"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedUnit)}
                          className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right mt-2">
                      <p className="font-bold text-indigo-600 text-sm">
                        Rp {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Cart Checkout */}
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              <button
                onClick={() => {
                  setShowMobileCart(false);
                  setShowCheckoutModal(true);
                }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl py-4 font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                Checkout - Rp {total.toLocaleString('id-ID')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div 
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCheckoutModal(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200 scrollbar-hide">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h2 className="text-lg font-bold">Checkout</h2>
                  <p className="text-xs opacity-90 mt-0.5">{cart.length} items dalam keranjang</p>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Cart Items */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Item Pesanan</h3>
                <div className="bg-slate-50 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                  {cart.map(item => {
                    const unitLabel = item.selectedUnit === 'piece' ? 'btg' : (item.unit_type || 'pcs');
                    return (
                    <div key={`${item.id}-${item.selectedUnit}`} className="bg-white rounded-lg p-2 flex items-center gap-2 shadow-sm">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-md flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-600">{item.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500">
                          Rp {formatPrice(item.unitPrice)} / {unitLabel}
                          {isDebtMode && <span className="ml-1 text-amber-600">(hutang)</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedUnit, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 text-slate-900"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-bold text-sm w-6 text-center text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedUnit, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 text-slate-900"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedUnit)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg hover:bg-red-50 text-red-600 transition-colors ml-1 border border-red-200"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Nama Pelanggan</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="Masukkan atau pilih pelanggan"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {showCustomerDropdown && customers.filter(c => 
                  c.name.toLowerCase().includes(customerName.toLowerCase())
                ).length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {customers
                      .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()))
                      .map(customer => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            setCustomerName(customer.name);
                            setShowCustomerDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 text-gray-900 text-sm transition-colors"
                        >
                          {customer.name}
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>

              {/* Debt Mode Toggle */}
              <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <input
                  type="checkbox"
                  id="debtModeModal"
                  checked={isDebtMode}
                  onChange={(e) => handleDebtModeChange(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="debtModeModal" className="font-medium text-sm text-gray-900 cursor-pointer">
                  Mode Transaksi Utang
                </label>
              </div>



              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Belanja</span>
                  <span className="text-xl font-bold text-gray-900">Rp {total.toLocaleString('id-ID')}</span>
                </div>
                
                {isDebtMode && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-sm text-gray-600 font-medium">Total Utang</span>
                    <span className="text-xl font-bold text-red-600">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors text-sm"
                >
                  Kembali
                </button>
                <button
                  onClick={() => {
                    if (!customerName.trim()) {
                      Swal.fire({
                        icon: 'warning',
                        title: 'Nama Pelanggan Kosong!',
                        text: 'Silakan masukkan nama pelanggan terlebih dahulu.',
                        timer: 2500
                      });
                      return;
                    }
                    if (isDebtMode) {
                      processTransaction();
                    } else {
                      setShowPaymentModal(true);
                    }
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                >
                  Proses Pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unit Selection Modal */}
      {showUnitModal && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUnitModal(false);
              setSelectedProduct(null);
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-sm w-full shadow-xl">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Pilih Satuan</h2>
                <button
                  onClick={() => {
                    setShowUnitModal(false);
                    setSelectedProduct(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-1">{selectedProduct.name}</p>
            </div>

            <div className="p-4 space-y-3">
              {/* Pack/Bungkus Option */}
              <button
                onClick={() => addToCartWithUnit(selectedProduct, 'pack')}
                className="w-full p-4 bg-slate-50 hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-300 rounded-xl transition-all text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">
                      Per {selectedProduct.unit_type || 'Bungkus'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Isi {selectedProduct.pieces_per_pack || 1} satuan
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">
                      Rp {formatPrice(getPrice(selectedProduct, 'pack', isDebtMode))}
                    </p>
                    {isDebtMode && selectedProduct.debt_price && Number(selectedProduct.debt_price) > 0 && (
                      <p className="text-xs text-amber-600">Harga hutang</p>
                    )}
                  </div>
                </div>
              </button>

              {/* Piece/Batang Option */}
              <button
                onClick={() => addToCartWithUnit(selectedProduct, 'piece')}
                className="w-full p-4 bg-slate-50 hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-300 rounded-xl transition-all text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Per Batang / Satuan</p>
                    <p className="text-xs text-slate-500 mt-0.5">Beli eceran</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">
                      Rp {formatPrice(getPrice(selectedProduct, 'piece', isDebtMode))}
                    </p>
                    {isDebtMode && selectedProduct.debt_price_per_piece && Number(selectedProduct.debt_price_per_piece) > 0 && (
                      <p className="text-xs text-amber-600">Harga hutang</p>
                    )}
                  </div>
                </div>
              </button>

              {isDebtMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
                  <p className="text-xs text-amber-700">⚠️ Mode Hutang Aktif - Harga menyesuaikan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPaymentModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h2 className="text-lg font-bold">Metode Pembayaran</h2>
                  <p className="text-xs opacity-90 mt-0.5">Pilih metode pembayaran</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Payment Total */}
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-600">Total Pembayaran</p>
                <p className="text-2xl font-bold text-slate-900">Rp {total.toLocaleString('id-ID')}</p>
              </div>

              {/* Payment Method Options */}
              <div className="space-y-2">
                {/* Cash Option */}
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    paymentMethod === 'cash'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    paymentMethod === 'cash' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Banknote size={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold ${paymentMethod === 'cash' ? 'text-indigo-700' : 'text-slate-900'}`}>Tunai</p>
                    <p className="text-xs text-slate-500">Pembayaran dengan uang tunai</p>
                  </div>
                  {paymentMethod === 'cash' && (
                    <CheckCircle className="text-indigo-500" size={24} />
                  )}
                </button>

                {/* Transfer Option */}
                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    paymentMethod === 'transfer'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    paymentMethod === 'transfer' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Building2 size={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold ${paymentMethod === 'transfer' ? 'text-indigo-700' : 'text-slate-900'}`}>Transfer Bank</p>
                    <p className="text-xs text-slate-500">Transfer ke rekening bank</p>
                  </div>
                  {paymentMethod === 'transfer' && (
                    <CheckCircle className="text-indigo-500" size={24} />
                  )}
                </button>

                {/* QRIS Option */}
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    paymentMethod === 'qris'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    paymentMethod === 'qris' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <QrCode size={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold ${paymentMethod === 'qris' ? 'text-indigo-700' : 'text-slate-900'}`}>QRIS</p>
                    <p className="text-xs text-slate-500">Scan QR untuk pembayaran</p>
                  </div>
                  {paymentMethod === 'qris' && (
                    <CheckCircle className="text-indigo-500" size={24} />
                  )}
                </button>
              </div>

              {/* Cash Payment Input */}
              {paymentMethod === 'cash' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Banknote className="text-green-600" size={20} />
                    <h4 className="font-semibold text-green-900">Pembayaran Tunai</h4>
                  </div>
                  <input
                    type="text"
                    placeholder="Masukkan jumlah uang"
                    value={payment ? parseInt(payment.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPayment(value);
                    }}
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center"
                  />
                  <div className="flex justify-between items-center pt-2 border-t border-green-200">
                    <span className="text-sm text-green-700 font-medium">Kembalian</span>
                    <span className={`text-xl font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Rp {change.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              {/* Transfer Bank Info */}
              {paymentMethod === 'transfer' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-blue-600" size={20} />
                    <h4 className="font-semibold text-blue-900">Informasi Rekening</h4>
                  </div>
                  {settings.bank_name && settings.account_number ? (
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-slate-500">{settings.bank_name}</p>
                      <p className="text-lg font-bold text-slate-900 tracking-wider">{settings.account_number}</p>
                      <p className="text-sm text-slate-600">a.n. {settings.account_holder || 'Pemilik Rekening'}</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-3 border border-amber-100 text-center">
                      <p className="text-sm text-amber-600">Belum ada rekening terdaftar</p>
                      <p className="text-xs text-slate-500 mt-1">Silakan atur di menu Pengaturan</p>
                    </div>
                  )}
                  <p className="text-xs text-blue-600 text-center">Transfer sesuai nominal: Rp {total.toLocaleString('id-ID')}</p>
                </div>
              )}

              {/* QRIS Code */}
              {paymentMethod === 'qris' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <QrCode className="text-purple-600" size={20} />
                    <h4 className="font-semibold text-purple-900">Scan QRIS</h4>
                  </div>
                  <div className="flex justify-center">
                    {settings.qris_image ? (
                      <div className="bg-white p-4 rounded-xl border-2 border-purple-200 shadow-inner">
                        <img 
                          src={settings.qris_image} 
                          alt="QRIS Code" 
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-xl border-2 border-amber-200 text-center">
                        <div className="w-48 h-48 flex flex-col items-center justify-center">
                          <QrCode className="text-amber-500 mb-2" size={48} />
                          <p className="text-sm text-amber-600 font-medium">QRIS belum diatur</p>
                          <p className="text-xs text-slate-500 mt-1">Silakan upload di menu Pengaturan</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-purple-600 text-center">Scan menggunakan aplikasi e-wallet atau m-banking</p>
                  <p className="text-sm font-semibold text-purple-900 text-center">Total: Rp {total.toLocaleString('id-ID')}</p>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={() => {
                  if (paymentMethod === 'cash' && change < 0) {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Pembayaran Kurang!',
                      text: 'Jumlah uang yang dibayarkan kurang dari total belanja.',
                      timer: 2500
                    });
                    return;
                  }
                  setShowPaymentModal(false);
                  processTransaction();
                }}
                disabled={paymentMethod === 'cash' && (!payment || parseInt(payment) < total)}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === 'cash' && (!payment || parseInt(payment) < total)
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                <CheckCircle size={20} />
                Konfirmasi Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
