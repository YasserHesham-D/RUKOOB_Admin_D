
import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  Clock,
  Ban,
  Filter,
  RefreshCw,
  Eye,
  Star,
  RotateCcw,
  Car,
  X,
  ArrowUpDown,
  Wallet,
  Phone,
  Mail,
  Calendar,
  Shield,
  FileText,
  MapPin,
  Activity,
  AlertTriangle,
  Radio,
  ExternalLink,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { AdminService } from '../api/adminService';
import { getFullImageUrl } from '../api/apiClient';
import { DriverProfileDto, DocumentTypeEnum } from '../types';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DocumentViewer } from '../components/common/DocumentViewer';
import { Pagination } from '../components/common/Pagination';
import { useNotifications } from '../context/NotificationContext';

const getDocumentTitle = (type: number): string => {
  switch (type) {
    case DocumentTypeEnum.NationalIdFront:
      return 'بطاقة الرقم القومي (الوجه الأمامي)';
    case DocumentTypeEnum.NationalIdBack:
      return 'بطاقة الرقم القومي (الوجه الخلفي)';
    case DocumentTypeEnum.DrivingLicenseFront:
      return 'رخصة القيادة (الوجه الأمامي)';
    case DocumentTypeEnum.DrivingLicenseBack:
      return 'رخصة القيادة (الوجه الخلفي)';
    case DocumentTypeEnum.VehicleLicenseFront:
      return 'رخصة تسيير المركبة (الوجه الأمامي)';
    case DocumentTypeEnum.VehicleLicenseBack:
      return 'رخصة تسيير المركبة (الوجه الخلفي)';
    case DocumentTypeEnum.CriminalRecord:
      return 'صحيفة الحالة الجنائية (فيش وتشبيه)';
    case DocumentTypeEnum.DrugAnalysis:
      return 'تحليل المخدرات المعتمد';
    case DocumentTypeEnum.VehicleFront:
      return 'صورة المركبة من الأمام';
    case DocumentTypeEnum.VehicleBack:
      return 'صورة المركبة من الخلف';
    default:
      return 'مستند توثيق';
  }
};

