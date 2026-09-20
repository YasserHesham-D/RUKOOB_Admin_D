import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  Ban,
  Filter,
  RefreshCw,
  Eye,
  Star,
  RotateCcw,
  X,
  Phone,
  Calendar,
  Shield,
  Activity,
  UserCheck
} from 'lucide-react';
import { AdminService } from '../api/adminService';
import { getFullImageUrl } from '../api/apiClient';
import { PassengerProfileDto } from '../types';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { useNotifications } from '../context/NotificationContext';

export const Riders: React.FC = () => {
  const [passengers, setPassengers] = useState<PassengerProfileDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'rides' | 'rating'>('newest');
  const [selectedPassenger, setSelectedPassenger] = useState<PassengerProfileDto | null>(null);

  const { addNotification } = useNotifications();

  const fetchPassengers = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getPassengers(page, pageSize);
      setPassengers(res.items);
      setTotalCount(res.totalCount);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل تحميل قائمة الركاب من السيرفر',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, [page, pageSize]);

  const filteredPassengers = useMemo(() => {
    return passengers.filter((p) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.phoneNumber.includes(query);

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = !p.isBanned;
      else if (statusFilter === 'suspended') matchesStatus = !!p.isBanned;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'rides') return (b.totalRides || 0) - (a.totalRides || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [passengers, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cairo text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-rukoob-gold" />
            إدارة الركاب والعملاء
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            متابعة حسابات مستخدمي تطبيق ركوب، إحصائيات الرحلات، وتقييمات العملاء
          </p>
        </div>

        <button
          onClick={fetchPassengers}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-rukoob-forest/40 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-rukoob-forest/60 transition-colors flex items-center gap-1.5 text-xs font-bold"
          title="تحديث البيانات"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">تحديث</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-glass p-4 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث بالاسم أو رقم الهاتف..."
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

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full md:w-auto px-3.5 py-2 bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-slate-300 rounded-xl focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-bold cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط ومفعل</option>
              <option value="suspended">موقوف</option>
            </select>
          </div>
        </div>
      </div>

      {/* Passengers Table */}
      <div className="card-glass rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-rukoob-forest/30 bg-slate-50 dark:bg-rukoob-darker/60 text-slate-600 dark:text-slate-400">
                <th className="py-3.5 px-4 font-bold font-cairo">الراكب</th>
                <th className="py-3.5 px-4 font-bold font-cairo">رقم الهاتف</th>
                <th className="py-3.5 px-4 font-bold font-cairo">التقييم</th>
                <th className="py-3.5 px-4 font-bold font-cairo">الرحلات المطلوبة</th>
                <th className="py-3.5 px-4 font-bold font-cairo">تاريخ التسجيل</th>
                <th className="py-3.5 px-4 font-bold font-cairo">الحالة</th>
                <th className="py-3.5 px-4 text-center font-bold font-cairo">عرض التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rukoob-gold mb-2" />
                    جاري تحميل بيانات الركاب...
                  </td>
                </tr>
              ) : filteredPassengers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    لا يوجد ركاب يطابقون شروط البحث
                  </td>
                </tr>
              ) : (
                filteredPassengers.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPassenger(p)}
                    className="hover:bg-slate-50 dark:hover:bg-rukoob-forest/10 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.profileImageUrl
                              ? getFullImageUrl(p.profileImageUrl)
                              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={p.firstName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-rukoob-forest/50 shrink-0 shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            ID: #{p.id.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200 font-semibold" dir="ltr">
                      {p.phoneNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold font-outfit">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {p.rating ? Number(p.rating).toFixed(1) : '5.0'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold font-outfit text-slate-900 dark:text-white">
                      {p.totalRides || 0} رحلة
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.isBanned ? (
                        <Badge variant="danger" dot size="sm">موقوف</Badge>
                      ) : (
                        <Badge variant="success" dot size="sm">نشط ومفعل</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedPassenger(p)}
                        title="عرض الملف"
                        className="px-3 py-1.5 rounded-lg bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark font-bold hover:bg-rukoob-forest-light dark:hover:bg-rukoob-gold-light transition-all flex items-center justify-center gap-1 mx-auto shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {/* Passenger Detail Centered Modal in the middle of the screen */}
      {selectedPassenger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedPassenger(null)}
          />

          {/* Centered Modal Box */}
          <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-[#0E1512] rounded-3xl border border-slate-200 dark:border-rukoob-forest/50 shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-rukoob-forest/30 bg-slate-50/50 dark:bg-rukoob-darker/50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rukoob-gold" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-cairo">
                  تفاصيل حساب الراكب
                </h2>
              </div>
              <button
                onClick={() => setSelectedPassenger(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-center">
              <img
                src={
                  selectedPassenger.profileImageUrl
                    ? getFullImageUrl(selectedPassenger.profileImageUrl)
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                }
                alt={selectedPassenger.firstName}
                className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-rukoob-gold shadow-md"
              />
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedPassenger.firstName} {selectedPassenger.lastName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1" dir="ltr">
                  {selectedPassenger.phoneNumber}
                </p>
              </div>

              <div className="flex justify-center">
                {selectedPassenger.isBanned ? (
                  <Badge variant="danger" dot size="sm">حساب موقوف</Badge>
                ) : (
                  <Badge variant="success" dot size="sm">حساب نشط ومفعل</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/40 text-center">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">الرحلات المطلوبة</p>
                  <p className="text-2xl font-bold font-outfit text-slate-900 dark:text-white mt-1">
                    {selectedPassenger.totalRides || 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-rukoob-forest/40 text-center">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">تقييم العميل</p>
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-bold font-outfit text-2xl mt-1">
                    <Star className="w-5 h-5 fill-amber-500" />
                    <span>{selectedPassenger.rating ? Number(selectedPassenger.rating).toFixed(1) : '5.0'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-rukoob-dark border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-right">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>معرف الحساب (ID):</span>
                  <span className="font-mono text-slate-900 dark:text-white">#{selectedPassenger.id.substring(0, 12)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>تاريخ الانضمام:</span>
                  <span className="font-mono">{new Date(selectedPassenger.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-rukoob-darker/50 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedPassenger(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-rukoob-forest/30 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
