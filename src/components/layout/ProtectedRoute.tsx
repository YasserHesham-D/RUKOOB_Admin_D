import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Permission } from '../../types';

interface ProtectedRouteProps {
  requiredPermission?: Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermission }) => {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-rose-400">غير مصرح لك بالوصول</h2>
        <p className="text-sm text-slate-400 mt-2">
          لا تملك الصلاحيات الكافية لعرض هذه الصفحة.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
