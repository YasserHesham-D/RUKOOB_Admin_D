import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Car,
  Users,
  Route,
  Headphones,
  BellRing,
  Settings,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  LogOut
} from 'lucide-react';
import { RukoobLogo } from '../../assets/logo';
import { useAuth } from '../../context/AuthContext';
import { Permission } from '../../types';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { user, logout, hasPermission, currentRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navigationItems: {
    to: string;
    label: string;
    icon: any;
    badge: string | null;
    badgeColor?: string;
    permission: Permission;
  }[] = [
    { to: '/', label: 'لوحة التحكم', icon: LayoutDashboard, badge: null, permission: 'view_dashboard' },
    { to: '/verification', label: 'توثيق الكباتن', icon: UserCheck, badge: null, permission: 'verify_drivers' },
    { to: '/drivers', label: 'إدارة الكباتن', icon: Car, badge: null, permission: 'manage_drivers' },
    { to: '/riders', label: 'الركاب والعملاء', icon: Users, badge: null, permission: 'manage_riders' },
    { to: '/trips', label: 'الرحلات والمراقبة', icon: Route, badge: 'مباشر', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30', permission: 'view_trips' },
    { to: '/support', label: 'الدعم الفني', icon: Headphones, badge: null, permission: 'manage_support' },
    { to: '/broadcast', label: 'إشعارات جماعية', icon: BellRing, badge: null, permission: 'send_broadcast' },
    { to: '/settings', label: 'التسعير والإعدادات', icon: Settings, badge: null, permission: 'manage_settings' },
    { to: '/admins', label: 'المشرفين والأمان', icon: ShieldCheck, badge: null, permission: 'manage_admins' },
  ];

  const visibleItems = navigationItems.filter(item => hasPermission(item.permission));

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'SuperAdmin':
        return 'مدير عام المنظومة';
      case 'OpsAdmin':
        return 'مسؤول عمليات';
      case 'SupportAgent':
        return 'أخصائي دعم فني';
      default:
        return 'مشرف نظام';
    }
  };

  return (
    <aside
      className={`fixed top-0 bottom-0 z-40 bg-white/95 dark:bg-rukoob-darker/95 backdrop-blur-xl border-slate-200 dark:border-slate-800/80 transition-all duration-300 flex flex-col right-0 border-l shadow-sm dark:shadow-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200 dark:border-rukoob-forest/30">
        <div className="flex items-center gap-3 overflow-hidden">
          <RukoobLogo size={collapsed ? 'sm' : 'md'} showText={!collapsed} />
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-rukoob-forest/40 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark shadow-md font-bold'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-rukoob-forest/20'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!collapsed && (
                <span className="flex-1 truncate text-right font-cairo">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-rukoob-forest/30 bg-slate-50/50 dark:bg-rukoob-forest/10 space-y-2">
        {!collapsed && user && (
          <div className="px-2 py-2 flex items-center gap-3 rounded-xl bg-white dark:bg-rukoob-forest/30 border border-slate-200 dark:border-rukoob-gold/10 shadow-sm">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-rukoob-gold/40 shrink-0"
            />
            <div className="flex-1 min-w-0 text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[11px] text-rukoob-forest-light dark:text-rukoob-gold truncate font-semibold">
                {getRoleLabel()}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full p-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center gap-2 transition-colors ${collapsed ? 'px-0' : ''}`}
          title="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};
