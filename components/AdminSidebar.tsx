'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  TreePine,
  Table,
  Activity,
  QrCode,
  Heart,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  Cloud,
  Bell,
  FileText,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Upload,
  Map,
  Database,
  Users,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
  color: string;
}

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount?: number;
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  alertCount = 0,
}: AdminSidebarProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const mainMenuItems: NavItem[] = [
    { id: 'trees', label: 'Dashboard', icon: LayoutDashboard, color: 'blue' },
    { id: 'table', label: 'Tree List', icon: TreePine, color: 'green' },
    { id: 'health', label: 'Tree Health', icon: Heart, color: 'red' },
  ];

  const analyticsItems: NavItem[] = [
    { id: 'dashboard-analytics', label: 'Analytics Dashboard', icon: TrendingUp, color: 'indigo' },
    { id: 'harvest', label: 'Harvest Calendar', icon: Calendar, color: 'orange' },
    { id: 'profits', label: 'Costs & Profits', icon: DollarSign, color: 'purple' },
    { id: 'analytics', label: 'Yield Analytics', icon: TrendingUp, color: 'green' },
  ];

  const operationsItems: NavItem[] = [
    { id: 'inventory', label: 'Inventory', icon: Package, color: 'amber' },
    { id: 'tasks', label: 'Task Scheduler', icon: Clock, color: 'cyan' },
    { id: 'weather', label: 'Weather', icon: Cloud, color: 'sky' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertCount, color: 'rose' },
  ];

  const ecommerceItems: NavItem[] = [
    { id: 'products', label: 'Products', icon: ShoppingBag, color: 'emerald' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, color: 'blue' },
  ];

  const toolsItems: NavItem[] = [
    { id: 'reports', label: 'Reports', icon: FileText, color: 'violet' },
    { id: 'qrcodes', label: 'QR Codes', icon: QrCode, color: 'teal' },
    { id: 'activities', label: 'Activities', icon: Activity, color: 'gray' },
    { id: 'activitylog', label: 'Activity Log', icon: FileText, color: 'slate' },
    { id: 'users', label: 'User Management', icon: Users, color: 'purple' },
    { id: 'backup', label: 'Backup & Export', icon: Database, color: 'blue' },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors: Record<string, { hover: string; activeBg: string; activeText: string }> = {
      blue: { hover: 'hover:bg-blue-50 text-blue-600', activeBg: 'bg-gradient-to-r from-blue-600 to-blue-700', activeText: 'text-white' },
      green: { hover: 'hover:bg-green-50 text-green-600', activeBg: 'bg-gradient-to-r from-green-600 to-emerald-600', activeText: 'text-white' },
      emerald: { hover: 'hover:bg-emerald-50 text-emerald-600', activeBg: 'bg-gradient-to-r from-emerald-600 to-green-600', activeText: 'text-white' },
      red: { hover: 'hover:bg-red-50 text-red-600', activeBg: 'bg-gradient-to-r from-red-600 to-rose-600', activeText: 'text-white' },
      orange: { hover: 'hover:bg-orange-50 text-orange-600', activeBg: 'bg-gradient-to-r from-orange-600 to-amber-600', activeText: 'text-white' },
      purple: { hover: 'hover:bg-purple-50 text-purple-600', activeBg: 'bg-gradient-to-r from-purple-600 to-violet-600', activeText: 'text-white' },
      indigo: { hover: 'hover:bg-indigo-50 text-indigo-600', activeBg: 'bg-gradient-to-r from-indigo-600 to-purple-600', activeText: 'text-white' },
      amber: { hover: 'hover:bg-amber-50 text-amber-600', activeBg: 'bg-gradient-to-r from-amber-600 to-orange-600', activeText: 'text-white' },
      cyan: { hover: 'hover:bg-cyan-50 text-cyan-600', activeBg: 'bg-gradient-to-r from-cyan-600 to-teal-600', activeText: 'text-white' },
      sky: { hover: 'hover:bg-sky-50 text-sky-600', activeBg: 'bg-gradient-to-r from-sky-600 to-blue-600', activeText: 'text-white' },
      rose: { hover: 'hover:bg-rose-50 text-rose-600', activeBg: 'bg-gradient-to-r from-rose-600 to-pink-600', activeText: 'text-white' },
      violet: { hover: 'hover:bg-violet-50 text-violet-600', activeBg: 'bg-gradient-to-r from-violet-600 to-purple-600', activeText: 'text-white' },
      teal: { hover: 'hover:bg-teal-50 text-teal-600', activeBg: 'bg-gradient-to-r from-teal-600 to-cyan-600', activeText: 'text-white' },
      gray: { hover: 'hover:bg-gray-50 text-gray-600', activeBg: 'bg-gradient-to-r from-gray-600 to-gray-700', activeText: 'text-white' },
      slate: { hover: 'hover:bg-slate-50 text-slate-600', activeBg: 'bg-gradient-to-r from-slate-600 to-gray-700', activeText: 'text-white' },
    };

    const colorSet = colors[color] || colors.blue;

    if (isActive) {
      return `${colorSet.activeBg} ${colorSet.activeText} shadow-lg`;
    }
    return colorSet.hover;
  };

  const NavButton = ({ item }: { item: NavItem }) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;

    return (
      <button
        onClick={() => {
          onTabChange(item.id);
          setIsMobileOpen(false);
        }}
        className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${getColorClasses(
          item.color,
          isActive
        )}`}
      >
        <Icon size={20} className="flex-shrink-0" />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left text-sm">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
        {isCollapsed && item.badge !== undefined && item.badge > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
        )}
      </button>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="h-20 border-b border-gray-200 flex items-center justify-between px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-lime-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🌳
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Durian Farm</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-lime-600 rounded-xl flex items-center justify-center text-2xl mx-auto shadow-lg">
            🌳
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main Menu */}
        <div className="mb-4">
          {!isCollapsed && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">
              Main
            </p>
          )}
          <div className="space-y-1">
            {mainMenuItems.map((item) => (
              <NavButton key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Analytics */}
        <div className="mb-4">
          {!isCollapsed && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">
              Analytics
            </p>
          )}
          <div className="space-y-1">
            {analyticsItems.map((item) => (
              <NavButton key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Operations */}
        <div className="mb-4">
          {!isCollapsed && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">
              Operations
            </p>
          )}
          <div className="space-y-1">
            {operationsItems.map((item) => (
              <NavButton key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* E-Commerce */}
        <div className="mb-4">
          {!isCollapsed && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">
              E-Commerce
            </p>
          )}
          <div className="space-y-1">
            {ecommerceItems.map((item) => (
              <NavButton key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="mb-4">
          {!isCollapsed && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">
              Tools
            </p>
          )}
          <div className="space-y-1">
            {toolsItems.map((item) => (
              <NavButton key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">
              Quick Actions
            </p>
            <div className="space-y-1">
              <Link
                href="/admin/bulk-import"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-cyan-50 text-cyan-600 transition-all font-medium text-sm"
                onClick={() => setIsMobileOpen(false)}
              >
                <Upload size={20} />
                <span>Bulk Import</span>
              </Link>
              <Link
                href="/farm-transparency"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal-50 text-teal-600 transition-all font-medium text-sm"
                onClick={() => setIsMobileOpen(false)}
              >
                <Map size={20} />
                <span>Public Map</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 space-y-1">
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-blue-600 transition-all font-medium"
          onClick={() => setIsMobileOpen(false)}
        >
          <Home size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Website</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-all font-medium"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-xl z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-white border-r border-gray-200 w-72 shadow-2xl transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Spacer for main content on desktop */}
      <div className={`hidden lg:block ${isCollapsed ? 'w-20' : 'w-72'} flex-shrink-0 transition-all duration-300`} />
    </>
  );
}
