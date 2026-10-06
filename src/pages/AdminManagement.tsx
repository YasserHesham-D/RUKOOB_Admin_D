import React, { useState, useMemo, useEffect } from 'react';
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
  Phone,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  Plus,
  AlertTriangle,
  RotateCcw,
  Check,
  ExternalLink,
  LogIn,
  Sliders,
  X
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth, rolePermissions } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { AdminUser, Role, Permission } from '../types';

export interface SystemPermissionDef {
  id: Permission;
  label: string;
  description: string;
  category: 'البيانات والتقارير' | 'العمليات الميدانية' | 'العملاء والدعم' | 'الإدارة والأمان';
}

export const ALL_PERMISSIONS: SystemPermissionDef[] = [
  {
    id: 'view_dashboard',
    label: 'لوحة التحكم والتحليلات',
    description: 'الاطلاع على المؤشرات المالية وإحصائيات الرحلات المركزية',
    category: 'البيانات والتقارير',
  },
  {
    id: 'view_trips',
    label: 'سجل ومراقبة الرحلات الحية',
    description: 'متابعة مسارات الرحلات والمسافات الجغرافية وتوقيتات الوصول',
    category: 'العمليات الميدانية',
  },
  {
    id: 'verify_drivers',
    label: 'فحص وتوثيق الكباتن',
    description: 'مراجعة أوراق الكباتن والتراخيص واعتماد أو رفض السائقين الجدد',
    category: 'العمليات الميدانية',
  },
  {
    id: 'manage_drivers',
    label: 'إدارة أسطول الكباتن',
    description: 'إيقاف وتنشيط حسابات الكباتن والاطلاع على المركبات والمحافظ',
    category: 'العمليات الميدانية',
  },
  {
    id: 'manage_riders',
    label: 'إدارة الركاب والعملاء',
    description: 'متابعة مستخدمي التطبيق وإحصائيات رحلاتهم وحظر/تنشيط الحسابات',
    category: 'العملاء والدعم',
  },
  {
    id: 'manage_support',
    label: 'تذاكر الدعم والشكاوى',
    description: 'الرد على رسائل واستفسارات المستخدمين وحل الشكاوى وإغلاقها',
    category: 'العملاء والدعم',
  },
  {
    id: 'send_broadcast',
    label: 'الإشعارات والبث المباشر',
    description: 'إرسال حملات وتنبيهات فورية لجميع الكباتن والركاب',
    category: 'الإدارة والأمان',
  },
  {
    id: 'manage_settings',
    label: 'إعدادات المنصة والعمولة',
    description: 'تعديل نسب العمولة، الحدود الدنيا للأسعار، وسياسات التشغيل',
    category: 'الإدارة والأمان',
  },
  {
    id: 'manage_admins',
    label: 'إدارة المشرفين والصلاحيات',
    description: 'إضافة وتعديل وحذف المشرفين وتخصيص صلاحيات الأمان',
    category: 'الإدارة والأمان',
  },
];

interface ManagedAdmin extends AdminUser {
  status: 'active' | 'suspended';
  phone: string;
  roleLabel: string;
}

const DEFAULT_ADMINS: ManagedAdmin[] = [
  {
    id: 'admin-1',
    name: 'Admin Rukoob (مدير عام المنظومة)',
    phone: '+201000000001',
    email: 'admin@rukoob.com',
    role: 'SuperAdmin',
    roleLabel: 'مدير عام',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    permissions: rolePermissions.SuperAdmin,
  },
  {
    id: 'admin-2',
    name: 'مسؤول العمليات (Operations)',
    phone: '+201000000002',
    email: 'ops@rukoob.com',
    role: 'OpsAdmin',
    roleLabel: 'مسؤول عمليات',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    permissions: rolePermissions.OpsAdmin,
  },
  {
    id: 'admin-3',
    name: 'مشرف الدعم الفني (Support Lead)',
    phone: '+201000000003',
    email: 'support@rukoob.com',
    role: 'SupportAgent',
    roleLabel: 'دعم فني',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    permissions: rolePermissions.SupportAgent,
  },
];

