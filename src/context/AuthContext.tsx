import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { AdminUser, Role, Permission } from '../types';
import { BASE_API_URL, setStoredToken } from '../api/apiClient';

interface AuthContextType {
  user: AdminUser | null;
  currentRole: Role;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string, requestedRole?: Role) => Promise<string>;
  logout: () => void;
  switchRole: (role: Role) => void;
  hasPermission: (permission: Permission) => boolean;
  getDefaultRoute: () => string;
}

export const rolePermissions: Record<Role, Permission[]> = {
  SuperAdmin: [
    'view_dashboard',
    'verify_drivers',
    'manage_drivers',
    'manage_riders',
    'view_trips',
    'manage_support',
    'send_broadcast',
    'manage_settings',
    'manage_admins',
  ],
  OpsAdmin: [
    'verify_drivers',
    'manage_drivers',
    'manage_riders',
    'view_trips',
  ],
  SupportAgent: [
    'manage_support',
  ],
};

export const roleDefaultRoutes: Record<Role, string> = {
  SuperAdmin: '/',
  OpsAdmin: '/verification',
  SupportAgent: '/support',
};

const getDefaultName = (role: Role): string => {
  switch (role) {
    case 'SuperAdmin':
      return 'ياسر هشام (مدير عام)';
    case 'OpsAdmin':
      return 'محمود أحمد (مسؤول عمليات)';
    case 'SupportAgent':
      return 'سارة علي (أخصائي دعم فني)';
    default:
      return 'مستخدم النظام';
  }
};

const getDefaultEmail = (role: Role): string => {
  switch (role) {
    case 'SuperAdmin':
      return 'superadmin@rukoob.com';
    case 'OpsAdmin':
      return 'ops@rukoob.com';
    case 'SupportAgent':
      return 'support@rukoob.com';
    default:
      return 'admin@rukoob.com';
  }
};

const getDefaultAvatar = (role: Role): string => {
  switch (role) {
    case 'SuperAdmin':
      return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
    case 'OpsAdmin':
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100';
    case 'SupportAgent':
      return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100';
    default:
      return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('rukoob_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState<Role>(() => {
    try {
      const saved = localStorage.getItem('rukoob_admin_user');
      return saved ? JSON.parse(saved).role : 'SuperAdmin';
    } catch {
      return 'SuperAdmin';
    }
  });

  const login = async (identifier: string, pass: string, requestedRole?: Role): Promise<string> => {
    if (!identifier.trim() || !pass.trim()) {
      throw new Error('يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور');
    }

    try {
      const res = await axios.post(`${BASE_API_URL}/api/auth/login`, {
        phoneNumber: identifier.trim(),
        password: pass.trim(),
      });

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        const token = data.accessToken;
        const roles: string[] = data.roles || [];

        let resolvedRole: Role = requestedRole || 'SuperAdmin';
        if (roles.includes('SuperAdmin') || roles.includes('Admin')) {
          resolvedRole = 'SuperAdmin';
        } else if (roles.includes('Operations') || roles.includes('OpsAdmin') || roles.includes('Ops')) {
          resolvedRole = 'OpsAdmin';
        } else if (roles.includes('Support') || roles.includes('SupportAgent')) {
          resolvedRole = 'SupportAgent';
        }

        const loggedInUser: AdminUser = {
          id: data.userId || `admin-${Date.now()}`,
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || getDefaultName(resolvedRole),
          email: data.email || (identifier.includes('@') ? identifier : getDefaultEmail(resolvedRole)),
          role: resolvedRole,
          avatar: data.profileImageUrl || getDefaultAvatar(resolvedRole),
        };

        setStoredToken(token);
        setUser(loggedInUser);
        setCurrentRole(resolvedRole);
        localStorage.setItem('rukoob_admin_user', JSON.stringify(loggedInUser));

        return roleDefaultRoutes[resolvedRole] || '/';
      } else {
        throw new Error(res.data?.message || 'بيانات الاعتماد غير صحيحة. يرجى التحقق من البريد وكلمة المرور.');
      }
    } catch (err: any) {
      console.error('Login attempt failed:', err);
      // Strictly reject invalid credentials! Do NOT navigate to next page!
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        err.message ||
        'بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setStoredToken(null);
    localStorage.removeItem('rukoob_admin_user');
  };

  const switchRole = (role: Role) => {
    setCurrentRole(role);
    if (user) {
      const updated = { ...user, role, name: getDefaultName(role), email: getDefaultEmail(role), avatar: getDefaultAvatar(role) };
      setUser(updated);
      localStorage.setItem('rukoob_admin_user', JSON.stringify(updated));
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    const perms = rolePermissions[currentRole] || [];
    return perms.includes(permission);
  };

  const getDefaultRoute = () => {
    return roleDefaultRoutes[currentRole] || '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        hasPermission,
        getDefaultRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
