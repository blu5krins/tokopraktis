'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, ShoppingBag, ChevronDown, ChevronUp, FileText, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Transaction {
  id: number;
  customer_name: string;
  total: number;
  payment: number;
  change: number;
  created_at: string;
  items: TransactionItem[];
  is_debt: boolean;
}

interface TransactionItem {
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'sales' | 'stock'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      // Ensure numeric values are properly converted
      const formattedData = data.map((t: any) => ({
        ...t,
        total: Number(t.total) || 0,
        payment: Number(t.payment) || 0,
        change: Number(t.change_amount) || 0,
        items: t.items || [],
        is_debt: t.is_debt || false
      }));
      setTransactions(formattedData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTransactions = transactions.filter(t => {
    if (!startDate || !endDate) return true;
    const transDate = new Date(t.created_at).toISOString().split('T')[0];
    return transDate >= startDate && transDate <= endDate;
  });

  // Separate cash and debt transactions
  const cashTransactions = filteredTransactions.filter(t => !t.is_debt);
  const debtTransactions = filteredTransactions.filter(t => t.is_debt);

  // Cash statistics
  const cashRevenue = cashTransactions.reduce((sum, t) => sum + t.payment, 0);
  const cashCount = cashTransactions.length;
  
  // Debt statistics
  const debtTotal = debtTransactions.reduce((sum, t) => sum + t.total, 0);
  const debtPaid = debtTransactions.reduce((sum, t) => sum + t.payment, 0);
  const debtRemaining = debtTotal - debtPaid;
  const debtCount = debtTransactions.length;

  const totalRevenue = cashRevenue + debtPaid;
  const totalTransactions = filteredTransactions.length;
  const totalItems = filteredTransactions.reduce((sum, t) => 
    sum + (Array.isArray(t.items) ? t.items.reduce((itemSum, item) => itemSum + item.quantity, 0) : 0), 0
  );

  const exportTransactionsToExcel = () => {
    if (filteredTransactions.length === 0) {
      alert('Tidak ada data transaksi untuk diekspor pada periode ini');
      return;
    }

    const data = filteredTransactions.map(t => ({
      'Tanggal': new Date(t.created_at).toLocaleString('id-ID'),
      'Pelanggan': t.customer_name,
      'Jenis': t.is_debt ? 'HUTANG' : 'TUNAI',
      'Total': t.total,
      'Pembayaran': t.payment,
      'Kembalian': t.change,
      'Jumlah Item': Array.isArray(t.items) ? t.items.length : 0
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
    XLSX.writeFile(wb, `Laporan-Transaksi-${startDate}-${endDate}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">Laporan</h1>
          <p className="text-xs text-slate-600 mt-1">Pantau performa bisnis Anda</p>
        </div>

        {/* Filters & Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 text-sm font-semibold transition-colors relative ${
                activeTab === 'transactions'
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transaksi / Uang
              {activeTab === 'transactions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 text-sm font-semibold transition-colors relative ${
                activeTab === 'sales'
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Penjualan Barang
              {activeTab === 'sales' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2 text-sm font-semibold transition-colors relative ${
                activeTab === 'stock'
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pembelian Stok
              {activeTab === 'stock' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
              )}
            </button>
          </div>

          {/* Date Filter */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-2">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-2">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadTransactions}
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content: Transactions */}
        {activeTab === 'transactions' && (
          <>
            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={exportTransactionsToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FileDown size={18} />
                Export ke Excel
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Pendapatan Tunai</p>
                <p className="text-xl font-bold text-green-600">Rp {cashRevenue.toLocaleString('id-ID')}</p>
                <p className="text-xs text-slate-500 mt-1">{cashCount} transaksi</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Pendapatan Hutang</p>
                <p className="text-xl font-bold text-amber-600">Rp {debtPaid.toLocaleString('id-ID')}</p>
                <p className="text-xs text-slate-500 mt-1">{debtCount} transaksi</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Sisa Hutang</p>
                <p className="text-xl font-bold text-red-600">Rp {debtRemaining.toLocaleString('id-ID')}</p>
                <p className="text-xs text-slate-500 mt-1">Belum dibayar</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Total Real Pendapatan</p>
                <p className="text-xl font-bold text-blue-600">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                <p className="text-xs text-slate-500 mt-1">{totalTransactions} transaksi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="bg-white rounded-xl overflow-hidden border border-slate-200">
              <button
                onClick={() => setExpandedId(expandedId === transaction.id ? null : transaction.id)}
                className="w-full p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {transaction.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-slate-900">{transaction.customer_name}</h3>
                        {transaction.is_debt ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                            HUTANG
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            TUNAI
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar size={12} />
                        <span>{new Date(transaction.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        Rp {transaction.total.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-slate-600">
                        {transaction.items.length} produk
                      </p>
                    </div>
                    {expandedId === transaction.id ? (
                      <ChevronUp className="text-slate-400" size={20} />
                    ) : (
                      <ChevronDown className="text-slate-400" size={20} />
                    )}
                  </div>
                </div>
              </button>

              {expandedId === transaction.id && (
                <div className="bg-slate-50 p-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Detail Pembelian
                  </h4>
                  
                  <div className="space-y-2 mb-4">
                    {transaction.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            {item.product_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900">{item.product_name}</p>
                            <p className="text-xs text-slate-600">
                              {item.quantity} x Rp {Number(item.price).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-sm text-slate-900">
                          Rp {Number(item.subtotal).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-2 border border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-bold text-slate-900">Rp {transaction.total.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Pembayaran</span>
                      <span className="font-bold text-slate-900">Rp {transaction.payment.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-900 font-semibold text-sm">Kembalian</span>
                      <span className="font-bold text-lg text-green-600">
                        Rp {transaction.change.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <FileText className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm text-slate-600">Tidak ada transaksi pada periode ini</p>
          </div>
        )}
          </>
        )}

        {/* Tab Content: Sales Report */}
        {activeTab === 'sales' && (
          <SalesReport startDate={startDate} endDate={endDate} />
        )}

        {/* Tab Content: Stock Purchase Report */}
        {activeTab === 'stock' && (
          <StockReport startDate={startDate} endDate={endDate} />
        )}
      </div>
    </div>
  );
}

// Sales Report Component
function SalesReport({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  useEffect(() => {
    loadSalesData();
  }, [startDate, endDate]);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      const transactions = await res.json();
      
      // Aggregate sales by product with transaction details
      const productSales: Record<string, { 
        name: string; 
        quantity: number; 
        total: number; 
        count: number;
        transactions: Array<{ date: string; qty: number; customer: string; amount: number }>;
      }> = {};
      
      transactions.forEach((t: any) => {
        const transDate = new Date(t.created_at).toISOString().split('T')[0];
        if ((!startDate || transDate >= startDate) && (!endDate || transDate <= endDate)) {
          (t.items || []).forEach((item: any) => {
            if (!productSales[item.product_name]) {
              productSales[item.product_name] = {
                name: item.product_name,
                quantity: 0,
                total: 0,
                count: 0,
                transactions: []
              };
            }
            productSales[item.product_name].quantity += Number(item.quantity);
            productSales[item.product_name].total += Number(item.subtotal);
            productSales[item.product_name].count += 1;
            productSales[item.product_name].transactions.push({
              date: t.created_at,
              qty: Number(item.quantity),
              customer: t.customer_name,
              amount: Number(item.subtotal)
            });
          });
        }
      });

      const salesArray = Object.values(productSales).sort((a, b) => b.total - a.total);
      setSalesData(salesArray);
      setLoading(false);
    } catch (error) {
      console.error('Error loading sales data:', error);
      setLoading(false);
    }
  };

  const totalRevenue = salesData.reduce((sum, item) => sum + item.total, 0);
  const totalQuantity = salesData.reduce((sum, item) => sum + item.quantity, 0);

  const exportSalesToExcel = () => {
    if (salesData.length === 0) {
      alert('Tidak ada data penjualan untuk diekspor pada periode ini');
      return;
    }

    // Sheet 1: Summary per produk
    const summaryData = salesData.map(item => ({
      'Produk': item.name,
      'Qty Terjual': item.quantity,
      'Jumlah Transaksi': item.count,
      'Total Penjualan': item.total
    }));

    // Sheet 2: Detail transaksi dengan tanggal
    const detailData: any[] = [];
    salesData.forEach(item => {
      item.transactions.forEach((trans: any) => {
        detailData.push({
          'Produk': item.name,
          'Tanggal': new Date(trans.date).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          'Pelanggan': trans.customer,
          'Qty': trans.qty,
          'Subtotal': trans.amount
        });
      });
    });

    // Create workbook with two sheets
    const wb = XLSX.utils.book_new();
    
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');
    
    const wsDetail = XLSX.utils.json_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Transaksi');
    
    XLSX.writeFile(wb, `Laporan-Penjualan-Barang-${startDate}-${endDate}.xlsx`);
  };

  return (
    <>
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportSalesToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FileDown size={18} />
          Export ke Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium mb-1">Total Produk Terjual</p>
              <p className="text-xl font-bold text-blue-600">{salesData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium mb-1">Total Unit Terjual</p>
              <p className="text-xl font-bold text-purple-600">{totalQuantity}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium mb-1">Total Penjualan</p>
              <p className="text-xl font-bold text-green-600">Rp {totalRevenue.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="space-y-2">
        {salesData.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl overflow-hidden border border-slate-200">
            <button
              onClick={() => setExpandedProduct(expandedProduct === item.name ? null : item.name)}
              className="w-full p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {item.quantity} unit • {item.count} transaksi
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      Rp {item.total.toLocaleString('id-ID')}
                    </p>
                  </div>
                  {expandedProduct === item.name ? (
                    <ChevronUp className="text-slate-400" size={20} />
                  ) : (
                    <ChevronDown className="text-slate-400" size={20} />
                  )}
                </div>
              </div>
            </button>

            {/* Expanded: Transaction Dates Details */}
            {expandedProduct === item.name && (
              <div className="border-t border-slate-200 bg-slate-50 p-4">
                <h4 className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                  Detail Tanggal Terjual
                </h4>
                <div className="space-y-2">
                  {item.transactions.map((trans: any, tIdx: number) => (
                    <div key={tIdx} className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={14} className="text-indigo-600" />
                            <span className="text-sm font-semibold text-slate-900">
                              {new Date(trans.date).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 ml-5">
                            Pelanggan: {trans.customer} • Qty: {trans.qty} unit
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">
                            Rp {trans.amount.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {salesData.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <ShoppingBag className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm text-slate-600">Tidak ada data penjualan pada periode ini</p>
          </div>
        )}
      </div>
    </>
  );
}

// Stock Report Component
function StockReport({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [stockData, setStockData] = useState<any[]>([]);

  useEffect(() => {
    loadStockData();
  }, [startDate, endDate]);

  const loadStockData = async () => {
    try {
      const res = await fetch('/api/stock-purchases');
      const purchases = await res.json();
      
      // Filter by date
      const filtered = purchases.filter((p: any) => {
        const purchaseDate = new Date(p.purchase_date).toISOString().split('T')[0];
        return (!startDate || purchaseDate >= startDate) && (!endDate || purchaseDate <= endDate);
      });
      
      setStockData(filtered);
    } catch (error) {
      console.error('Error loading stock data:', error);
    }
  };

  const exportStockToExcel = () => {
    if (stockData.length === 0) {
      alert('Tidak ada data pembelian stok untuk diekspor pada periode ini');
      return;
    }

    const data = stockData.map(purchase => ({
      'Tanggal': new Date(purchase.purchase_date).toLocaleDateString('id-ID'),
      'Produk': purchase.product_name,
      'Kategori': purchase.category_name || '-',
      'Supplier': purchase.supplier_name,
      'Qty': purchase.quantity,
      'Harga Beli': purchase.purchase_price,
      'Total Biaya': purchase.total_cost,
      'Catatan': purchase.notes || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pembelian Stok');
    XLSX.writeFile(wb, `Laporan-Pembelian-Stok-${startDate}-${endDate}.xlsx`);
  };

  const totalPurchases = stockData.length;
  const totalQuantity = stockData.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalCost = stockData.reduce((sum, p) => sum + (p.total_cost || 0), 0);

  return (
    <>
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportStockToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FileDown size={18} />
          Export ke Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium mb-1">Total Pembelian</p>
              <p className="text-xl font-bold text-blue-600">{totalPurchases}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium mb-1">Total Unit Dibeli</p>
              <p className="text-xl font-bold text-purple-600">{totalQuantity}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium mb-1">Total Biaya</p>
              <p className="text-xl font-bold text-green-600">Rp {totalCost.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Table */}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stockData.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-900">
                      {new Date(purchase.purchase_date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        {purchase.product_name ? purchase.product_name.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{purchase.product_name || 'Produk Tidak Ditemukan'}</p>
                        {purchase.category_name && (
                          <p className="text-xs text-slate-500">{purchase.category_name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{purchase.supplier_name}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-slate-900">{purchase.quantity}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-slate-600">Rp {Number(purchase.purchase_price).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-green-600">Rp {Number(purchase.total_cost).toLocaleString('id-ID')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {stockData.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm text-slate-600">Tidak ada pembelian stok pada periode ini</p>
          </div>
        )}
      </div>
    </>
  );
}
