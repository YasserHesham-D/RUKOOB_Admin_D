import React, { useEffect, useState, useMemo } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Check,
  X,
  Phone,
  Car,
  FileText,
  AlertTriangle,
  Search,
  RefreshCw,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AdminService } from '../api/adminService';
import { getFullImageUrl } from '../api/apiClient';
import { DriverProfileDto, DocumentTypeEnum } from '../types';
import { Badge } from '../components/common/Badge';
import { DocumentViewer } from '../components/common/DocumentViewer';
import { Modal } from '../components/common/Modal';
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

export const Verification: React.FC = () => {
  const [pendingDrivers, setPendingDrivers] = useState<DriverProfileDto[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'oldest' | 'newest'>('oldest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Document Fullscreen Preview Modal
  const [activeDocPreview, setActiveDocPreview] = useState<{ title: string; url: string } | null>(null);

  const { addNotification } = useNotifications();

  const fetchPendingDrivers = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getPendingDrivers();
      setPendingDrivers(data);
      if (data.length > 0 && !selectedDriver) {
        setSelectedDriver(data[0]);
      } else if (data.length === 0) {
        setSelectedDriver(null);
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل تحميل طلبات التوثيق من السيرفر',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const handleApprove = async () => {
    if (!selectedDriver) return;
    try {
      setSubmittingAction(true);
      await AdminService.approveDriver(selectedDriver.id);
      addNotification({
        type: 'success',
        title: 'تم قبول وتوثيق الكابتن',
        message: `تم اعتماد وتفعيل حساب الكابتن ${selectedDriver.firstName} ${selectedDriver.lastName} بنجاح`,
      });
      fetchPendingDrivers();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'فشلت العملية',
        message: 'حدث خطأ أثناء اعتماد السائق، يرجى المحاولة مرة أخرى',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDriver) return;
    try {
      setSubmittingAction(true);
      await AdminService.rejectDriver(selectedDriver.id, rejectionReason);
      addNotification({
        type: 'warning',
        title: 'تم رفض التوثيق',
        message: `تم رفض طلب الكابتن ${selectedDriver.firstName} وإرسال سبب الرفض إليه`,
      });
      setIsRejectModalOpen(false);
      setRejectionReason('');
      fetchPendingDrivers();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'فشلت العملية',
        message: 'حدث خطأ أثناء رفض الطلب',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filter and Sort
  const filteredDrivers = useMemo(() => {
    return pendingDrivers.filter((driver) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        (driver.firstName && driver.firstName.toLowerCase().includes(q)) ||
        (driver.lastName && driver.lastName.toLowerCase().includes(q)) ||
        (driver.phoneNumber && driver.phoneNumber.includes(q)) ||
        (driver.id && driver.id.includes(q)) ||
        (driver.vehicle?.licensePlate && driver.vehicle.licensePlate.toLowerCase().includes(q)) ||
        (driver.vehicle?.make && driver.vehicle.make.toLowerCase().includes(q)) ||
        (driver.vehicle?.model && driver.vehicle.model.toLowerCase().includes(q))
      );
    }).sort((a, b) => {
      // Sort oldest or newest
      return sortBy === 'oldest' ? -1 : 1;
    });
  }, [pendingDrivers, searchQuery, sortBy]);

  // Paginated Drivers
  const paginatedDrivers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDrivers.slice(start, start + pageSize);
  }, [filteredDrivers, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cairo text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-rukoob-gold" />
            توثيق ومراجعة الكباتن الجدد
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مراجعة وفحص الوثائق الرسمية، رخص القيادة، وصور المركبات لاعتماد الكباتن
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold font-outfit">
            <Clock className="w-4 h-4" />
            <span>{pendingDrivers.length} طلب بانتظار الفحص</span>
          </div>

          <button
            onClick={fetchPendingDrivers}
            className="p-2 rounded-xl bg-slate-100 dark:bg-rukoob-forest/40 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-rukoob-forest/60 transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card-glass p-3.5 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="البحث باسم الكابتن، الهاتف، الرقم القومي، الموديل، أو رقم اللوحة..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full md:w-auto px-3.5 py-2 bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-slate-300 rounded-xl focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-bold cursor-pointer"
          >
            <option value="oldest">الأقدم أولاً (حسب أولوية الانتظار)</option>
            <option value="newest">الأحدث أولاً</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Left List / Right Full Review Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Pending Drivers List with Pagination */}
        <div className="lg:col-span-4 space-y-3">
          <div className="card-glass rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 overflow-hidden flex flex-col h-[650px]">
            <div className="p-3.5 bg-slate-50 dark:bg-rukoob-forest/30 border-b border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-cairo">
                قائمة الطلبات ({filteredDrivers.length})
              </span>
              <span className="text-[11px] text-slate-500">اختر طلباً للمراجعة</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1 custom-scrollbar">
              {loading ? (
                <div className="py-20 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rukoob-gold mb-2" />
                  جاري فحص الطلبات...
                </div>
              ) : paginatedDrivers.length === 0 ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    لا توجد طلبات معلقة حالياً
                  </p>
                  <p className="text-[11px] text-slate-500">تمت مراجعة جميع المستندات بنجاح</p>
                </div>
              ) : (
                paginatedDrivers.map((driver) => {
                  const isSelected = selectedDriver?.id === driver.id;
                  return (
                    <div
                      key={driver.id}
                      onClick={() => setSelectedDriver(driver)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-rukoob-forest/10 dark:bg-rukoob-gold/15 border-rukoob-forest dark:border-rukoob-gold shadow-sm'
                          : 'bg-white dark:bg-rukoob-darker/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-rukoob-forest'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            driver.profileImageUrl
                              ? getFullImageUrl(driver.profileImageUrl)
                              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
                          }
                          alt={driver.firstName}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-rukoob-gold/30 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {driver.firstName} {driver.lastName}
                          </p>
                          <p className="text-xs text-slate-500 font-mono" dir="ltr">
                            {driver.phoneNumber}
                          </p>
                          {driver.vehicle && (
                            <p className="text-[11px] text-rukoob-forest-light dark:text-rukoob-gold font-medium mt-0.5 truncate">
                              🚗 {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.licensePlate})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {filteredDrivers.length > 0 && (
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(filteredDrivers.length / pageSize) || 1}
                totalItems={filteredDrivers.length}
                pageSize={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
                pageSizeOptions={[4, 6, 10, 20]}
                className="p-3"
              />
            )}
          </div>
        </div>

        {/* Right Side: Detailed Document Review */}
        <div className="lg:col-span-8">
          {selectedDriver ? (
            <div className="card-glass rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 p-6 space-y-6">
              {/* Profile Header & Action Buttons */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-rukoob-forest/30">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      selectedDriver.profileImageUrl
                        ? getFullImageUrl(selectedDriver.profileImageUrl)
                        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                    }
                    alt={selectedDriver.firstName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-rukoob-gold shadow-md shrink-0"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-cairo">
                      {selectedDriver.firstName} {selectedDriver.lastName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span dir="ltr">{selectedDriver.phoneNumber}</span>
                      </span>
                      {selectedDriver.id && (
                        <span>الرقم القومي: {selectedDriver.id}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Approve / Reject Actions */}
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                  <button
                    disabled={submittingAction}
                    onClick={() => setIsRejectModalOpen(true)}
                    className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>رفض الطلب</span>
                  </button>

                  <button
                    disabled={submittingAction}
                    onClick={handleApprove}
                    className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>اعتماد وتوثيق الكابتن</span>
                  </button>
                </div>
              </div>

              {/* Vehicle Specs Box */}
              {selectedDriver.vehicle && (
                <div className="bg-slate-50 dark:bg-rukoob-darker/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-rukoob-forest-light dark:text-rukoob-gold font-cairo flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    بيانات المركبة المسجلة
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">الماركة والموديل:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedDriver.vehicle.make} {selectedDriver.vehicle.model}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">سنة الصنع:</span>
                      <span className="font-bold font-outfit text-slate-900 dark:text-white">
                        {selectedDriver.vehicle.year}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">اللون:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedDriver.vehicle.color}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">رقم اللوحة:</span>
                      <span className="font-bold font-mono text-rukoob-forest-light dark:text-rukoob-gold">
                        {selectedDriver.vehicle.licensePlate}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Grid */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-cairo flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rukoob-gold" />
                  المستندات والصور المرفوعة ({selectedDriver.documents?.length || 0})
                </h3>

                {!selectedDriver.documents || selectedDriver.documents.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-rukoob-forest/10 rounded-xl border border-slate-200 dark:border-rukoob-forest/30 text-slate-400 text-xs">
                    لم يقم الكابتن برفع أي مستندات بعد
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDriver.documents.map((doc, idx) => {
                      const title = getDocumentTitle(doc.documentType);
                      const fullUrl = getFullImageUrl(doc.fileUrl);
                      return (
                        <DocumentViewer key={doc.id || idx} title={title} src={fullUrl} />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card-glass rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 p-16 text-center text-slate-400 space-y-3">
              <UserCheck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                اختر كابتن من القائمة لعرض وفحص مستنداته
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="رفض طلب توثيق الكابتن"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            يرجى توضيح سبب رفض التوثيق ليصل إلى الكابتن في التطبيق ليقوم بإعادة رفع المستندات الصحيحة:
          </p>
          <textarea
            rows={4}
            placeholder="مثال: صورة رخصة القيادة غير واضحة وبحاجة لإعادة التصوير..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full p-3 rounded-xl bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              إلغاء
            </button>
            <button
              disabled={!rejectionReason.trim() || submittingAction}
              onClick={handleReject}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              تأكيد الرفض
            </button>
          </div>
        </div>
      </Modal>

      {/* Document Fullscreen Modal */}
      {activeDocPreview && (
        <Modal
          isOpen={!!activeDocPreview}
          onClose={() => setActiveDocPreview(null)}
          title={activeDocPreview.title}
        >
          <div className="flex justify-center items-center p-2">
            <img
              src={activeDocPreview.url}
              alt={activeDocPreview.title}
              className="max-h-[75vh] w-auto object-contain rounded-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