export const AdminManagement: React.FC = () => {
  const { currentRole, user: currentUser, switchRole } = useAuth();
  const { addNotification } = useNotifications();

  // Load from localStorage or fallback to defaults
  const [admins, setAdmins] = useState<ManagedAdmin[]>(() => {
    try {
      const saved = localStorage.getItem('rukoob_platform_admins');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ADMINS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rukoob_platform_admins', JSON.stringify(admins));
    } catch (e) {
      console.error(e);
    }
  }, [admins]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<ManagedAdmin | null>(null);

  // Selected admin for edit or permissions
  const [selectedAdmin, setSelectedAdmin] = useState<ManagedAdmin | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'OpsAdmin' as Role,
    status: 'active' as 'active' | 'suspended',
    avatar: '',
  });

  // Permissions state for permissions modal
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  // Open Edit Modal
  const handleOpenEdit = (admin: ManagedAdmin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      status: admin.status,
      avatar: admin.avatar || '',
    });
    setIsEditModalOpen(true);
  };

  // Open Permissions Modal
  const handleOpenPermissions = (admin: ManagedAdmin) => {
    setSelectedAdmin(admin);
    const existing = admin.permissions && admin.permissions.length > 0
      ? admin.permissions
      : (rolePermissions[admin.role] || []);
    setSelectedPermissions([...existing]);
    setIsPermissionsModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '+2010',
      role: 'OpsAdmin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    });
    setSelectedPermissions([...rolePermissions.OpsAdmin]);
    setIsAddModalOpen(true);
  };

  // Save Edit Admin
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    if (!formData.name.trim() || !formData.email.trim()) {
      addNotification({
        type: 'error',
        title: 'بيانات غير مكتملة',
        message: 'يرجى إدخال اسم المشرف والبريد الإلكتروني',
      });
      return;
    }

    const roleLabel =
      formData.role === 'SuperAdmin'
        ? 'مدير عام'
        : formData.role === 'OpsAdmin'
        ? 'مسؤول عمليات'
        : 'دعم فني';

    setAdmins((prev) =>
      prev.map((adm) => {
        if (adm.id === selectedAdmin.id) {
          return {
            ...adm,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            role: formData.role,
            roleLabel,
            status: formData.status,
            avatar: formData.avatar || adm.avatar,
          };
        }
        return adm;
      })
    );

    setIsEditModalOpen(false);
    addNotification({
      type: 'success',
      title: 'تم حفظ التعديلات',
      message: `تم تحديث بيانات المشرف (${formData.name}) بنجاح`,
    });
  };

  // Save Permissions
  const handleSavePermissions = () => {
    if (!selectedAdmin) return;

    setAdmins((prev) =>
      prev.map((adm) => {
        if (adm.id === selectedAdmin.id) {
          return {
            ...adm,
            permissions: selectedPermissions,
          };
        }
        return adm;
      })
    );

    setIsPermissionsModalOpen(false);
    addNotification({
      type: 'success',
      title: 'تم تحديث الصلاحيات',
      message: `تم تحديث صلاحيات المشرف (${selectedAdmin.name}) ومنحه ${selectedPermissions.length} صلاحيات بنجاح`,
    });
  };

  // Save New Admin
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addNotification({
        type: 'error',
        title: 'بيانات غير مكتملة',
        message: 'يرجى إدخال اسم المشرف والبريد الإلكتروني',
      });
      return;
    }

    const roleLabel =
      formData.role === 'SuperAdmin'
        ? 'مدير عام'
        : formData.role === 'OpsAdmin'
        ? 'مسؤول عمليات'
        : 'دعم فني';

    const newAdmin: ManagedAdmin = {
      id: `admin-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || '+201000000000',
      role: formData.role,
      roleLabel,
      status: formData.status,
      avatar: formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      permissions: selectedPermissions.length > 0 ? selectedPermissions : rolePermissions[formData.role],
    };

    setAdmins((prev) => [newAdmin, ...prev]);
    setIsAddModalOpen(false);
    addNotification({
      type: 'success',
      title: 'تمت إضافة المشرف',
      message: `تم إنشاء حساب المشرف الجديد (${newAdmin.name}) بنجاح`,
    });
  };

  // Toggle Admin Status
  const handleToggleStatus = (admin: ManagedAdmin) => {
    const nextStatus = admin.status === 'active' ? 'suspended' : 'active';
    setAdmins((prev) =>
      prev.map((adm) => (adm.id === admin.id ? { ...adm, status: nextStatus } : adm))
    );
    addNotification({
      type: nextStatus === 'active' ? 'success' : 'warning',
      title: nextStatus === 'active' ? 'تم تنشيط الحساب' : 'تم إيقاف الحساب',
      message: `تم ${nextStatus === 'active' ? 'تنشيط' : 'تعليق'} حساب المشرف (${admin.name})`,
    });
  };

  // Delete Admin
  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.email === currentUser?.email) {
      addNotification({
        type: 'error',
        title: 'إجراء غير مسموح',
        message: 'لا يمكنك حذف حسابك الشخصي المسجل به حالياً في النظام',
      });
      return;
    }

    setAdmins((prev) => prev.filter((adm) => adm.id !== deleteConfirmTarget.id));
    addNotification({
      type: 'info',
      title: 'تم حذف المشرف',
      message: `تم حذف حساب المشرف (${deleteConfirmTarget.name}) نهائياً من المنصة`,
    });
    setDeleteConfirmTarget(null);
  };

  // Toggle individual permission checkbox
  const handleTogglePermission = (permId: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Quick select all / clear permissions
  const handleSelectAllPermissions = () => {
    setSelectedPermissions(ALL_PERMISSIONS.map((p) => p.id));
  };

  const handleClearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleResetRoleDefaults = (role: Role) => {
    setSelectedPermissions([...rolePermissions[role]]);
  };

  // Filtered admins
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

  const isSuperAdmin = currentRole === 'SuperAdmin';

  return (
    <div className="space-y-6 font-cairo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cairo text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-rukoob-forest-light dark:text-rukoob-gold" />
            <span>إدارة المشرفين وصلاحيات الأمان</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            إضافة وتعديل وحذف حسابات المشرفين، وتعيين الصلاحيات الدقيقة لكل عضو في فريق الإدارة
          </p>
        </div>

        {/* Add New Admin Button */}
        {isSuperAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark font-bold hover:bg-rukoob-forest-light dark:hover:bg-rukoob-gold-light transition-all flex items-center gap-2 text-xs shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مشرف جديد</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-glass p-3.5 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="البحث بالاسم، البريد، أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pr-10 pl-4 py-2 bg-white dark:bg-rukoob-dark text-xs text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-rukoob-forest/50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold"
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
            className="w-full md:w-auto px-4 py-2 bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-slate-300 rounded-xl focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-bold cursor-pointer"
          >
            <option value="all">جميع الصلاحيات</option>
            <option value="superadmin">مدير عام (SuperAdmin)</option>
            <option value="opsadmin">مسؤول عمليات (OpsAdmin)</option>
            <option value="supportagent">دعم فني (SupportAgent)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Admin Accounts List (7 Cols) */}
        <div className="lg:col-span-7 card-glass p-6 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-cairo flex items-center gap-2">
              <span>حسابات مشرفي المنصة ({filteredAdmins.length})</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {admins.filter((a) => a.status === 'active').length} نشط
            </span>
          </div>

          <div className="space-y-3">
            {paginatedAdmins.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                لا يوجد مشرفين يطابقون شروط البحث
              </div>
            ) : (
              paginatedAdmins.map((adm) => {
                const permsCount = adm.permissions?.length || rolePermissions[adm.role]?.length || 0;
                return (
                  <div
                    key={adm.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-rukoob-darker/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-rukoob-gold/40 transition-colors"
                  >
                    {/* User Identity Info */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={adm.avatar}
                          alt={adm.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-rukoob-gold/40 shadow-sm"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-rukoob-dark ${
                            adm.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          title={adm.status === 'active' ? 'حساب نشط' : 'حساب موقوف'}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{adm.name}</p>
                          {adm.status === 'suspended' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
                              موقوف
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {adm.phone} • {adm.email}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <Badge variant="gold" size="sm">
                            {adm.roleLabel || adm.role}
                          </Badge>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <Key className="w-3 h-3" />
                            <span>{permsCount} صلاحيات مفعلة</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Toolbar for SuperAdmin */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {/* Manage Permissions */}
                      <button
                        onClick={() => handleOpenPermissions(adm)}
                        title="تعديل الصلاحيات الممنوحة"
                        className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/50 transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">الصلاحيات</span>
                      </button>

                      {/* Edit Details */}
                      <button
                        onClick={() => handleOpenEdit(adm)}
                        title="تعديل بيانات الحساب والدور"
                        className="p-2 rounded-lg bg-slate-100 dark:bg-rukoob-forest/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-rukoob-forest border border-slate-200 dark:border-rukoob-forest/50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Status (Active / Suspend) */}
                      <button
                        onClick={() => handleToggleStatus(adm)}
                        title={adm.status === 'active' ? 'تعليق الحساب مؤقتاً' : 'تنشيط الحساب'}
                        className={`p-2 rounded-lg border transition-colors ${
                          adm.status === 'active'
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 border-amber-200 dark:border-amber-800/40'
                            : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border-emerald-200 dark:border-emerald-800/40'
                        }`}
                      >
                        {adm.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete Admin */}
                      <button
                        onClick={() => setDeleteConfirmTarget(adm)}
                        disabled={adm.email === currentUser?.email}
                        title={adm.email === currentUser?.email ? 'لا يمكنك حذف حسابك الحالي' : 'حذف المشرف'}
                        className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
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

        {/* Permissions & Security Matrix (5 Cols) */}
        <div className="lg:col-span-5 card-glass p-6 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-cairo flex items-center gap-2">
              <Lock className="w-4 h-4 text-rukoob-forest-light dark:text-rukoob-gold" />
              <span>مصفوفة الصلاحيات والأمان القياسية</span>
            </h2>
            <span className="text-[11px] text-rukoob-gold font-bold">9 صلاحيات نظام</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* SuperAdmin Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-rukoob-darker/80 border border-slate-200 dark:border-rukoob-forest/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-bold text-rukoob-forest-light dark:text-rukoob-gold flex items-center gap-1.5 text-xs">
                  <Shield className="w-4 h-4" />
                  <span>صلاحيات كاملة (Super Admin):</span>
                </p>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold">
                  9 من 9 صلاحيات
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                رؤية شاملة للوحة التحكم والإحصائيات، توثيق الكباتن، إدارة الأسعار والعمولات، إرسال الإشعارات، وإدارة المشرفين بالكامل.
              </p>
            </div>

            {/* Operations Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-rukoob-darker/80 border border-slate-200 dark:border-rukoob-forest/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-bold text-rukoob-forest-light dark:text-rukoob-gold flex items-center gap-1.5 text-xs">
                  <Key className="w-4 h-4" />
                  <span>صلاحيات العمليات (Operations):</span>
                </p>
                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-bold">
                  4 صلاحيات
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                متابعة حركة الرحلات المباشرة، فحص وتوثيق أوراق وسيارات الكباتن الجدد، وإيقاف/تنشيط الحسابات الميدانية.
              </p>
            </div>

            {/* Support Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-rukoob-darker/80 border border-slate-200 dark:border-rukoob-forest/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-bold text-rukoob-forest-light dark:text-rukoob-gold flex items-center gap-1.5 text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>صلاحيات الدعم الفني (Support):</span>
                </p>
                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold">
                  صلاحية واحدة
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                متابعة تذاكر الدعم والشكاوى والرد على استفسارات الكباتن والركاب وحل المشكلات حصرياً.
              </p>
            </div>
          </div>

          {/* Quick Impersonate / Test Role Feature */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 block mb-2">
              اختبار حساب المشرف وصلاحياته فوراً:
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['SuperAdmin', 'OpsAdmin', 'SupportAgent'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    addNotification({
                      type: 'info',
                      title: 'تم التبديل',
                      message: `أنت الآن تتصفح بصلاحيات: ${
                        r === 'SuperAdmin' ? 'المدير العام' : r === 'OpsAdmin' ? 'مسؤول العمليات' : 'الدعم الفني'
                      }`,
                    });
                  }}
                  className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all ${
                    currentRole === r
                      ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark shadow'
                      : 'bg-slate-100 dark:bg-rukoob-dark text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {r === 'SuperAdmin' ? 'مدير عام' : r === 'OpsAdmin' ? 'عمليات' : 'دعم فني'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD NEW ADMIN */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة مشرف جديد للمنصة"
        size="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المشرف الكامل *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: أحمد عبد الله"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-rukoob-dark text-xs text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-rukoob-forest/50 focus:outline-none focus:border-rukoob-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                البريد الإلكتروني الرسمي *
              </label>
              <input
                type="email"
                required
                placeholder="admin@rukoob.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-rukoob-dark text-xs text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-rukoob-forest/50 focus:outline-none focus:border-rukoob-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم الهاتف للتواصل
              </label>
              <input
                type="tel"
                placeholder="+201012345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-rukoob-dark text-xs text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-rukoob-forest/50 focus:outline-none focus:border-rukoob-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الدور الأساسي (Role) *
              </label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const newRole = e.target.value as Role;
                  setFormData({ ...formData, role: newRole });
                  setSelectedPermissions([...rolePermissions[newRole]]);
                }}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-rukoob-dark text-xs text-slate-900 dark:text-slate-300 rounded-xl border border-slate-300 dark:border-rukoob-forest/50 focus:outline-none focus:border-rukoob-gold font-bold"
              >
                <option value="SuperAdmin">مدير عام (SuperAdmin) — كامل الصلاحيات</option>
                <option value="OpsAdmin">مسؤول عمليات (OpsAdmin) — فحص وتوثيق ورحلات</option>
                <option value="SupportAgent">أخصائي دعم فني (SupportAgent) — تذاكر وشكاوى</option>
              </select>
            </div>
          </div>

          {/* Quick permissions preview */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                الصلاحيات المبدئية الممنوحة ({selectedPermissions.length} من {ALL_PERMISSIONS.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAllPermissions}
                className="text-[11px] text-rukoob-gold font-bold hover:underline"
              >
                تحديد جميع الصلاحيات
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-rukoob-dark rounded-xl border border-slate-200 dark:border-slate-800">
              {ALL_PERMISSIONS.map((perm) => (
                <label
                  key={perm.id}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-rukoob-forest/20 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => handleTogglePermission(perm.id)}
                    className="mt-0.5 accent-rukoob-gold cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {perm.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{perm.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-rukoob-dark"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark text-xs font-bold hover:shadow-md"
            >
              حفظ وإنشاء المشرف
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT ADMIN DETAILS */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`تعديل بيانات المشرف: ${selectedAdmin?.name || ''}`}
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم المشرف *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-rukoob-dark text-xs text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-rukoob-forest/50 focus:outline-none focus:border-rukoob-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              البريد الإلكتروني *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-rukoob-dark text-xs text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-rukoob-forest/50 focus:outline-none focus:border-rukoob-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-rukoob-dark text-xs text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-rukoob-forest/50 focus:outline-none focus:border-rukoob-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الدور الأساسي (Role)
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-rukoob-dark text-xs text-slate-900 dark:text-slate-300 rounded-xl border border-slate-300 dark:border-rukoob-forest/50 font-bold cursor-pointer"
              >
                <option value="SuperAdmin">مدير عام (SuperAdmin)</option>
                <option value="OpsAdmin">مسؤول عمليات (OpsAdmin)</option>
                <option value="SupportAgent">دعم فني (SupportAgent)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                حالة الحساب
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-rukoob-dark text-xs text-slate-900 dark:text-slate-300 rounded-xl border border-slate-300 dark:border-rukoob-forest/50 font-bold cursor-pointer"
              >
                <option value="active">نشط ومفعل 🟢</option>
                <option value="suspended">موقوف مؤقتاً 🔴</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-rukoob-dark"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark text-xs font-bold hover:shadow-md"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: MANAGE INDIVIDUAL PERMISSIONS */}
      <Modal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        title={`تخصيص الصلاحيات — ${selectedAdmin?.name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-rukoob-darker border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                المشرف: {selectedAdmin?.name} ({selectedAdmin?.roleLabel || selectedAdmin?.role})
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                يمكن للمدير العام منح أو سحب أي صلاحية بشكل مخصص ومباشر
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllPermissions}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] hover:bg-emerald-500/20"
              >
                تحديد الكل
              </button>
              <button
                type="button"
                onClick={handleClearAllPermissions}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[11px] hover:bg-rose-500/20"
              >
                إلغاء التحديد
              </button>
              {selectedAdmin && (
                <button
                  type="button"
                  onClick={() => handleResetRoleDefaults(selectedAdmin.role)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-rukoob-dark text-slate-600 dark:text-slate-400 font-bold text-[11px] hover:bg-slate-200"
                >
                  استعادة الافتراضي
                </button>
              )}
            </div>
          </div>

          {/* Grouped by Categories */}
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {['البيانات والتقارير', 'العمليات الميدانية', 'العملاء والدعم', 'الإدارة والأمان'].map((cat) => {
              const catPerms = ALL_PERMISSIONS.filter((p) => p.category === cat);
              return (
                <div key={cat} className="space-y-2">
                  <h4 className="text-xs font-bold text-rukoob-forest-light dark:text-rukoob-gold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{cat}</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {catPerms.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => handleTogglePermission(perm.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                            isChecked
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                              : 'bg-slate-50/50 dark:bg-rukoob-darker/60 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-1 accent-emerald-500 h-4 w-4 rounded cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {perm.label}
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                              {perm.description}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500">
              تم تحديد {selectedPermissions.length} من {ALL_PERMISSIONS.length} صلاحيات
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPermissionsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-rukoob-dark"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2 rounded-xl bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark text-xs font-bold hover:shadow-md"
              >
                حفظ واعتماد الصلاحيات
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteConfirmTarget}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف حساب المشرف"
        message={`هل أنت متأكد من رغبتك في حذف حساب المشرف (${deleteConfirmTarget?.name})؟ سيتم سحب كافة الصلاحيات وإلغاء تسجيل دخوله للمنظومة نهائياً.`}
        confirmText="نعم، حذف الحساب"
        cancelText="إلغاء"
        isDanger={true}
      />
    </div>
  );
};
