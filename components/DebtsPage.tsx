'use client';

import { useState, useEffect } from 'react';
import { Search, DollarSign, X, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface Debt {
  id: number;
  customer_id: number;
  customer_name: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  created_at: string;
  transaction_items?: string;
}

interface GroupedDebt {
  customer_id: number;
  customer_name: string;
  total_debt: number;
  total_paid: number;
  total_remaining: number;
  debts: Debt[];
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [search, setSearch] = useState('');
  const [paymentModal, setPaymentModal] = useState<{ group: GroupedDebt; amount: string } | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const res = await fetch('/api/debts');
      const data = await res.json();
      // Ensure numeric values are properly converted
      const formattedData = data.map((debt: any) => ({
        ...debt,
        total_amount: Number(debt.total_amount) || 0,
        paid_amount: Number(debt.paid_amount) || 0,
        remaining_amount: Number(debt.remaining_amount) || 0
      }));
      setDebts(formattedData);
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };

  const handlePayment = async () => {
    if (!paymentModal) return;

    const amount = parseFloat(paymentModal.amount || '0');

    if (amount <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Input Tidak Valid!',
        text: 'Masukkan jumlah pembayaran yang valid.',
        timer: 2000
      });
      return;
    }

    if (amount > paymentModal.group.total_remaining) {
      Swal.fire({
        icon: 'warning',
        title: 'Pembayaran Melebihi Utang!',
        text: 'Jumlah pembayaran melebihi total sisa utang.',
        timer: 2000
      });
      return;
    }

    try {
      // Process payment by distributing to unpaid debts
      const res = await fetch(`/api/debts/pay-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customer_id: paymentModal.group.customer_id,
          amount 
        })
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Pembayaran berhasil dicatat.',
          timer: 2000
        });
        setPaymentModal(null);
        loadDebts();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Pembayaran gagal diproses.',
          timer: 2000
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Terjadi kesalahan saat memproses pembayaran.',
        timer: 2000
      });
    }
  };

  const filteredDebts = debts.filter(d =>
    d.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  // Group debts by customer
  const groupedDebts: GroupedDebt[] = Object.values(
    filteredDebts.reduce((acc, debt) => {
      const key = debt.customer_id;
      if (!acc[key]) {
        acc[key] = {
          customer_id: debt.customer_id,
          customer_name: debt.customer_name,
          total_debt: 0,
          total_paid: 0,
          total_remaining: 0,
          debts: []
        };
      }
      acc[key].total_debt += debt.total_amount;
      acc[key].total_paid += debt.paid_amount;
      acc[key].total_remaining += debt.remaining_amount;
      acc[key].debts.push(debt);
      return acc;
    }, {} as Record<number, GroupedDebt>)
  );

  const totalOutstanding = debts
    .filter(d => d.status === 'unpaid')
    .reduce((sum, d) => sum + d.remaining_amount, 0);

  const unpaidCount = debts.filter(d => d.status === 'unpaid').length;
  
  // Count unique customers with debts
  const uniqueCustomers = new Set(debts.map(d => d.customer_id)).size;

  // Format currency untuk angka besar
  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)}M`;
    } else if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}Jt`;
    } else if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(0)}K`;
    }
    return amount.toLocaleString('id-ID');
  };

  const parseTransactionItems = (itemsJson: string) => {
    try {
      return JSON.parse(itemsJson);
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">Kelola Utang</h1>
          <p className="text-xs text-slate-600 mt-1">Pantau dan kelola utang pelanggan</p>
        </div>

        {/* Search & Stats */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari hutang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-red-50 border border-red-200 rounded-xl p-2 sm:p-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="text-white" size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-slate-600">Utang</p>
                    <p className="text-xs sm:text-sm font-bold text-red-600 truncate">
                      Rp {formatCompactCurrency(totalOutstanding)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 sm:p-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="text-white" size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-600">Pelanggan</p>
                    <p className="text-xs sm:text-sm font-bold text-amber-600">{uniqueCustomers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 sm:p-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="text-white" size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-slate-600">Transaksi</p>
                    <p className="text-xs sm:text-sm font-bold text-blue-600">{unpaidCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Debts List - Grouped by Customer */}
        <div className="grid grid-cols-1 gap-3">
          {groupedDebts.map(group => (
            <div key={group.customer_id}>
              {/* Customer Summary Card */}
              <div className="rounded-xl p-4 border bg-white border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Customer Info */}
                  <div 
                    onClick={() => setSelectedCustomer(selectedCustomer === group.customer_id ? null : group.customer_id)}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0">
                      {group.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">{group.customer_name}</h3>
                      <p className="text-xs sm:text-sm text-slate-600">{group.debts.length} transaksi</p>
                    </div>
                  </div>

                  {/* Amount & Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500">Sisa Utang</p>
                      <p className="text-base sm:text-xl font-bold text-red-600">Rp {group.total_remaining.toLocaleString('id-ID')}</p>
                    </div>
                    {group.total_remaining > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentModal({ group, amount: '' });
                        }}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                      >
                        <CreditCard size={16} />
                        <span className="hidden sm:inline">Bayar Utang</span>
                        <span className="sm:hidden">Bayar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Transactions - Show when customer is selected */}
              {selectedCustomer === group.customer_id && (
                <div className="mt-3 space-y-3 pl-4">
                  {group.debts.map(debt => {
                    const items = parseTransactionItems(debt.transaction_items || '[]');
                    return (
                      <div
                        key={debt.id}
                        className="rounded-xl p-4 border bg-slate-50 border-slate-200"
                      >
                        <div className="flex flex-col lg:flex-row gap-4">
                          {/* Transaction Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar size={14} className="text-slate-600" />
                                  <span className="text-sm text-slate-600">
                                    {new Date(debt.created_at).toLocaleDateString('id-ID', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                  debt.status === 'paid' 
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                }`}>
                                  {debt.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}
                                </span>
                              </div>
                            </div>

                            {/* Items List */}
                            {items.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-semibold text-slate-700 mb-2">Item yang Dihutang:</p>
                                <div className="space-y-1">
                                  {items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm bg-white rounded-lg p-2">
                                      <span className="text-slate-700">
                                        {item.product_name} <span className="text-slate-500">x{item.quantity}</span>
                                      </span>
                                      <span className="font-semibold text-slate-900">
                                        Rp {item.subtotal.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Amount Stats */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-white rounded-lg p-3 border border-slate-200">
                                <p className="text-xs text-slate-600 font-medium mb-1">Total Utang</p>
                                <p className="text-sm font-bold text-slate-900">Rp {debt.total_amount.toLocaleString('id-ID')}</p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                <p className="text-xs text-green-600 font-medium mb-1">Sudah Dibayar</p>
                                <p className="text-sm font-bold text-green-600">Rp {debt.paid_amount.toLocaleString('id-ID')}</p>
                              </div>
                              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                <p className="text-xs text-red-600 font-medium mb-1">Sisa Utang</p>
                                <p className="text-sm font-bold text-red-600">Rp {debt.remaining_amount.toLocaleString('id-ID')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredDebts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <DollarSign className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm text-slate-600">
              {search ? 'Tidak ada data utang ditemukan' : 'Tidak ada data utang'}
            </p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPaymentModal(null);
          }}
        >
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Bayar Utang</h2>
                  <p className="text-xs text-slate-600">{paymentModal.group.customer_name}</p>
                </div>
                <button
                  onClick={() => setPaymentModal(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Debt Info */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Semua Utang</span>
                  <span className="font-bold text-slate-900">
                    Rp {paymentModal.group.total_debt.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Sudah Dibayar</span>
                  <span className="font-bold text-green-600">
                    Rp {paymentModal.group.total_paid.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-900 font-semibold text-sm">Sisa Utang</span>
                  <span className="font-bold text-lg text-red-600">
                    Rp {paymentModal.group.total_remaining.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Payment Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-2">
                  Jumlah Pembayaran (Bebas bayar berapa saja)
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={paymentModal.amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setPaymentModal({ ...paymentModal, amount: val });
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
                {paymentModal.amount && (
                  <p className="text-xs text-slate-600 mt-1">
                    Rp {parseFloat(paymentModal.amount || '0').toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map(percent => {
                  const amount = Math.round((paymentModal.group.total_remaining * percent) / 100);
                  return (
                    <button
                      key={percent}
                      onClick={() => setPaymentModal({ ...paymentModal, amount: amount.toString() })}
                      className="py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-xs font-medium"
                    >
                      {percent}%
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPaymentModal(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
