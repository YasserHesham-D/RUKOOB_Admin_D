import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Moon,
  Sun,
  Radio,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface TopbarProps {
  collapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ collapsed }) => {
  const { user, logout, currentRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'SuperAdmin':
        return { label: 'مدير عام', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30' };
      case 'OpsAdmin':
        return { label: 'عمليات', bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30' };
      case 'SupportAgent':
        return { label: 'دعم فني', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' };
      default:
        return { label: 'مشرف', bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30' };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <header
      className={`fixed top-0 z-30 h-20 bg-white/95 dark:bg-rukoob-darker/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 transition-all duration-300 flex items-center justify-between px-6 shadow-sm dark:shadow-none ${
        collapsed ? 'right-20 left-0' : 'right-64 left-0'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث سريع في المنظومة..."
            className="w-full pr-10 pl-4 py-2 text-xs bg-slate-100 dark:bg-rukoob-dark/80 border border-slate-200 dark:border-rukoob-forest/40 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-gold transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>السيرفر متصل (https://rukoob-api.runasp.net)</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-rukoob-forest/30 border border-slate-200 dark:border-rukoob-forest/40 text-slate-700 dark:text-slate-300 hover:text-rukoob-gold hover:border-rukoob-gold/40 transition-colors flex items-center gap-1.5 text-xs font-bold"
          title={theme === 'dark' ? 'التحويل إلى الوضع النهاري' : 'التحويل إلى الوضع الليلي'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">نهاري</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">ليلي</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-xl bg-slate-100 dark:bg-rukoob-forest/30 border border-slate-200 dark:border-rukoob-forest/40 text-slate-700 dark:text-slate-300 hover:text-rukoob-gold hover:border-rukoob-gold/40 transition-colors relative"
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
          </button>
        </div>

        {/* User Info & Role Badge */}
        {user && (
          <div className="flex items-center gap-3 pr-2 border-r border-slate-200 dark:border-slate-800">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                {user.name}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-bold text-center mt-0.5 ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
            </div>

            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-rukoob-gold shadow-sm shrink-0"
            />

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">خروج</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
