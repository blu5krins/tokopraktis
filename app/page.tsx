'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Tag, Users, CreditCard, BarChart3, ChevronDown, Clock, Home as HomeIcon, Settings, LogOut, User, Boxes, Ruler } from 'lucide-react';
import DashboardPage from '@/components/DashboardPage';
import KasirPage from '@/components/KasirPage';
import ProductsPage from '@/components/ProductsPage';
import CategoriesPage from '@/components/CategoriesPage';
import CustomersPage from '@/components/CustomersPage';
import DebtsPage from '@/components/DebtsPage';
import ReportsPage from '@/components/ReportsPage';
import SettingsPage from '@/components/SettingsPage';
import StockManagementPage from '@/components/StockManagementPage';
import UnitsPage from '@/components/UnitsPage';
import LoginPage from '@/components/LoginPage';
import Swal from 'sweetalert2';

type Page = 'dashboard' | 'kasir' | 'produk' | 'kategori' | 'satuan' | 'pelanggan' | 'utang' | 'stok' | 'laporan' | 'pengaturan';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    // Check authentication
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);

    // Initialize database on first load
    fetch('/api/init').catch(console.error);

    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Listen for navigation events
    const handleNavigate = (e: any) => {
      if (e.detail) {
        setCurrentPage(e.detail);
      }
    };
    window.addEventListener('navigate-to-products', () => setCurrentPage('produk'));
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('navigate-to-products', handleNavigate);
    };
  }, []);

  // Auto logout on inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Reset activity timer on user interactions
    const resetTimer = () => {
      setLastActivity(Date.now());
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Check for inactivity every minute
    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      
      if (inactiveTime >= INACTIVITY_TIMEOUT) {
        // Auto logout
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setCurrentPage('dashboard');
        
        Swal.fire({
          icon: 'warning',
          title: 'Sesi Berakhir',
          text: 'Anda telah logout otomatis karena tidak ada aktivitas selama 15 menit.',
          confirmButtonColor: '#6366f1',
          confirmButtonText: 'OK'
        });
      }
    }, 60000); // Check every minute

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      clearInterval(checkInactivity);
    };
  }, [isAuthenticated, lastActivity]);

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: HomeIcon },
    { id: 'kasir' as Page, label: 'Kasir', icon: ShoppingCart },
    { id: 'produk' as Page, label: 'Produk', icon: Package },
    { id: 'kategori' as Page, label: 'Kategori', icon: Tag },
    { id: 'satuan' as Page, label: 'Satuan Unit', icon: Ruler },
    { id: 'pelanggan' as Page, label: 'Pelanggan', icon: Users },
    { id: 'utang' as Page, label: 'Utang', icon: CreditCard },
    { id: 'stok' as Page, label: 'Manajemen Stok', icon: Boxes },
    { id: 'laporan' as Page, label: 'Laporan', icon: BarChart3 },
    { id: 'pengaturan' as Page, label: 'Pengaturan', icon: Settings },
  ];

  const handleMenuClick = (id: Page) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
  };

  const handleLoginSuccess = () => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Apakah Anda yakin ingin keluar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setCurrentPage('dashboard');
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Logout',
          text: 'Sampai jumpa!',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'kasir': return <KasirPage />;
      case 'produk': return <ProductsPage />;
      case 'kategori': return <CategoriesPage />;
      case 'satuan': return <UnitsPage />;
      case 'pelanggan': return <CustomersPage />;
      case 'utang': return <DebtsPage />;
      case 'stok': return <StockManagementPage />;
      case 'laporan': return <ReportsPage />;
      case 'pengaturan': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200 shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <ShoppingCart className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">TokoPraktis</h1>
              <p className="text-xs text-slate-500">Point of Sale</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer - User Info & Clock */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          {/* User Info */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="text-white" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name || 'User'}</p>
                <p className="text-[10px] text-slate-500">{user?.role || 'kasir'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>

          {/* Clock */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
            <Clock size={14} />
            <span>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <div className="text-xs text-slate-400 text-center">
            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <ShoppingCart className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">TokoPraktis</h1>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="relative">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">
                {menuItems.find(item => item.id === currentPage)?.label}
              </span>
              <ChevronDown size={16} className={`transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {mobileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  {/* User Info - Mobile */}
                  <div className="px-4 py-3 border-b border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <User className="text-white" size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name}</p>
                        <p className="text-[10px] text-slate-500">{user?.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          currentPage === item.id
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={18} />
                        {item.label}
                      </button>
                    );
                  })}

                  {/* Logout Button - Mobile */}
                  <div className="border-t border-slate-200 mt-2 pt-2 px-4">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:mt-0 mt-16">
        {renderPage()}
      </main>
    </div>
  );
}
