import React, { useEffect, useState, useMemo } from 'react';
import {
  Route,
  Search,
  Eye,
  RefreshCw,
  Filter,
  Navigation,
  Car,
  User,
  Clock,
  ArrowUpDown,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Flag,
  PlayCircle,
  DollarSign,
  Phone,
  Timer,
  Calendar,
  Sparkles,
  Milestone,
  CheckCheck,
  Compass
} from 'lucide-react';
import { AdminService } from '../api/adminService';
import { RideDto } from '../types';
import { Badge } from '../components/common/Badge';
import { TripRouteMap } from '../components/map/TripRouteMap';
import { Pagination } from '../components/common/Pagination';
import { useNotifications } from '../context/NotificationContext';

export const Trips: React.FC = () => {
  const [rides, setRides] = useState<RideDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'fare_high' | 'fare_low' | 'dist_high' | 'dist_low'>('newest');
  const [onlyActive, setOnlyActive] = useState(false);
  const [selectedRide, setSelectedRide] = useState<RideDto | null>(null);

  const { addNotification } = useNotifications();

  const fetchRides = async () => {
    try {
      setLoading(true);
      if (onlyActive) {
        const activeList = await AdminService.getActiveRides();
        setRides(activeList);
        setTotalCount(activeList.length);
        if (activeList.length > 0 && !selectedRide) {
          setSelectedRide(activeList[0]);
        }
      } else {
        const res = await AdminService.getRides(page, pageSize);
        setRides(res.items);
        setTotalCount(res.totalCount);
        if (res.items.length > 0 && !selectedRide) {
          setSelectedRide(res.items[0]);
        }
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل تحميل سجل الرحلات من السيرفر',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [page, pageSize, onlyActive]);

  // Helper to get real or calculated distance in Km
  const getRideDistanceKm = (ride?: RideDto | null): string => {
    if (!ride) return '0.0';
    if (ride.distanceKm && ride.distanceKm > 0) {
      return ride.distanceKm.toFixed(1);
    }
    if (
      ride.pickup?.latitude &&
      ride.pickup?.longitude &&
      ride.destination?.latitude &&
      ride.destination?.longitude
    ) {
      const pLat = ride.pickup.latitude;
      const pLng = ride.pickup.longitude;
      const dLat = ride.destination.latitude;
      const dLng = ride.destination.longitude;
      const R = 6371; // Earth radius in km
      const dLatRad = ((dLat - pLat) * Math.PI) / 180;
      const dLngRad = ((dLng - pLng) * Math.PI) / 180;
      const a =
        Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
        Math.cos((pLat * Math.PI) / 180) *
          Math.cos((dLat * Math.PI) / 180) *
          Math.sin(dLngRad / 2) *
          Math.sin(dLngRad / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;
      if (dist > 0) {
        return dist.toFixed(1);
      }
    }
    return '0.0';
  };

  // Status Badge Helper
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 6:
        return <Badge variant="success" dot size="sm">مكتملة</Badge>;
      case 5:
        return <Badge variant="info" dot size="sm">جارية الآن</Badge>;
      case 4:
        return <Badge variant="info" dot size="sm">وصل الكابتن</Badge>;
      case 3:
        return <Badge variant="warning" dot size="sm">في الطريق للراكب</Badge>;
      case 2:
        return <Badge variant="warning" dot size="sm">مقبولة</Badge>;
      case 7:
      case 8:
        return <Badge variant="danger" dot size="sm">ملغاة</Badge>;
      default:
        return <Badge variant="neutral" dot size="sm">في انتظار كابتن</Badge>;
    }
  };

  // Helper to format timestamps nicely
  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return 'غير متوفر';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'غير متوفر';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper to calculate human readable duration between two dates
  const formatDuration = (fromStr?: string | null, toStr?: string | null) => {
    if (!fromStr || !toStr) return null;
    const start = new Date(fromStr).getTime();
    const end = new Date(toStr).getTime();
    const diffMs = end - start;
    if (diffMs <= 0 || isNaN(diffMs)) return 'أقل من دقيقة';

    const diffSec = Math.floor(diffMs / 1000);
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;

    if (hours > 0) {
      return `${hours} ساعة و ${remMins} دقيقة`;
    }
    if (mins > 0) {
      return secs > 0 ? `${mins} دقيقة و ${secs} ثانية` : `${mins} دقيقة`;
    }
    return `${secs} ثانية`;
  };

  // Client-side filtering & sorting for search and active filters
  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        ride.id.toLowerCase().includes(query) ||
        (ride.passengerName && ride.passengerName.toLowerCase().includes(query)) ||
        (ride.driverName && ride.driverName.toLowerCase().includes(query)) ||
        (ride.pickup?.address && ride.pickup.address.toLowerCase().includes(query)) ||
        (ride.destination?.address && ride.destination.address.toLowerCase().includes(query));

      // Status match
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = ride.status === 5 || ride.status === 4 || ride.status === 3;
      else if (statusFilter === 'completed') matchesStatus = ride.status === 6;
      else if (statusFilter === 'accepted') matchesStatus = ride.status === 2 || ride.status === 3 || ride.status === 4;
      else if (statusFilter === 'cancelled') matchesStatus = ride.status === 7 || ride.status === 8;
      else if (statusFilter === 'requested') matchesStatus = ride.status === 1 || ride.status === 0;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'fare_high') return (b.finalPrice || b.offeredPrice || 0) - (a.finalPrice || a.offeredPrice || 0);
      if (sortBy === 'fare_low') return (a.finalPrice || a.offeredPrice || 0) - (b.finalPrice || b.offeredPrice || 0);
      if (sortBy === 'dist_high') return parseFloat(getRideDistanceKm(b)) - parseFloat(getRideDistanceKm(a));
      if (sortBy === 'dist_low') return parseFloat(getRideDistanceKm(a)) - parseFloat(getRideDistanceKm(b));
      return 0;
    });
  }, [rides, searchQuery, statusFilter, sortBy]);

  // Compute timing intervals for selected ride
  const timings = useMemo(() => {
    if (!selectedRide) return null;
    const acceptDuration = formatDuration(selectedRide.createdAt, selectedRide.acceptedAt);
    const reachDuration = formatDuration(selectedRide.acceptedAt, selectedRide.driverArrivedAt);
    const waitDuration = formatDuration(selectedRide.driverArrivedAt, selectedRide.startedAt);
    const inRideDuration = formatDuration(selectedRide.startedAt, selectedRide.completedAt);
    const totalDuration = formatDuration(selectedRide.createdAt, selectedRide.completedAt || selectedRide.cancelledAt);
    const cancelDuration = formatDuration(selectedRide.createdAt, selectedRide.cancelledAt);

    return {
      acceptDuration,
      reachDuration,
      waitDuration,
      inRideDuration,
      totalDuration,
      cancelDuration
    };
  }, [selectedRide]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-cairo text-slate-900 dark:text-white flex items-center gap-2">
            <Route className="w-7 h-7 text-rukoob-gold" />
            سجل ومراقبة الرحلات
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            متابعة المسافات المقطوعة بدقة، مراحل الرحلة خطوة بخطوة، توقيتات وصول الكابتن، والبيانات المالية
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Active Rides Only Toggle */}
          <button
            onClick={() => {
              setOnlyActive(!onlyActive);
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              onlyActive
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-slate-700 dark:text-slate-300 hover:border-amber-500'
            }`}
          >
            <Activity className={`w-4 h-4 ${onlyActive ? 'animate-pulse' : ''}`} />
            <span>الرحلات الحية فقط</span>
          </button>

          <button
            onClick={fetchRides}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-rukoob-forest/40 hover:bg-slate-200 dark:hover:bg-rukoob-forest text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-rukoob-forest/60 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-glass p-4 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث برقم الرحلة، اسم الراكب، اسم الكابتن، أو العنوان..."
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

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2 bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-slate-300 rounded-xl focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-bold cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">جارية الآن (Active)</option>
              <option value="completed">مكتملة (Completed)</option>
              <option value="accepted">مقبولة (Accepted)</option>
              <option value="cancelled">ملغاة (Cancelled)</option>
              <option value="requested">طلب جديد (Searching)</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2 bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-xs text-slate-900 dark:text-slate-300 rounded-xl focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold font-bold cursor-pointer"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="oldest">الأقدم أولاً</option>
              <option value="dist_high">المسافة (الأطول أولاً)</option>
              <option value="dist_low">المسافة (الأقصر أولاً)</option>
              <option value="fare_high">الأعلى سعراً</option>
              <option value="fare_low">الأقل سعراً</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Rides Table + Step-by-Step Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Rides Table */}
        <div className="lg:col-span-6 card-glass rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-rukoob-forest/30 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              قائمة الرحلات ({filteredRides.length})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              المسافة والأجرة ومراحل السير
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-rukoob-forest/30 bg-slate-50 dark:bg-rukoob-darker/60 text-slate-600 dark:text-slate-400 font-bold">
                  <th className="py-3 px-3">رقم الرحلة</th>
                  <th className="py-3 px-3">الراكب / الكابتن</th>
                  <th className="py-3 px-3">المسار</th>
                  <th className="py-3 px-3">المسافة</th>
                  <th className="py-3 px-3">الأجرة</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3 text-center">عرض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-rukoob-forest/20">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rukoob-gold" />
                      <span>جاري تحميل سجل الرحلات...</span>
                    </td>
                  </tr>
                ) : filteredRides.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      لا توجد رحلات تطابق معايير البحث
                    </td>
                  </tr>
                ) : (
                  filteredRides.map((ride) => {
                    const isSelected = selectedRide?.id === ride.id;
                    const distanceKm = getRideDistanceKm(ride);

                    return (
                      <tr
                        key={ride.id}
                        onClick={() => setSelectedRide(ride)}
                        className={`cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'bg-amber-500/10 dark:bg-rukoob-gold/15 border-l-4 border-amber-500 dark:border-rukoob-gold font-semibold'
                            : 'hover:bg-slate-50 dark:hover:bg-rukoob-forest/20'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          #{ride.id.substring(0, 7)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white truncate max-w-[110px]">
                            {ride.passengerName || 'راكب'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                            {ride.driverName ? `كابتن: ${ride.driverName}` : 'بانتظار سائق'}
                          </div>
                        </td>
                        <td className="py-3 px-3 max-w-[130px]">
                          <div className="truncate text-slate-700 dark:text-slate-300 font-medium">
                            من: {ride.pickup?.address || 'غير محدد'}
                          </div>
                          <div className="truncate text-slate-500 text-[11px]">
                            إلى: {ride.destination?.address || 'غير محدد'}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold font-mono text-xs">
                            <Navigation className="w-3 h-3 text-emerald-500" />
                            <span>{distanceKm} كم</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold font-outfit text-slate-900 dark:text-white whitespace-nowrap">
                          {ride.finalPrice || ride.offeredPrice || 0} ج.م
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {getStatusBadge(ride.status)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRide(ride);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-amber-500 text-white dark:bg-rukoob-gold dark:text-rukoob-dark'
                                : 'bg-slate-100 dark:bg-rukoob-forest/30 hover:bg-rukoob-gold/20 text-slate-600 dark:text-slate-300 hover:text-rukoob-gold'
                            }`}
                            title="عرض تفاصيل ومراحل الرحلة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Component */}
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

        {/* Selected Ride Detailed Breakdown & Timeline */}
        <div className="lg:col-span-6 space-y-4">
          {selectedRide ? (
            <div className="card-glass rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 p-5 space-y-5 sticky top-4 shadow-md">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-rukoob-forest/30">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-cairo">
                      تفاصيل ومراحل الرحلة #{selectedRide.id.substring(0, 8)}
                    </h3>
                    {getStatusBadge(selectedRide.status)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(selectedRide.createdAt)} - {formatTime(selectedRide.createdAt)}</span>
                  </p>
                </div>

                {/* Prominent Distance Badge */}
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-bold font-mono text-xs shadow-sm">
                  <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{getRideDistanceKm(selectedRide)} كم</span>
                </div>
              </div>

              {/* Timing & Distance Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {/* 1. Reach Time */}
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold mb-0.5 flex items-center justify-center gap-1">
                    <Timer className="w-3 h-3" />
                    <span>سرعة الوصول للراكب</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    {timings?.reachDuration || (selectedRide.driverArrivedAt ? 'متوفر' : 'قيد الانتظار')}
                  </div>
                </div>

                {/* 2. Wait Time */}
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold mb-0.5 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>مدة ركوب العميل</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    {timings?.waitDuration || (selectedRide.startedAt ? 'متوفر' : 'قيد الانتظار')}
                  </div>
                </div>

                {/* 3. In-Ride Duration */}
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold mb-0.5 flex items-center justify-center gap-1">
                    <Route className="w-3 h-3" />
                    <span>مدة السير بالطريق</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    {timings?.inRideDuration || (selectedRide.status === 5 ? 'جارية الآن' : 'غير مكتملة')}
                  </div>
                </div>

                {/* 4. Distance */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold mb-0.5 flex items-center justify-center gap-1">
                    <Compass className="w-3 h-3" />
                    <span>المسافة الإجمالية</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {getRideDistanceKm(selectedRide)} كم
                  </div>
                </div>
              </div>

              {/* Route Map Preview with Distance Overlay */}
              <div className="h-56 rounded-xl overflow-hidden border border-slate-200 dark:border-rukoob-forest/40 shadow-inner relative">
                <TripRouteMap
                  pickup={selectedRide.pickup ? { lat: selectedRide.pickup.latitude, lng: selectedRide.pickup.longitude, address: selectedRide.pickup.address } : undefined}
                  dropoff={selectedRide.destination ? { lat: selectedRide.destination.latitude, lng: selectedRide.destination.longitude, address: selectedRide.destination.address } : undefined}
                />
                {/* Overlay Badge */}
                <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-white/90 dark:bg-rukoob-darker/90 backdrop-blur-md rounded-lg border border-slate-200 dark:border-rukoob-forest/60 text-xs font-bold font-mono text-slate-900 dark:text-white shadow-sm flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-rukoob-gold" />
                  <span>المسافة: {getRideDistanceKm(selectedRide)} كم</span>
                </div>
              </div>

              {/* Step-by-Step Chronological Journey Timeline */}
              <div className="space-y-3 bg-slate-50 dark:bg-rukoob-darker/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rukoob-gold" />
                    <span>مراحل الرحلة خطوة بخطوة (Journey Audit Trail)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">المسافة: {getRideDistanceKm(selectedRide)} كم</span>
                </div>

                <div className="space-y-4 relative pr-4 before:absolute before:right-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700/80">
                  {/* Step 1: Ride Requested */}
                  <div className="relative flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 ring-4 ring-white dark:ring-rukoob-darker -mr-2 mt-0.5">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0 bg-white dark:bg-rukoob-dark/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">1. إنشاء طلب الرحلة (طلب الراكب)</span>
                        <span className="text-[11px] font-mono text-slate-500">{formatTime(selectedRide.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                        طلب الراكب: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRide.passengerName || 'عميل ركوب'}</span>
                        {' '}| السعر المعروض: <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">{selectedRide.offeredPrice || 0} ج.م</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        من: {selectedRide.pickup?.address || 'غير محدد'} ➔ إلى: {selectedRide.destination?.address || 'غير محدد'} (المسافة: {getRideDistanceKm(selectedRide)} كم)
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Driver Accepted */}
                  <div className="relative flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ring-4 ring-white dark:ring-rukoob-darker -mr-2 mt-0.5 ${
                      selectedRide.acceptedAt
                        ? 'bg-emerald-500 text-white'
                        : selectedRide.status >= 2
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {selectedRide.acceptedAt ? '✓' : '2'}
                    </div>
                    <div className="flex-1 min-w-0 bg-white dark:bg-rukoob-dark/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">2. قبول الكابتن للطلب</span>
                        <span className="text-[11px] font-mono text-slate-500">{formatTime(selectedRide.acceptedAt)}</span>
                      </div>
                      {selectedRide.acceptedAt ? (
                        <div className="mt-1 space-y-0.5 text-[11px]">
                          <p className="text-slate-600 dark:text-slate-400">
                            الكابتن المعين: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRide.driverName || 'كابتن معتمد'}</span>
                            {selectedRide.driverVehicle && (
                              <span className="text-slate-500 font-mono"> ({selectedRide.driverVehicle.make} {selectedRide.driverVehicle.model} - {selectedRide.driverVehicle.licensePlate})</span>
                            )}
                          </p>
                          {timings?.acceptDuration && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              ⚡ استغرق القبول: {timings.acceptDuration}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-1">
                          {selectedRide.status === 7 || selectedRide.status === 8 ? 'تم الإلغاء قبل قبول أي كابتن' : 'في انتظار موافقة كابتن مناسب...'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Driver Arrived at Pickup */}
                  <div className="relative flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ring-4 ring-white dark:ring-rukoob-darker -mr-2 mt-0.5 ${
                      selectedRide.driverArrivedAt
                        ? 'bg-emerald-500 text-white'
                        : selectedRide.status >= 4
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {selectedRide.driverArrivedAt ? '✓' : '3'}
                    </div>
                    <div className="flex-1 min-w-0 bg-white dark:bg-rukoob-dark/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">3. وصول الكابتن لموقع الركوب</span>
                        <span className="text-[11px] font-mono text-slate-500">{formatTime(selectedRide.driverArrivedAt)}</span>
                      </div>
                      {selectedRide.driverArrivedAt ? (
                        <div className="mt-1 space-y-0.5 text-[11px]">
                          <p className="text-slate-600 dark:text-slate-400">
                            وصل الكابتن إلى نقطة الالتقاء وأرسل إشعاراً للراكب بالانتظار.
                          </p>
                          {timings?.reachDuration && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                              🚗 استغرق الوصول للراكب: {timings.reachDuration}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-1">
                          {selectedRide.status === 7 || selectedRide.status === 8 ? 'تم الإلغاء قبل الوصول للراكب' : 'الكابتن في الطريق إلى موقع الركوب...'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Ride Started / Passenger Boarded */}
                  <div className="relative flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ring-4 ring-white dark:ring-rukoob-darker -mr-2 mt-0.5 ${
                      selectedRide.startedAt
                        ? 'bg-emerald-500 text-white'
                        : selectedRide.status === 5
                        ? 'bg-purple-500 text-white animate-pulse'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {selectedRide.startedAt ? '✓' : '4'}
                    </div>
                    <div className="flex-1 min-w-0 bg-white dark:bg-rukoob-dark/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">4. ركوب العميل وبدء التحرك</span>
                        <span className="text-[11px] font-mono text-slate-500">{formatTime(selectedRide.startedAt)}</span>
                      </div>
                      {selectedRide.startedAt ? (
                        <div className="mt-1 space-y-0.5 text-[11px]">
                          <p className="text-slate-600 dark:text-slate-400">
                            بدأت الرحلة بنجاح وجاري التوجه إلى الوجهة النهائية (مسافة: {getRideDistanceKm(selectedRide)} كم).
                          </p>
                          {timings?.waitDuration && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                              ⏳ مدة انتظار الراكب عند الركوب: {timings.waitDuration}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-1">
                          لم تبدأ الرحلة بعد على الطريق.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 5: Completed OR Cancelled */}
                  {selectedRide.status === 7 || selectedRide.status === 8 || selectedRide.cancelledAt ? (
                    <div className="relative flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 ring-4 ring-white dark:ring-rukoob-darker -mr-2 mt-0.5">
                        ✕
                      </div>
                      <div className="flex-1 min-w-0 bg-rose-50/80 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-xs">
                        <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 font-bold">
                          <span>5. تم إلغاء الرحلة</span>
                          <span className="text-[11px] font-mono">{formatTime(selectedRide.cancelledAt)}</span>
                        </div>
                        <div className="mt-1 space-y-1 text-[11px] text-rose-700 dark:text-rose-300">
                          <p>
                            ألغيت بواسطة: <span className="font-bold">{selectedRide.cancelledBy || 'غير محدد'}</span>
                          </p>
                          {selectedRide.cancellationReason && (
                            <p className="bg-white/60 dark:bg-rose-900/40 p-1.5 rounded border border-rose-200/60 dark:border-rose-800/40">
                              سبب الإلغاء: {selectedRide.cancellationReason}
                            </p>
                          )}
                          {timings?.cancelDuration && (
                            <p className="text-[10px] font-mono">
                              الوقت حتى الإلغاء من بداية الطلب: {timings.cancelDuration}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ring-4 ring-white dark:ring-rukoob-darker -mr-2 mt-0.5 ${
                        selectedRide.completedAt || selectedRide.status === 6
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {selectedRide.completedAt || selectedRide.status === 6 ? '✓' : '5'}
                      </div>
                      <div className="flex-1 min-w-0 bg-white dark:bg-rukoob-dark/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">5. اكتمال الرحلة والوصول للوجهة</span>
                          <span className="text-[11px] font-mono text-slate-500">{formatTime(selectedRide.completedAt)}</span>
                        </div>
                        {selectedRide.completedAt || selectedRide.status === 6 ? (
                          <div className="mt-1 space-y-1 text-[11px]">
                            <p className="text-slate-600 dark:text-slate-400">
                              وصل الراكب إلى وجهته بسلام وتم تسديد الأجرة بنجاح بعد قطع مسافة {getRideDistanceKm(selectedRide)} كم.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {timings?.inRideDuration && (
                                <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                                  🛣️ مدة السير: {timings.inRideDuration}
                                </span>
                              )}
                              {timings?.totalDuration && (
                                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                  🏁 إجمالي الرحلة: {timings.totalDuration}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-1">
                            الرحلة لم تنتهِ بعد.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Passenger & Driver Quick Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Passenger */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-rukoob-forest/20 border border-slate-200 dark:border-rukoob-forest/40">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-rukoob-gold" />
                      <span>الراكب</span>
                    </div>
                    {selectedRide.passengerRating > 0 && (
                      <span className="font-bold text-amber-500 font-mono">★ {selectedRide.passengerRating}</span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white block truncate">
                    {selectedRide.passengerName || 'عميل ركوب'}
                  </span>
                  {selectedRide.passengerPhone && (
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                      {selectedRide.passengerPhone}
                    </span>
                  )}
                </div>

                {/* Driver */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-rukoob-forest/20 border border-slate-200 dark:border-rukoob-forest/40">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-rukoob-gold" />
                      <span>الكابتن</span>
                    </div>
                    {selectedRide.driverRating && selectedRide.driverRating > 0 && (
                      <span className="font-bold text-amber-500 font-mono">★ {selectedRide.driverRating}</span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white block truncate">
                    {selectedRide.driverName || 'بانتظار قبول سائق'}
                  </span>
                  {selectedRide.driverPhone && (
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                      {selectedRide.driverPhone}
                    </span>
                  )}
                </div>
              </div>

              {/* Financial & Distance Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-rukoob-darker/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-bold">
                    <Compass className="w-3.5 h-3.5 text-emerald-500" />
                    <span>المسافة المقطوعة / المقدرة:</span>
                  </span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                    {getRideDistanceKm(selectedRide)} كم
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>السعر المقترح من الراكب:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {selectedRide.offeredPrice || 0} ج.م
                  </span>
                </div>
                {selectedRide.finalPrice && selectedRide.finalPrice !== selectedRide.offeredPrice && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>السعر النهائي المتفق عليه:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {selectedRide.finalPrice} ج.م
                    </span>
                  </div>
                )}
                {selectedRide.commissionAmount && (
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>عمولة منصة ركوب (5%):</span>
                    <span className="font-mono text-rukoob-gold font-semibold">
                      +{selectedRide.commissionAmount} ج.م
                    </span>
                  </div>
                )}
                {selectedRide.driverEarning && (
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>صافي أرباح الكابتن:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {selectedRide.driverEarning} ج.م
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>الأجرة الكلية:</span>
                  <span className="font-outfit text-emerald-600 dark:text-emerald-400 text-base">
                    {selectedRide.finalPrice || selectedRide.offeredPrice || 0} ج.م
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-glass rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 p-12 text-center text-slate-400 space-y-2">
              <Navigation className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs">اختر أي رحلة من الجدول لعرض المسافة والمراحل الزمنية خطوة بخطوة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
