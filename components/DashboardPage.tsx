'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Users, DollarSign, Package, AlertTriangle, CreditCard } from 'lucide-react';

interface DashboardStats {
  todaySales: number;
  monthSales: number;
  totalProducts: number;
  totalCustomers: number;
  totalDebts: number;
  lowStockCount: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  category: string;
}

interface RecentTransaction {
  id: number;
  total_amount: number;
  customer_id: number;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    monthSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalDebts: 0,
    lowStockCount: 0
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [productsRes, customersRes, transactionsRes, debtsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/customers'),
        fetch('/api/transactions'),
        fetch('/api/debts')
      ]);

      const products = await productsRes.json();
      const customers = await customersRes.json();
      const transactions = await transactionsRes.json();
      const debts = await debtsRes.json();

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Ensure transactions is an array
      const transactionsArray = Array.isArray(transactions) ? transactions : [];
      
      const todayTransactions = transactionsArray.filter((t: RecentTransaction) => {
        const txDate = new Date(t.created_at);
        txDate.setHours(0, 0, 0, 0);
        return txDate.getTime() === today.getTime();
      });

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthTransactions = transactions.filter((t: RecentTransaction) => {
        return new Date(t.created_at) >= monthStart;
      });

      const todaySales = todayTransactions.reduce((sum: number, t: RecentTransaction) => sum + (Number(t.total_amount) || 0), 0);
      const monthSales = monthTransactions.reduce((sum: number, t: RecentTransaction) => sum + (Number(t.total_amount) || 0), 0);
      
      const lowStock = products.filter((p: LowStockProduct) => p.stock < 10);
      
      const totalDebts = debts.reduce((sum: number, d: any) => sum + (Number(d.remaining_amount) || 0), 0);

      setStats({
        todaySales,
        monthSales,
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalDebts,
        lowStockCount: lowStock.length
      });

      setLowStockProducts(lowStock.slice(0, 5));
      setRecentTransactions(transactions.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string | undefined | null) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-600 mt-1">Ringkasan aktivitas toko Anda</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Today Sales */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign size={20} />
              </div>
              <TrendingUp size={18} className="opacity-60" />
            </div>
            <p className="text-xs opacity-90 mb-1">Penjualan Hari Ini</p>
            <p className="text-xl font-bold">{formatCurrency(stats.todaySales)}</p>
          </div>

          {/* Month Sales */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart size={20} className="text-green-600" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-1">Penjualan Bulan Ini</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.monthSales)}</p>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-1">Total Produk</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalProducts}</p>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-1">Total Pelanggan</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalCustomers}</p>
          </div>
        </div>

        {/* Second Row - Debts & Low Stock Alert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Total Debts */}
          <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <CreditCard size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Total Hutang</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(stats.totalDebts)}</p>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Stok Menipis</p>
                <p className="text-xl font-bold text-red-600">{stats.lowStockCount} Produk</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Low Stock Products */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600" />
                Produk Stok Menipis
              </h2>
            </div>
            <div className="p-4">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">Semua stok aman</p>
              ) : (
                <div className="space-y-2">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-600">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                          {product.stock} unit
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart size={18} className="text-indigo-600" />
                Transaksi Terbaru
              </h2>
            </div>
            <div className="p-4">
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">Belum ada transaksi</p>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <p className="font-semibold text-sm text-slate-900">#{transaction.id}</p>
                        <p className="text-xs text-slate-500">{formatDate(transaction.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{formatCurrency(transaction.total_amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