const getVehicleTypeName = (type?: number): string => {
  switch (type) {
    case 1:
      return 'سيارة ملاكي (Private Car)';
    case 2:
      return 'سيارة أجرة (Taxi)';
    case 3:
      return 'فان / ميكروباص (Van)';
    case 4:
      return 'موتوسيكل (Motorcycle)';
    default:
      return 'مركبة معتمدة';
  }
};

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverProfileDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'suspended'>('all');
  const [onlineFilter, setOnlineFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'rides' | 'wallet'>('newest');

  // Full Driver Details Modal
  const [selectedDriver, setSelectedDriver] = useState<DriverProfileDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'overview' | 'vehicle' | 'documents'>('overview');

  // Actions Target for dialog
  const [actionTarget, setActionTarget] = useState<{ driver: DriverProfileDto; action: 'Suspend' | 'Activate' } | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const { addNotification } = useNotifications();

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getDrivers(page, pageSize);
      setDrivers(res.items);
      setTotalCount(res.totalCount);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل تحميل قائمة الكباتن من السيرفر',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, pageSize]);

  const handleOpenDriverDetails = async (driver: DriverProfileDto) => {
    setSelectedDriver(driver);
    setDetailsTab('overview');
    try {
      setLoadingDetails(true);
      const detailed = await AdminService.getDriverById(driver.id);
      if (detailed) {
        setSelectedDriver(detailed);
      }
    } catch (err) {
      console.warn('Could not fetch detailed driver profile, using cached row:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusChange = async () => {
    if (!actionTarget) return;
    const { driver, action } = actionTarget;

    try {
      if (action === 'Suspend') {
        await AdminService.suspendDriver(driver.id, suspendReason || 'مخالفة معايير الجودة');
        addNotification({
          type: 'warning',
          title: 'تم إيقاف الحساب',
          message: `تم إيقاف حساب الكابتن ${driver.firstName} ${driver.lastName} بنجاح`,
        });
      } else {
        await AdminService.approveDriver(driver.id);
        addNotification({
          type: 'success',
          title: 'تم تفعيل الحساب',
          message: `تم تنشيط حساب الكابتن ${driver.firstName} ${driver.lastName} بنجاح`,
        });
      }

      setActionTarget(null);
      setSuspendReason('');
      fetchDrivers();
      if (selectedDriver?.id === driver.id) {
        setSelectedDriver(null);
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'فشلت العملية',
        message: 'حدث خطأ أثناء تحديث حالة الكابتن',
      });
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 2:
        return <Badge variant="success" dot size="sm">معتمد ونشط</Badge>;
      case 1:
        return <Badge variant="warning" dot size="sm">قيد المراجعة</Badge>;
      case 4:
        return <Badge variant="danger" dot size="sm">موقوف مؤقتاً</Badge>;
      case 3:
        return <Badge variant="danger" dot size="sm">مرفوض</Badge>;
      default:
        return <Badge variant="neutral" dot size="sm">غير محدد</Badge>;
    }
  };

  // Client-side filtering & sorting for search and tab filters
  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      // 1. Search Query Match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        driver.firstName.toLowerCase().includes(query) ||
        driver.lastName.toLowerCase().includes(query) ||
        driver.phoneNumber.includes(query) ||
        (driver.email && driver.email.toLowerCase().includes(query)) ||
        (driver.vehicle?.licensePlate && driver.vehicle.licensePlate.toLowerCase().includes(query)) ||
        (driver.vehicle?.model && driver.vehicle.model.toLowerCase().includes(query));

      // 2. Status Match
      let matchesStatus = true;
      if (statusFilter === 'approved') matchesStatus = driver.verificationStatus === 2;
      else if (statusFilter === 'pending') matchesStatus = driver.verificationStatus === 1;
      else if (statusFilter === 'suspended') matchesStatus = driver.verificationStatus === 4;

      // 3. Online Match
      let matchesOnline = true;
      if (onlineFilter === 'online') matchesOnline = driver.isOnline === true;
      else if (onlineFilter === 'offline') matchesOnline = driver.isOnline === false;

      return matchesSearch && matchesStatus && matchesOnline;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'rides') return (b.totalRides || 0) - (a.totalRides || 0);
      if (sortBy === 'wallet') return (b.walletBalance || 0) - (a.walletBalance || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [drivers, searchQuery, statusFilter, onlineFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cairo text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-rukoob-forest-light dark:text-rukoob-gold" />
            إدارة أسطول الكباتن
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            متابعة السائقين، تقييمات الأداء، الأرصدة المالية، المستندات الرسمية، وحالة المركبات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDrivers}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-rukoob-forest/40 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-rukoob-forest/60 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-glass p-4 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث بالاسم، رقم الهاتف، رقم اللوحة، الموديل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-white dark:bg-rukoob-dark text-xs text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-rukoob-forest/50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Verification Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full md:w-auto px-3.5 py-2 bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-slate-300 rounded-xl focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-bold cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              <option value="approved">معتمد ونشط</option>
              <option value="pending">قيد المراجعة</option>
              <option value="suspended">موقوف مؤقتاً</option>
            </select>
          </div>

          {/* Online Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={onlineFilter}
              onChange={(e) => setOnlineFilter(e.target.value as any)}
              className="w-full md:w-auto px-3.5 py-2 bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-slate-300 rounded-xl focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-bold cursor-pointer"
            >
              <option value="all">حالة الاتصال (الكل)</option>
              <option value="online">متصل الآن 🟢</option>
              <option value="offline">غير متصل ⚪</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full md:w-auto px-3.5 py-2 bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-slate-300 rounded-xl focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-bold cursor-pointer"
            >
              <option value="newest">الأحدث تسجيلاً</option>
              <option value="rating">الأعلى تقييماً</option>
              <option value="rides">الأكثر رحلات</option>
              <option value="wallet">الأعلى رصيداً</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="card-glass rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-rukoob-forest/30 bg-slate-50 dark:bg-rukoob-darker/60 text-slate-600 dark:text-slate-400">
                <th className="py-3.5 px-4 font-bold font-cairo">الكابتن</th>
                <th className="py-3.5 px-4 font-bold font-cairo">رقم الهاتف</th>
                <th className="py-3.5 px-4 font-bold font-cairo">بيانات المركبة</th>
                <th className="py-3.5 px-4 font-bold font-cairo">التقييم</th>
                <th className="py-3.5 px-4 font-bold font-cairo">الرحلات</th>
                <th className="py-3.5 px-4 font-bold font-cairo">المحفظة</th>
                <th className="py-3.5 px-4 font-bold font-cairo">الحالة</th>
                <th className="py-3.5 px-4 text-center font-bold font-cairo">عرض التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rukoob-gold mb-2" />
                    جاري تحميل بيانات الكباتن...
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    لا يوجد كباتن يطابقون شروط البحث
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    onClick={() => handleOpenDriverDetails(driver)}
                    className="hover:bg-slate-50 dark:hover:bg-rukoob-forest/10 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={
                              driver.profileImageUrl
                                ? getFullImageUrl(driver.profileImageUrl)
                                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
                            }
                            alt={driver.firstName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-rukoob-forest/50 shrink-0 shadow-sm"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-rukoob-dark ${
                              driver.isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                            title={driver.isOnline ? 'متصل الآن' : 'غير متصل'}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {driver.firstName} {driver.lastName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            ID: #{driver.id.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200 font-semibold" dir="ltr">
                      {driver.phoneNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {driver.vehicle ? (
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {driver.vehicle.make} {driver.vehicle.model}
                          </p>
                          <p className="text-[11px] text-rukoob-forest-light dark:text-rukoob-gold font-mono font-bold">
                            {driver.vehicle.licensePlate} ({driver.vehicle.color})
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">غير مسجل</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold font-outfit">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {driver.rating ? Number(driver.rating).toFixed(1) : '5.0'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold font-outfit text-slate-900 dark:text-white">
                      {driver.totalRides} رحلة
                    </td>
                    <td className="py-3.5 px-4 font-bold font-outfit text-emerald-600 dark:text-emerald-400">
                      {driver.walletBalance} ج.م
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(driver.verificationStatus)}
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDriverDetails(driver)}
                          title="عرض ملف الكابتن الكامل"
                          className="px-3 py-1.5 rounded-lg bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark font-bold hover:bg-rukoob-forest-light dark:hover:bg-rukoob-gold-light transition-all flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض كامل</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination */}
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(totalCount / pageSize) || 1}
          totalItems={totalCount}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Comprehensive Full Driver Details Centered Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedDriver(null)}
          />

          {/* Centered Modal Window in the middle of the screen */}
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#0E1512] rounded-3xl border border-slate-200 dark:border-rukoob-forest/50 shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-rukoob-forest/30 bg-slate-50/50 dark:bg-rukoob-darker/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rukoob-forest-light dark:bg-rukoob-gold" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-cairo">
                  الملف الشامل لبيانات الكابتن
                </h2>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails && (
              <div className="p-3 bg-rukoob-gold/10 border-b border-rukoob-gold/30 text-xs text-rukoob-gold font-bold flex items-center gap-2 shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري تحميل كافة الوثائق والتفاصيل الدقيقة من السيرفر...</span>
              </div>
            )}

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Profile Overview Hero Box */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/40 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-sm">
                <div className="relative shrink-0">
                  <img
                    src={
                      selectedDriver.profileImageUrl
                        ? getFullImageUrl(selectedDriver.profileImageUrl)
                        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                    }
                    alt={selectedDriver.firstName}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-rukoob-gold shadow-md"
                  />
                  <span
                    className={`absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1 ${
                      selectedDriver.isOnline ? 'bg-emerald-600' : 'bg-slate-500'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{selectedDriver.isOnline ? 'متصل' : 'أوفلاين'}</span>
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-right space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white font-cairo">
                        {selectedDriver.firstName} {selectedDriver.lastName}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        كود الكابتن: #{selectedDriver.id}
                      </p>
                    </div>
                    <div>{getStatusBadge(selectedDriver.verificationStatus)}</div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs pt-1 text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 font-mono" dir="ltr">
                      <Phone className="w-3.5 h-3.5 text-rukoob-forest-light dark:text-rukoob-gold" />
                      {selectedDriver.phoneNumber}
                    </span>
                    {selectedDriver.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-rukoob-forest-light dark:text-rukoob-gold" />
                        {selectedDriver.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      انضم: {new Date(selectedDriver.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                {[
                  { id: 'overview', label: 'نظرة عامة والأداء', icon: Activity },
                  { id: 'vehicle', label: 'بيانات المركبة', icon: Car },
                  { id: 'documents', label: `المستندات والوثائق (${selectedDriver.documents?.length || 0})`, icon: FileText },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = detailsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDetailsTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark shadow-sm'
                          : 'bg-slate-100 dark:bg-rukoob-forest/20 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-rukoob-forest/40'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: Overview & Performance */}
              {detailsTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/40 text-center">
                      <span className="text-[11px] text-slate-500 block mb-1">تقييم الكابتن</span>
                      <div className="flex items-center justify-center gap-1 text-amber-500 text-lg font-bold font-outfit">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span>{selectedDriver.rating ? Number(selectedDriver.rating).toFixed(2) : '5.00'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">({selectedDriver.totalRatings || 0} تقييم)</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/40 text-center">
                      <span className="text-[11px] text-slate-500 block mb-1">إجمالي الرحلات</span>
                      <p className="text-lg font-bold font-outfit text-slate-900 dark:text-white">
                        {selectedDriver.totalRides || 0}
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block font-bold">رحلة مكتملة</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/40 text-center">
                      <span className="text-[11px] text-slate-500 block mb-1">رصيد المحفظة</span>
                      <p className="text-lg font-bold font-outfit text-emerald-600 dark:text-emerald-400">
                        {selectedDriver.walletBalance || 0} ج.م
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">مستحقات حالية</span>
                    </div>
                  </div>

                  {/* GPS Location info */}
                  {(selectedDriver.currentLatitude || selectedDriver.currentLongitude) && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-slate-800 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        آخر موقع جغرافي معروف (GPS)
                      </h4>
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="font-mono text-[11px]" dir="ltr">
                          Lat: {selectedDriver.currentLatitude?.toFixed(5)}, Lng: {selectedDriver.currentLongitude?.toFixed(5)}
                        </span>
                        <a
                          href={`https://maps.google.com/?q=${selectedDriver.currentLatitude},${selectedDriver.currentLongitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rukoob-forest-light dark:text-rukoob-gold font-bold hover:underline flex items-center gap-1"
                        >
                          <span>فتح في خرائط Google</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Vehicle Specs */}
              {detailsTab === 'vehicle' && (
                <div className="space-y-4 text-xs">
                  {selectedDriver.vehicle ? (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/40 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Car className="w-5 h-5 text-rukoob-forest-light dark:text-rukoob-gold" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-cairo">
                            {selectedDriver.vehicle.make} {selectedDriver.vehicle.model} ({selectedDriver.vehicle.year})
                          </h4>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                          {selectedDriver.vehicle.isActive ? 'مركبة نشطة' : 'معطلة'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white dark:bg-rukoob-darker rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 text-[11px] block">رقم اللوحة المرورية:</span>
                          <span className="font-mono text-base font-bold text-rukoob-forest-light dark:text-rukoob-gold">
                            {selectedDriver.vehicle.licensePlate}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-rukoob-darker rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 text-[11px] block">لون المركبة:</span>
                          <span className="text-base font-bold text-slate-900 dark:text-white">
                            {selectedDriver.vehicle.color}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-rukoob-darker rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 text-[11px] block">نوع وفئة المركبة:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {getVehicleTypeName(selectedDriver.vehicle.vehicleType)}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-rukoob-darker rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 text-[11px] block">سنة الصنع:</span>
                          <span className="font-bold font-outfit text-slate-900 dark:text-white">
                            {selectedDriver.vehicle.year}
                          </span>
                        </div>
                      </div>

                      {selectedDriver.vehicle.photoUrl && (
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">صورة المركبة:</span>
                          <img
                            src={getFullImageUrl(selectedDriver.vehicle.photoUrl)}
                            alt="Vehicle"
                            className="w-full max-h-56 object-cover rounded-xl border border-slate-200 dark:border-rukoob-forest/40 shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-slate-50 dark:bg-rukoob-dark rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                      <Car className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-xs font-bold">لم يتم تسجيل أي مركبة لهذا الكابتن بعد</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Uploaded Documents */}
              {detailsTab === 'documents' && (
                <div className="space-y-4">
                  {!selectedDriver.documents || selectedDriver.documents.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50 dark:bg-rukoob-dark rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                      <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-xs font-bold">لا توجد مستندات مرفوعة لهذا الكابتن</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedDriver.documents.map((doc, idx) => {
                        const title = getDocumentTitle(doc.documentType);
                        const fullUrl = getFullImageUrl(doc.fileUrl);
                        return (
                          <DocumentViewer
                            key={doc.id || idx}
                            title={title}
                            src={fullUrl}
                            type={doc.documentNumber ? `رقم: ${doc.documentNumber}` : undefined}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-rukoob-darker/50 shrink-0 flex items-center gap-3">
              {selectedDriver.verificationStatus === 2 ? (
                <button
                  onClick={() => setActionTarget({ driver: selectedDriver, action: 'Suspend' })}
                  className="flex-1 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>إيقاف حساب الكابتن</span>
                </button>
              ) : (
                <button
                  onClick={() => setActionTarget({ driver: selectedDriver, action: 'Activate' })}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>اعتماد وتفعيل الحساب</span>
                </button>
              )}

              <button
                onClick={() => setSelectedDriver(null)}
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-rukoob-forest/30 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!actionTarget}
        onClose={() => {
          setActionTarget(null);
          setSuspendReason('');
        }}
        onConfirm={handleStatusChange}
        title={actionTarget?.action === 'Suspend' ? 'إيقاف حساب الكابتن' : 'تفعيل الكابتن'}
        message={`هل أنت متأكد من تغيير حالة حساب الكابتن ${actionTarget?.driver.firstName}؟`}
        isDanger={actionTarget?.action === 'Suspend'}
      />
    </div>
  );
};
