import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../common/ToastContainer';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F6F5] dark:bg-[#080C0A] text-slate-800 dark:text-slate-100 font-cairo flex flex-col transition-colors duration-200" dir="rtl">
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <Topbar collapsed={collapsed} />

      <main
        className={`flex-1 pt-24 pb-12 px-6 lg:px-8 transition-all duration-300 ${
          collapsed ? 'mr-20' : 'mr-64'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  );
};
