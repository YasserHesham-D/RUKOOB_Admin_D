import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  UserPlus,
  Shield,
  Key,
  CheckCircle,
  Mail,
  Phone
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';

export const AdminManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const admins = [
    {
      id: '1',
      name: 'Admin Rukoob (مدير عام المنظومة)',
      phone: '+201000000001',
      email: 'admin@rukoob.com',
      role: 'SuperAdmin',
      roleLabel: 'مدير عام',
      status: 'نشط ومتصل',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    },
    {
      id: '2',
      name: 'مسؤول العمليات (Operations)',
      phone: '+201000000002',
      email: 'ops@rukoob.com',
      role: 'Operations',
      roleLabel: 'مسؤول عمليات',
      status: 'نشط',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    {
      id: '3',
      name: 'مشرف الدعم الفني (Support Lead)',
      phone: '+201000000003',
      email: 'support@rukoob.com',
      role: 'Support',
      roleLabel: 'دعم فني',
      status: 'نشط',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    },
  ];

  const filteredAdmins = useMemo(() => {
    return admins.filter((adm) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        adm.name.toLowerCase().includes(q) ||
        adm.email.toLowerCase().includes(q) ||
        adm.phone.includes(q) ||
        adm.role.toLowerCase().includes(q);

      let matchesRole = true;
      if (roleFilter !== 'all') {
        matchesRole = adm.role.toLowerCase() === roleFilter.toLowerCase();
      }

      return matchesSearch && matchesRole;
    });
  }, [admins, searchQuery, roleFilter]);

  const paginatedAdmins = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAdmins.slice(start, start + pageSize);
  }, [filteredAdmins, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cairo text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-rukoob-forest-light dark:text-rukoob-gold" />
            إدارة المشرفين وصلاحيات الأمان
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            صلاحيات إدارة تطبيق ركوب وحسابات المشرفين المعتمدة في السيرفر
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-glass p-3.5 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="البحث بالاسم، البريد، أو نوع الصلاحية..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pr-10 pl-4 py-2 bg-slate-50 dark:bg-rukoob-dark text-xs text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-rukoob-forest/50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto px-4 py-2 bg-slate-50 dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-slate-300 rounded-xl focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-bold cursor-pointer"
          >
            <option value="all">جميع الصلاحيات</option>
            <option value="superadmin">مدير عام (SuperAdmin)</option>
            <option value="operations">مسؤول عمليات (Operations)</option>
            <option value="support">دعم فني (Support)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Admin Accounts List */}
        <div className="lg:col-span-7 card-glass p-6 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-cairo">
              حسابات مشرفي المنصة ({filteredAdmins.length})
            </h2>
          </div>

          <div className="space-y-3">
            {paginatedAdmins.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                لا يوجد مشرفين يطابقون شروط البحث
              </div>
            ) : (
              paginatedAdmins.map((adm) => (
                <div
                  key={adm.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-rukoob-forest/20 border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={adm.avatar}
                      alt={adm.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-rukoob-gold/40 shadow-sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{adm.name}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">{adm.phone} • {adm.email}</p>
                    </div>
                  </div>

                  <Badge variant="gold" size="sm">
                    {adm.roleLabel || adm.role}
                  </Badge>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredAdmins.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(filteredAdmins.length / pageSize) || 1}
              totalItems={filteredAdmins.length}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              pageSizeOptions={[3, 5, 10]}
            />
          )}
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-5 card-glass p-6 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-cairo flex items-center gap-2">
            <Lock className="w-4 h-4 text-rukoob-forest-light dark:text-rukoob-gold" />
            مصفوفة الصلاحيات والأمان
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/30 space-y-1.5">
              <p className="font-bold text-rukoob-forest-light dark:text-rukoob-gold flex items-center gap-1.5 text-xs">
                <Shield className="w-4 h-4" />
                صلاحيات كاملة (Super Admin):
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                رؤية شاملة للوحة التحكم والإحصائيات، توثيق الكباتن، إدارة الأسعار والعمولات، إرسال الإشعارات، وإدارة المشرفين.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/30 space-y-1.5">
              <p className="font-bold text-rukoob-forest-light dark:text-rukoob-gold flex items-center gap-1.5 text-xs">
                <Key className="w-4 h-4" />
                صلاحيات العمليات (Operations):
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                متابعة حركة الرحلات المباشرة، فحص وتوثيق أوراق وسيارات الكباتن الجدد، وإيقاف/تنشيط الحسابات (بدون لوحة الإحصائيات).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/30 space-y-1.5">
              <p className="font-bold text-rukoob-forest-light dark:text-rukoob-gold flex items-center gap-1.5 text-xs">
                <CheckCircle className="w-4 h-4" />
                صلاحيات الدعم الفني (Support):
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                متابعة تذاكر الدعم والشكاوى والرد على استفسارات المستخدمين وحل المشكلات حصرياً.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
