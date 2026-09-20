const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\yasser hesham\\Desktop\\Rukoob\\RUKOOBAPP\\RUKOOB_Admin_Dashboard';
const srcDir = path.join(targetDir, 'src');

// 1. ThemeContext.tsx
fs.writeFileSync(path.join(srcDir, 'context', 'ThemeContext.tsx'), `
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('rukoob_admin_theme') as Theme) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('rukoob_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
`);

// 2. LanguageContext.tsx
fs.writeFileSync(path.join(srcDir, 'context', 'LanguageContext.tsx'), `
import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
  isArabic: boolean;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    verification: 'توثيق السائقين',
    drivers: 'الكباتن والأسطول',
    riders: 'الركاب',
    trips: 'المشاوير والرحلات',
    support: 'تذاكر الدعم',
    broadcast: 'الإشعارات الجماعية',
    settings: 'إعدادات المنصة والتسعير',
    adminManagement: 'إدارة المسؤولين',
    logout: 'تسجيل الخروج',
    
    // Topbar & Global
    searchPlaceholder: 'بحث عام (اسم، هاتف، رقم رحلة، لوحة سيارة)...',
    notifications: 'الإشعارات',
    adminProfile: 'الملف الإداري',
    superAdmin: 'مدير عام',
    opsAdmin: 'مدير العمليات',
    supportAgent: 'وكيل الدعم',
    egp: 'ج.م',
    km: 'كم',
    min: 'دقيقة',
    save: 'حفظ التعديلات',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    approve: 'موافقة واعتماد',
    reject: 'رفض الطلب',
    suspend: 'إيقاف الحساب',
    activate: 'تفعيل الحساب',
    viewDetails: 'عرض التفاصيل',
    actions: 'الإجراءات',
    status: 'الحالة',
    date: 'التاريخ',
    all: 'الكل',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    verification: 'Driver Verification',
    drivers: 'Drivers & Fleet',
    riders: 'Riders',
    trips: 'Trips & Rides',
    support: 'Support Tickets',
    broadcast: 'Broadcast Push',
    settings: 'Platform & Pricing Settings',
    adminManagement: 'Admin Management',
    logout: 'Logout',
    
    // Topbar & Global
    searchPlaceholder: 'Search anything (name, phone, trip ID, plate)...',
    notifications: 'Notifications',
    adminProfile: 'Admin Profile',
    superAdmin: 'Super Admin',
    opsAdmin: 'Operations Admin',
    supportAgent: 'Support Agent',
    egp: 'EGP',
    km: 'km',
    min: 'min',
    save: 'Save Changes',
    cancel: 'Cancel',
    confirm: 'Confirm',
    approve: 'Approve',
    reject: 'Reject',
    suspend: 'Suspend',
    activate: 'Activate',
    viewDetails: 'View Details',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    all: 'All',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('rukoob_admin_lang') as Language) || 'ar';
  });

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('rukoob_admin_lang', lang);
  }, [lang]);

  const toggleLanguage = () => setLang(prev => prev === 'ar' ? 'en' : 'ar');
  const t = (key: string, defaultText?: string) => translations[lang][key] || defaultText || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, isArabic: lang === 'ar', t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
`);

// 3. AuthContext.tsx
fs.writeFileSync(path.join(srcDir, 'context', 'AuthContext.tsx'), `
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (role?: AdminRole, email?: string) => void;
  logout: () => void;
  switchRole: (role: AdminRole) => void;
}

const defaultAdminUser: AdminUser = {
  id: 'adm-01',
  fullName: 'ياسر هشام (الإدارة العامة)',
  email: 'admin@rukoob.com',
  role: 'SuperAdmin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
  lastLogin: '2026-09-16 15:00',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('rukoob_admin_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return defaultAdminUser;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('rukoob_admin_user', JSON.stringify(user));
      localStorage.setItem('rukoob_admin_token', 'mock_admin_jwt_token_aswan');
    } else {
      localStorage.removeItem('rukoob_admin_user');
      localStorage.removeItem('rukoob_admin_token');
    }
  }, [user]);

  const login = (role: AdminRole = 'SuperAdmin', email = 'admin@rukoob.com') => {
    const roleNames: Record<AdminRole, string> = {
      SuperAdmin: 'ياسر هشام (Super Admin)',
      OpsAdmin: 'أحمد علي (Operations Admin)',
      SupportAgent: 'مروة عبد الله (Support Agent)',
    };
    setUser({
      ...defaultAdminUser,
      fullName: roleNames[role],
      email,
      role,
    });
  };

  const logout = () => setUser(null);

  const switchRole = (role: AdminRole) => {
    if (user) {
      const roleNames: Record<AdminRole, string> = {
        SuperAdmin: 'ياسر هشام (Super Admin)',
        OpsAdmin: 'أحمد علي (Operations Admin)',
        SupportAgent: 'مروة عبد الله (Support Agent)',
      };
      setUser({
        ...user,
        role,
        fullName: roleNames[role],
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
`);

// 4. NotificationContext.tsx
fs.writeFileSync(path.join(srcDir, 'context', 'NotificationContext.tsx'), `
import React, { createContext, useContext, useState } from 'react';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface NotificationContextType {
  toasts: ToastNotification[];
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = \`toast-\${Date.now()}\`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={\`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 min-w-[300px] max-w-md \${
              t.type === 'success' ? 'bg-[#132A20]/95 border-[#10B981]/50 text-white' :
              t.type === 'error' ? 'bg-[#3A1412]/95 border-[#EF4444]/50 text-white' :
              t.type === 'warning' ? 'bg-[#3A2D12]/95 border-[#E8B923]/50 text-white' :
              'bg-[#12201B]/95 border-[#C5A880]/50 text-white'
            }\`}
          >
            <div className="flex-1">
              <h4 className="font-bold text-sm font-cairo">{t.title}</h4>
              <p className="text-xs text-gray-300 font-cairo mt-0.5">{t.message}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-white">✕</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
`);

console.log('Step 4 complete: Contexts created.');
