import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Verification } from './pages/Verification';
import { Drivers } from './pages/Drivers';
import { Riders } from './pages/Riders';
import { Trips } from './pages/Trips';
import { Support } from './pages/Support';
import { Broadcast } from './pages/Broadcast';
import { Settings } from './pages/Settings';
import { AdminManagement } from './pages/AdminManagement';

// Dynamic Landing Redirect
const LandingRedirect: React.FC = () => {
  const { currentRole, getDefaultRoute } = useAuth();
  if (currentRole === 'SuperAdmin') {
    return <Overview />;
  }
  return <Navigate to={getDefaultRoute()} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* Root Landing Route */}
            <Route path="/" element={<LandingRedirect />} />

            {/* Verification Route (SuperAdmin & OpsAdmin) */}
            <Route element={<ProtectedRoute requiredPermission="verify_drivers" />}>
              <Route path="/verification" element={<Verification />} />
            </Route>

            {/* Drivers Route (SuperAdmin & OpsAdmin) */}
            <Route element={<ProtectedRoute requiredPermission="manage_drivers" />}>
              <Route path="/drivers" element={<Drivers />} />
            </Route>

            {/* Riders Route (SuperAdmin & OpsAdmin) */}
            <Route element={<ProtectedRoute requiredPermission="manage_riders" />}>
              <Route path="/riders" element={<Riders />} />
            </Route>

            {/* Trips Route (SuperAdmin & OpsAdmin) */}
            <Route element={<ProtectedRoute requiredPermission="view_trips" />}>
              <Route path="/trips" element={<Trips />} />
            </Route>

            {/* Support Route (SuperAdmin & SupportAgent) */}
            <Route element={<ProtectedRoute requiredPermission="manage_support" />}>
              <Route path="/support" element={<Support />} />
            </Route>

            {/* Broadcast Route (SuperAdmin only) */}
            <Route element={<ProtectedRoute requiredPermission="send_broadcast" />}>
              <Route path="/broadcast" element={<Broadcast />} />
            </Route>

            {/* Settings Route (SuperAdmin only) */}
            <Route element={<ProtectedRoute requiredPermission="manage_settings" />}>
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Admin Management Route (SuperAdmin only) */}
            <Route element={<ProtectedRoute requiredPermission="manage_admins" />}>
              <Route path="/admins" element={<AdminManagement />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
