import React, { useEffect, useState, useMemo } from 'react';
import {
  Car,
  Route,
  ShieldCheck,
  Radio,
  Banknote,
  Users,
  ArrowUpRight,
  RefreshCw,
  Filter,
  DollarSign,
  Percent,
  Clock,
  Compass,
  MapPin,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Wallet,
  TrendingUp,
  Hourglass,
  CheckCircle,
  Activity,
  Layers,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { AdminService } from '../api/adminService';
import { AdminDashboardDto, RideDto } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

// Haversine formula to compute exact distance in Km between coordinates
const calculateHaversineDistance = (
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Formats messy raw coordinates or placeholders into readable location names
const cleanAddress = (addr?: string | null): string => {
  if (!addr) return 'موقع غير محدد';
  const trimmed = addr.trim();
  if (trimmed.includes('اسحب الخريطة')) {
    return 'موقع محدد على الخريطة';
  }
  const match = trimmed.match(/(?:نقطة على الخريطة\s*)?\((\d+\.\d{2})\d*,\s*(\d+\.\d{2})\d*\)/);
  if (match) {
    return `إحداثيات (${match[1]}, ${match[2]})`;
  }
  return trimmed;
};

export const Overview: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardDto | null>(null);
  const [allRides, setAllRides] = useState<RideDto[]>([]);
  const [appCommissionRate, setAppCommissionRate] = useState<number>(0.08);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Filters for Advanced Analytics
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [specificDate, setSpecificDate] = useState<string>(''); // Exact date filter 'YYYY-MM-DD'
  const [vehicleType, setVehicleType] = useState<'all' | 'car' | 'moto'>('all');
  const [regionFilter, setRegionFilter] = useState<'all' | 'downtown' | 'corniche' | 'sahari' | 'airport'>('all');
  const [chartMetric, setChartMetric] = useState<'rides' | 'revenue'>('rides');

  const { addNotification } = useNotifications();

  const fetchData = async () => {
    try {
      const [dashData, ridesData, settingsData] = await Promise.all([
        AdminService.getDashboard(),
        AdminService.getRides(1, 1000),
        AdminService.getSettings().catch(() => []),
      ]);
      setStats(dashData);
      setAllRides(ridesData.items || []);

      // Read live platform commission rate from platform settings or dashboard stats
      const commSetting = Array.isArray(settingsData)
        ? settingsData.find((s) => s.key === 'DefaultCommissionRate')
        : undefined;
      if (commSetting && commSetting.value) {
        const parsed = parseFloat(commSetting.value.replace('%', '').trim());
        if (!isNaN(parsed) && parsed > 0) {
          setAppCommissionRate(parsed > 1 ? parsed / 100 : parsed);
        }
      } else if (dashData.defaultCommissionRate) {
        setAppCommissionRate(
          dashData.defaultCommissionRate > 1
            ? dashData.defaultCommissionRate / 100
            : dashData.defaultCommissionRate
        );
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'خطأ في جلب البيانات',
        message: 'تعذر تحميل بيانات لوحة التحكم من السيرفر المباشر',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 40 seconds to stay aligned with backend active passengers background service
    const interval = setInterval(() => {
      fetchData();
    }, 40000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleResetFilters = () => {
    setTimeRange('all');
    setSpecificDate('');
    setVehicleType('all');
    setRegionFilter('all');
  };

  const isAnyFilterActive = timeRange !== 'all' || !!specificDate || vehicleType !== 'all' || regionFilter !== 'all';
  const isDayFilterActive = timeRange === 'today' || !!specificDate;

  // 100% Real data filtering on active rides
  const filteredRidesList = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    return allRides.filter((ride) => {
      // 1. Real Date Range Filter
      if (ride.createdAt) {
        const rideDate = new Date(ride.createdAt);
        const rideTime = rideDate.getTime();

        if (specificDate) {
          const y = rideDate.getFullYear();
          const m = String(rideDate.getMonth() + 1).padStart(2, '0');
          const d = String(rideDate.getDate()).padStart(2, '0');
          const formattedDate = `${y}-${m}-${d}`;
          if (formattedDate !== specificDate) return false;
        } else if (timeRange === 'today') {
          if (rideTime < startOfToday) return false;
        } else if (timeRange === 'week') {
          if (rideTime < sevenDaysAgo) return false;
        } else if (timeRange === 'month') {
          if (rideTime < thirtyDaysAgo) return false;
        }
      }

      // 2. Real Vehicle Type Filter (1: Car / Sedan, 4: Motorcycle)
      const isMoto =
        ride.driverVehicle?.vehicleType === 4 ||
        (ride.driverVehicle?.make && (
          ride.driverVehicle.make.toLowerCase().includes('moto') ||
          ride.driverVehicle.make.toLowerCase().includes('hojan') ||
          ride.driverVehicle.make.toLowerCase().includes('dayun') ||
          ride.driverVehicle.make.toLowerCase().includes('hawa')
        ));

      if (vehicleType === 'car') {
        if (isMoto) return false;
        if (ride.driverVehicle && ride.driverVehicle.vehicleType !== 1) return false;
      } else if (vehicleType === 'moto') {
        if (!isMoto) return false;
      }

      // 3. Real Region Filter
      if (regionFilter !== 'all') {
        const addr = ((ride.pickup?.address || '') + ' ' + (ride.destination?.address || '')).toLowerCase();
        if (regionFilter === 'downtown' && !addr.includes('محطة') && !addr.includes('سوق') && !addr.includes('بلد') && !addr.includes('شارع')) return false;
        if (regionFilter === 'corniche' && !addr.includes('كورنيش') && !addr.includes('نيل') && !addr.includes('فندق')) return false;
        if (regionFilter === 'sahari' && !addr.includes('جامعة') && !addr.includes('صحاري') && !addr.includes('أكاديم')) return false;
        if (regionFilter === 'airport' && !addr.includes('مطار') && !addr.includes('سهيل') && !addr.includes('نوبي')) return false;
      }

      return true;
    });
  }, [allRides, timeRange, specificDate, vehicleType, regionFilter]);

  // Real Subsets
  const completedRides = useMemo(() => {
    return filteredRidesList.filter((r) => r.status === 6 || !!r.completedAt);
  }, [filteredRidesList]);

  const activeRides = useMemo(() => {
    return filteredRidesList.filter(
      (r) => (r.status === 5 || r.status === 4 || r.status === 3 || r.status === 2) && !r.completedAt && !r.cancelledAt
    );
  }, [filteredRidesList]);

  const cancelledRides = useMemo(() => {
    return filteredRidesList.filter((r) => r.status === 7 || r.status === 8 || !!r.cancelledAt);
  }, [filteredRidesList]);

  const pendingRides = useMemo(() => {
    return filteredRidesList.filter((r) => (r.status === 1 || r.status === 0) && !r.completedAt && !r.cancelledAt);
  }, [filteredRidesList]);

  // Real GMV: Gross Merchandise Value MUST only include completed transactions (and ongoing active rides).
  const calculatedGMV = useMemo(() => {
    if (timeRange === 'all' && !specificDate && vehicleType === 'all' && regionFilter === 'all' && stats?.totalRideValue) {
      return stats.totalRideValue;
    }
    const sumCompleted = completedRides.reduce((acc, r) => acc + (r.finalPrice || r.offeredPrice || 0), 0);
    const sumActive = activeRides.reduce((acc, r) => acc + (r.finalPrice || r.offeredPrice || 0), 0);
    return sumCompleted + sumActive;
  }, [completedRides, activeRides, timeRange, specificDate, vehicleType, regionFilter, stats]);

  // App configured percentage
  const appCommissionPercent = useMemo(() => {
    return Math.round(appCommissionRate * 100);
  }, [appCommissionRate]);

  // Real Commission: Platform fee collected strictly from completed rides using dynamic app commission rate
  const calculatedCommission = useMemo(() => {
    if (timeRange === 'all' && !specificDate && vehicleType === 'all' && regionFilter === 'all' && stats?.platformCommission) {
      return Math.round(stats.platformCommission * 10) / 10;
    }
    const sum = completedRides.reduce((acc, r) => {
      if (typeof r.commissionAmount === 'number' && r.commissionAmount > 0) {
        return acc + r.commissionAmount;
      }
      const price = r.finalPrice || r.offeredPrice || 0;
      return acc + (price * (r.commissionRate || appCommissionRate));
    }, 0);
    return Math.round(sum * 10) / 10;
  }, [completedRides, timeRange, specificDate, vehicleType, regionFilter, stats, appCommissionRate]);

  // Real Driver Net Earnings: GMV minus Platform Commission
  const driverNetEarnings = useMemo(() => {
    return Math.max(0, Math.round((calculatedGMV - calculatedCommission) * 10) / 10);
  }, [calculatedGMV, calculatedCommission]);

  // Real Effective Commission Percentage for the filtered period / day
  const effectiveCommissionRate = useMemo(() => {
    if (calculatedGMV > 0 && calculatedCommission > 0) {
      return ((calculatedCommission / calculatedGMV) * 100).toFixed(1);
    }
    return appCommissionPercent.toString();
  }, [calculatedGMV, calculatedCommission, appCommissionPercent]);

  // Real Ride Counts
  const totalCalculatedRides = useMemo(() => {
    if (filteredRidesList.length === 0 && timeRange === 'all' && !specificDate && vehicleType === 'all' && regionFilter === 'all') {
      return (stats?.completedRides || 0) + (stats?.activeRides || 0) + (stats?.cancelledRides || 0);
    }
    return filteredRidesList.length;
  }, [filteredRidesList, timeRange, specificDate, vehicleType, regionFilter, stats]);

  const calculatedCompletedRidesCount = useMemo(() => {
    if (timeRange === 'all' && !specificDate && vehicleType === 'all' && regionFilter === 'all' && stats?.completedRides !== undefined) {
      return stats.completedRides;
    }
    return completedRides.length;
  }, [completedRides, timeRange, specificDate, vehicleType, regionFilter, stats]);

  const calculatedActiveRidesCount = useMemo(() => {
    if (timeRange === 'all' && !specificDate && vehicleType === 'all' && regionFilter === 'all' && stats?.activeRides !== undefined) {
      return stats.activeRides;
    }
    return activeRides.length;
  }, [activeRides, timeRange, specificDate, vehicleType, regionFilter, stats]);

  const calculatedCancelledRidesCount = useMemo(() => {
    if (timeRange === 'all' && !specificDate && vehicleType === 'all' && regionFilter === 'all' && stats?.cancelledRides !== undefined) {
      return stats.cancelledRides;
    }
    return cancelledRides.length;
  }, [cancelledRides, timeRange, specificDate, vehicleType, regionFilter, stats]);

  // Share percentages of the filtered day/period compared to platform overall
  const dayGmvShare = useMemo(() => {
    const total = stats?.totalRideValue || 0;
    if (total <= 0 || calculatedGMV <= 0) return '0.0';
    return Math.min(100, (calculatedGMV / total) * 100).toFixed(1);
  }, [calculatedGMV, stats]);

  const dayTripsShare = useMemo(() => {
    const total = stats?.completedRides || 0;
    if (total <= 0 || calculatedCompletedRidesCount <= 0) return '0.0';
    return Math.min(100, (calculatedCompletedRidesCount / total) * 100).toFixed(1);
  }, [calculatedCompletedRidesCount, stats]);

  const dayCommissionShare = useMemo(() => {
    const total = stats?.platformCommission || 0;
    if (total <= 0 || calculatedCommission <= 0) return '0.0';
    return Math.min(100, (calculatedCommission / total) * 100).toFixed(1);
  }, [calculatedCommission, stats]);

  // Real Fulfillment Rate: Completed rides / Finished rides
  const fulfillmentRate = useMemo(() => {
    const finished = calculatedCompletedRidesCount + calculatedCancelledRidesCount;
    if (finished === 0) return calculatedCompletedRidesCount > 0 ? '100.0' : '0.0';
    return ((calculatedCompletedRidesCount / finished) * 100).toFixed(1);
  }, [calculatedCompletedRidesCount, calculatedCancelledRidesCount]);

  // Real Average Order Value (AOV): GMV divided by completed rides
  const averageTripValue = useMemo(() => {
    if (calculatedCompletedRidesCount === 0) {
      return 0;
    }
    return Math.round(calculatedGMV / calculatedCompletedRidesCount);
  }, [calculatedGMV, calculatedCompletedRidesCount]);

  // Real Average Driver Arrival Time (ETA): calculated from actual acceptedAt -> driverArrivedAt timestamps
  const averageEta = useMemo(() => {
    const diffs: number[] = [];
    filteredRidesList.forEach((r) => {
      if (r.acceptedAt && r.driverArrivedAt) {
        const diffMs = new Date(r.driverArrivedAt).getTime() - new Date(r.acceptedAt).getTime();
        const diffSec = diffMs / 1000;
        if (diffSec > 0 && diffSec < 7200) {
          diffs.push(diffSec);
        }
      }
    });

    if (diffs.length === 0) {
      return { value: '—', subtitle: 'لا تتوفر توقيتات وصول في هذه الفترة' };
    }

    const avgSec = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    if (avgSec < 60) {
      return {
        value: `${Math.round(avgSec)} ثانية`,
        subtitle: `حساب فعلي من ${diffs.length} رحلة`
      };
    }
    return {
      value: `${(avgSec / 60).toFixed(1)} دقيقة`,
      subtitle: `حساب فعلي من ${diffs.length} رحلة`
    };
  }, [filteredRidesList]);

  // Real Acceptance Rate: Percentage of ride requests accepted by a driver
  const acceptanceRate = useMemo(() => {
    if (filteredRidesList.length === 0) return '0.0';
    const acceptedCount = filteredRidesList.filter(
      (r) => !!r.acceptedAt || !!r.driverId || (r.status >= 2 && r.status !== 1 && r.status !== 0)
    ).length;
    return ((acceptedCount / filteredRidesList.length) * 100).toFixed(1);
  }, [filteredRidesList]);

  // Real Average Trip Distance: calculated using Haversine formula on pickup and destination coordinates
  const averageDistance = useMemo(() => {
    const distances: number[] = [];
    filteredRidesList.forEach((r) => {
      let d = r.distanceKm;
      if (!d || d <= 0) {
        d = calculateHaversineDistance(
          r.pickup?.latitude,
          r.pickup?.longitude,
          r.destination?.latitude,
          r.destination?.longitude
        );
      }
      if (d > 0) {
        distances.push(d);
      }
    });

    if (distances.length === 0) return '0.0';
    const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
    return avg.toFixed(1);
  }, [filteredRidesList]);

  // Real Hourly / Daily Trend Chart Data from actual rides
  const trendData = useMemo(() => {
    if (timeRange === 'today' || specificDate) {
      const hours = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00'];
      return hours.map((hourLabel) => {
        const hourNum = parseInt(hourLabel.split(':')[0], 10);
        const matched = filteredRidesList.filter((r) => {
          const d = new Date(r.createdAt);
          return Math.abs(d.getHours() - hourNum) <= 1;
        });
        const ridesCount = matched.length;
        const revenue = matched
          .filter((r) => r.status === 6 || !!r.completedAt)
          .reduce((acc, r) => acc + (r.finalPrice || r.offeredPrice || 0), 0);
        return { time: hourLabel, rides: ridesCount, revenue };
      });
    }

    if (timeRange === 'week') {
      const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      const dayMap: Record<number, string> = { 6: 'السبت', 0: 'الأحد', 1: 'الإثنين', 2: 'الثلاثاء', 3: 'الأربعاء', 4: 'الخميس', 5: 'الجمعة' };
      return days.map((dayName) => {
        const matched = filteredRidesList.filter((r) => {
          const d = new Date(r.createdAt);
          return dayMap[d.getDay()] === dayName;
        });
        const ridesCount = matched.length;
        const revenue = matched
          .filter((r) => r.status === 6 || !!r.completedAt)
          .reduce((acc, r) => acc + (r.finalPrice || r.offeredPrice || 0), 0);
        return { time: dayName, rides: ridesCount, revenue };
      });
    }

    // Month or All Time: Group into 4 time buckets
    const now = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const buckets = [
      { label: 'منذ شهر', from: now - 4 * oneWeek, to: now - 3 * oneWeek },
      { label: 'منذ 3 أسابيع', from: now - 3 * oneWeek, to: now - 2 * oneWeek },
      { label: 'منذ أسبوعين', from: now - 2 * oneWeek, to: now - oneWeek },
      { label: 'هذا الأسبوع', from: now - oneWeek, to: now + oneWeek },
    ];

    return buckets.map((b) => {
      const matched = filteredRidesList.filter((r) => {
        const t = new Date(r.createdAt).getTime();
        return t >= b.from && t < b.to;
      });
      const ridesCount = matched.length;
      const revenue = matched
        .filter((r) => r.status === 6 || !!r.completedAt)
        .reduce((acc, r) => acc + (r.finalPrice || r.offeredPrice || 0), 0);
      return { time: b.label, rides: ridesCount, revenue };
    });
  }, [filteredRidesList, timeRange, specificDate]);

  // Real Fleet Split based solely on assigned vehicle rides
  const vehicleSplitData = useMemo(() => {
    let cars = 0;
    let motos = 0;

    filteredRidesList.forEach((r) => {
      if (!r.driverVehicle) return;
      const isMoto =
        r.driverVehicle.vehicleType === 4 ||
        (r.driverVehicle.make && (
          r.driverVehicle.make.toLowerCase().includes('moto') ||
          r.driverVehicle.make.toLowerCase().includes('hojan') ||
          r.driverVehicle.make.toLowerCase().includes('dayun') ||
          r.driverVehicle.make.toLowerCase().includes('hawa')
        ));
      if (isMoto) motos++;
      else cars++;
    });

    if (vehicleType === 'car') {
      return [{ name: 'سيارة ملاكي (Cars)', value: cars, color: '#1B4D3E' }];
    }
    if (vehicleType === 'moto') {
      return [{ name: 'موتوسيكل (Motorcycle)', value: motos, color: '#C5A880' }];
    }

    return [
      { name: 'سيارات ملاكي (Cars)', value: cars, color: '#1B4D3E' },
      { name: 'دراجات نارية (Motorcycles)', value: motos, color: '#C5A880' },
    ];
  }, [filteredRidesList, vehicleType]);

  const totalAssignedVehicles = useMemo(() => {
    return vehicleSplitData.reduce((acc, v) => acc + v.value, 0);
  }, [vehicleSplitData]);

  // Real Popular Routes from actual rides
  const popularRoutes = useMemo(() => {
    const routeCounts: Record<string, { from: string; to: string; count: number; totalFare: number }> = {};

    filteredRidesList.forEach((r) => {
      const from = cleanAddress(r.pickup?.address);
      const to = cleanAddress(r.destination?.address);
      const key = `${from}➔${to}`;
      if (!routeCounts[key]) {
        routeCounts[key] = { from, to, count: 0, totalFare: 0 };
      }
      routeCounts[key].count++;
      routeCounts[key].totalFare += (r.finalPrice || r.offeredPrice || 0);
    });

    const sorted = Object.values(routeCounts).sort((a, b) => b.count - a.count);
    if (sorted.length > 0) {
      return sorted.slice(0, 4).map((item, idx) => {
        const percent = Math.round((item.count / Math.max(1, filteredRidesList.length)) * 100);
        const avgFare = Math.round(item.totalFare / item.count);
        return {
          ...item,
          subtitle: `${percent}% من الطلبات (${avgFare} ج.م متوسط)`,
          tag: idx === 0 ? 'الأعلى طلباً' : idx === 1 ? 'خط رئيسي' : 'نشط'
        };
      });
    }

    return [
      { from: 'محطة قطار أسوان', to: 'كورنيش النيل والفنادق', count: 0, subtitle: 'لا توجد رحلات', tag: 'خامل' },
    ];
  }, [filteredRidesList]);

  // Donut Chart Status Breakdown from real data
  const tripStatusData = useMemo(() => {
    const data = [
      { name: 'مكتملة', value: calculatedCompletedRidesCount, color: '#10B981' },
      { name: 'نشطة حالياً', value: calculatedActiveRidesCount, color: '#3B82F6' },
      { name: 'ملغاة', value: calculatedCancelledRidesCount, color: '#EF4444' },
    ];
    if (pendingRides.length > 0) {
      data.push({ name: 'قيد البحث', value: pendingRides.length, color: '#F59E0B' });
    }
    return data;
  }, [calculatedCompletedRidesCount, calculatedActiveRidesCount, calculatedCancelledRidesCount, pendingRides]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-rukoob-forest dark:border-rukoob-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Exact core numbers from /api/Admin/dashboard
  const totalTripsOfficial = (stats.completedRides || 0) + (stats.activeRides || 0) + (stats.cancelledRides || 0);
  const inactiveDriversOfficial = Math.max(0, (stats.totalDrivers || 0) - (stats.activeDrivers || 0));

  return (
    <div className="space-y-6">
      {/* SECTION 1: OFFICIAL REAL LIVE METRICS (Matching Mobile Admin Exactly) */}
      <div className="space-y-4">
        {/* Top Header Strip with Refresh & Official Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-cairo text-slate-900 dark:text-white flex items-center gap-2.5">
              <Radio className="w-6 h-6 text-emerald-500 animate-pulse" />
              <span>بوابة الإدارة المركزية (Admin) — المؤشرات المباشرة</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              البيانات الحقيقية المسجلة في السيرفر الرسمي لتطبيق ركوب
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Status Pill matching Mobile Screen */}
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-3 shadow-md border border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                مكتملة ({stats.completedRides})
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                جارية ({stats.activeRides})
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                ملغاة ({stats.cancelledRides})
              </span>
            </div>

            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl bg-white dark:bg-rukoob-dark hover:bg-slate-100 dark:hover:bg-rukoob-forest text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-rukoob-forest/60 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
              title="تحديث البيانات اللحظية"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>

        {/* Top 2 Highlight Banners matching mobile cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card A: الملخص المالي لعمليات المنصة 💰 */}
          <div className="bg-[#111A16] dark:bg-[#0B110E] text-white p-5 rounded-2xl border border-emerald-900/40 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-cairo flex items-center gap-2 text-rukoob-gold">
                <span>الملخص المالي لعمليات المنصة 💰</span>
              </h2>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-800/50">
                مباشر من السيرفر
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Box 1: Platform Revenue */}
              <div className="bg-[#1A2621] p-4 rounded-xl border border-emerald-800/30 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>إيرادات المنصة</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                  {stats.totalRideValue.toLocaleString()} ج.م
                </div>
                <div className="text-[10px] text-slate-400">إجمالي قيمة المشاوير المكتملة</div>
              </div>

              {/* Box 2: Net Commission */}
              <div className="bg-[#1A2621] p-4 rounded-xl border border-amber-800/30 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span>صافي العمولات</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 font-mono">
                      عمولة التطبيق: {appCommissionPercent}%
                    </span>
                  </span>
                  <Percent className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tracking-tight">
                  {Math.round(stats.platformCommission).toLocaleString()} ج.م
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>أرباح عمولة ركوب المحصلة</span>
                  <Link to="/settings" className="text-amber-400/80 hover:text-amber-300 underline text-[10px]">
                    تعديل النسبة
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: حالة أسطول الكباتن المسجلين 🚖 */}
          <div className="card-glass p-5 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-cairo text-slate-900 dark:text-white flex items-center gap-2">
                <span>حالة أسطول الكباتن المسجلين 🚖</span>
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                إجمالي {stats.totalDrivers} كابتن
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Online */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block font-bold">متصلين الآن</span>
                <div className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{stats.activeDrivers}</span>
                </div>
              </div>

              {/* Offline */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-rukoob-darker/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block font-bold">غير متصلين</span>
                <div className="text-lg sm:text-xl font-bold font-mono text-slate-700 dark:text-slate-300 mt-1 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>{inactiveDriversOfficial}</span>
                </div>
              </div>

              {/* Pending Verifications */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block font-bold">طلبات جديدة</span>
                <div className="text-lg sm:text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 flex items-center justify-center gap-1.5">
                  <Hourglass className="w-3.5 h-3.5 text-amber-500" />
                  <span>{stats.pendingDriverVerifications}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The 10 Official Core KPI Cards Grid (Direct from Database & Backend Background Service) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. مجموع الكباتن */}
          <div className="card-glass p-4 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">مجموع الكباتن</span>
              <span className="text-xl lg:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                {stats.totalDrivers}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-rukoob-forest/30 flex items-center justify-center text-rukoob-forest dark:text-rukoob-gold">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* 2. كباتن متصلين الآن */}
          <div className="card-glass p-4 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">كباتن متصلين الآن</span>
              <span className="text-xl lg:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                {stats.activeDrivers}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
              <Radio className="w-5 h-5" />
            </div>
          </div>

          {/* 3. إجمالي الركاب المسجلين */}
          <div className="card-glass p-4 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">إجمالي الركاب</span>
              <span className="text-xl lg:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                {stats.totalPassengers}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-rukoob-forest/30 flex items-center justify-center text-purple-500">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* 4. ركاب نشطون الآن (خدمة الباك إند الخلفية كل 40 ثانية) */}
          <div className="card-glass p-4 rounded-xl border border-emerald-500/30 dark:border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block">ركاب نشطون الآن</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className="text-xl lg:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                {stats.activePassengers ?? 0}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">خدمة خلفية بالباك إند (كل 40 ثانية)</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          {/* 5. بانتظار التوثيق */}
          <div className="card-glass p-4 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">بانتظار التوثيق</span>
              <span className="text-xl lg:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 block">
                {stats.pendingDriverVerifications}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* 6. إجمالي المشاوير */}
          <div className="card-glass p-4 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">إجمالي المشاوير</span>
              <span className="text-xl lg:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                {totalTripsOfficial}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-rukoob-forest/30 flex items-center justify-center text-blue-500">
              <Route className="w-5 h-5" />
            </div>
          </div>

          {/* 7. مشاوير جارية */}
          <div className="card-glass p-4 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">مشاوير جارية</span>
              <span className="text-xl lg:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1 block">
                {stats.activeRides}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500">
              <Car className="w-5 h-5" />
            </div>
          </div>

          {/* 8. مشاوير مكتملة */}
          <div className="card-glass p-4 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">مشاوير مكتملة</span>
              <span className="text-xl lg:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                {stats.completedRides}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          {/* 9. مشاوير ملغاة */}
          <div className="card-glass p-4 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">مشاوير ملغاة</span>
              <span className="text-xl lg:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 block">
                {stats.cancelledRides}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          {/* 10. إجمالي الإيرادات */}
          <div className="card-glass p-4 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">إجمالي الإيرادات</span>
              <span className="text-xl lg:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                {stats.totalRideValue.toLocaleString()} ج.م
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ADVANCED ANALYTICAL FILTERS & DEEP DIVE (Optional Drilling) */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-cairo flex items-center gap-2">
              <Layers className="w-5 h-5 text-rukoob-gold" />
              <span>التحليلات التفصيلية والفلاتر الزمنية</span>
            </h2>
            <p className="text-xs text-slate-500">
              تصفية الأرقام والرسوم البيانية حسب الفترات الزمنية، نوع المركبة، والنطاق الجغرافي في أسوان
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Specific Day Picker */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-rukoob-dark rounded-xl border border-slate-200 dark:border-rukoob-forest/50 shadow-sm text-xs">
              <Calendar className="w-3.5 h-3.5 text-rukoob-forest-light dark:text-rukoob-gold shrink-0" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">يوم محدد:</span>
              <input
                type="date"
                value={specificDate}
                onChange={(e) => {
                  setSpecificDate(e.target.value);
                  if (e.target.value) setTimeRange('all');
                }}
                className="bg-transparent text-slate-900 dark:text-white font-bold font-mono text-xs focus:outline-none cursor-pointer"
              />
              {specificDate && (
                <button
                  onClick={() => setSpecificDate('')}
                  className="text-slate-400 hover:text-rose-500 font-bold ml-1 text-xs"
                  title="إلغاء تحديد اليوم"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Time Range Filter Tabs */}
            <div className="bg-white dark:bg-rukoob-dark p-1 rounded-xl border border-slate-200 dark:border-rukoob-forest/50 flex items-center shadow-sm">
              {[
                { id: 'today', label: 'اليوم' },
                { id: 'week', label: 'هذا الأسبوع' },
                { id: 'month', label: 'هذا الشهر' },
                { id: 'all', label: 'كل الأوقات' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTimeRange(t.id as any);
                    if (specificDate) setSpecificDate('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeRange === t.id && !specificDate
                      ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Day of Filtering - Live Percentages & Metrics Ribbon */}
        {isDayFilterActive && (
          <div className="card-glass p-4 rounded-2xl border border-rukoob-gold/40 bg-gradient-to-r from-rukoob-gold/10 via-amber-500/5 to-transparent flex flex-wrap items-center justify-between gap-4 text-xs shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rukoob-gold/20 flex items-center justify-center text-rukoob-gold font-bold shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span>نسب ومؤشرات يوم الفلترة:</span>
                  <span className="text-rukoob-forest-light dark:text-rukoob-gold font-mono font-bold">
                    {specificDate ? specificDate : 'اليوم الحالي'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  عرض تحليلي دقيق لنسبة العمولة الفعلية وحصة يوم الفلترة مقارنة بإجمالي أداء المنصة
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span className="font-sans text-[11px] font-bold">عمولة اليوم:</span>
                <span className="font-bold">{effectiveCommissionRate}%</span>
                <span className="text-[10px] opacity-75 font-sans">(المقررة: {appCommissionPercent}%)</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <span className="font-sans text-[11px] font-bold">حصة اليوم من المبيعات:</span>
                <span className="font-bold">{dayGmvShare}%</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/30 text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <span className="font-sans text-[11px] font-bold">حصة اليوم من الرحلات:</span>
                <span className="font-bold">{dayTripsShare}%</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/30 text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <span className="font-sans text-[11px] font-bold">معدل إنجاز اليوم:</span>
                <span className="font-bold">{fulfillmentRate}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle & Region Segment Ribbon */}
        <div className="card-glass p-3.5 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-rukoob-forest-light dark:text-rukoob-gold" />
              <span>نوع وسيلة النقل:</span>
            </span>
            {[
              { id: 'all', label: 'الكل (سيارات وموتوسيكلات)' },
              { id: 'car', label: 'سيارة ملاكي 🚗' },
              { id: 'moto', label: 'موتوسيكل 🏍️' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setVehicleType(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  vehicleType === cat.id
                    ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark shadow-sm'
                    : 'bg-slate-100 dark:bg-rukoob-forest/20 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-rukoob-forest/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">نطاق المنطقة:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-white dark:bg-rukoob-dark border border-slate-300 dark:border-rukoob-forest/50 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-rukoob-forest dark:focus:border-rukoob-gold cursor-pointer"
            >
              <option value="all">كافة أنحاء أسوان</option>
              <option value="downtown">وسط البلد والمحطة</option>
              <option value="corniche">كورنيش النيل والفنادق</option>
              <option value="sahari">صحاري ومجمع الجامعة</option>
              <option value="airport">مطار أسوان وغرب سهيل</option>
            </select>

            {isAnyFilterActive && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 font-bold flex items-center gap-1"
                title="إعادة ضبط الفلاتر"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtered Primary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={isDayFilterActive ? "قيمة تداول يوم الفلترة (GMV)" : "قيمة التداول المصفاة (GMV)"}
            value={`${calculatedGMV.toLocaleString()} ج.م`}
            subtitle={isDayFilterActive ? `حصة يوم الفلترة: ${dayGmvShare}% من مبيعات المنصة` : "قيمة الرحلات المكتملة في هذا النطاق"}
            icon={Banknote}
            change={isDayFilterActive ? `${dayGmvShare}% من الإجمالي` : "مبيعات المشاوير"}
            isPositive={true}
            iconColor="text-emerald-500"
          />

          <StatCard
            title={isDayFilterActive ? "عمولة المنصة ليوم الفلترة" : "عمولة المنصة المصفاة"}
            value={`${calculatedCommission.toLocaleString()} ج.م`}
            subtitle={`نسبة العمولة: ${effectiveCommissionRate}% (المقررة للتطبيق: ${appCommissionPercent}%)`}
            icon={DollarSign}
            change={`عمولة ${effectiveCommissionRate}%`}
            isPositive={true}
            iconColor="text-rukoob-gold"
          />

          <StatCard
            title={isDayFilterActive ? "صافي مستحقات الكباتن لليوم" : "صافي مستحقات الكباتن"}
            value={`${driverNetEarnings.toLocaleString()} ج.م`}
            subtitle={isDayFilterActive ? `يمثل ${(100 - parseFloat(effectiveCommissionRate)).toFixed(1)}% من إجمالي مبيعات اليوم` : "صافي السائقين بعد العمولة"}
            icon={Wallet}
            change={isDayFilterActive ? `${(100 - parseFloat(effectiveCommissionRate)).toFixed(1)}% للسائقين` : "محافظ السائقين"}
            isPositive={true}
            iconColor="text-emerald-500"
          />

          <StatCard
            title="متوسط قيمة الرحلة (AOV)"
            value={`${averageTripValue} ج.م`}
            subtitle={isDayFilterActive ? `حصة رحلات اليوم: ${dayTripsShare}% (${calculatedCompletedRidesCount} رحلة)` : "متوسط تكلفة الرحلة المكتملة"}
            icon={Percent}
            change={isDayFilterActive ? `${dayTripsShare}% من الرحلات` : "معدل المشوار"}
            isPositive={true}
            iconColor="text-blue-500"
          />
        </div>

        {/* Live Operational Metrics Ribbon (ETA, Acceptance, Distance) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card-glass p-3.5 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">متوسط وقت وصول الكابتن (ETA)</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm text-emerald-600 dark:text-emerald-400">
                {averageEta.value}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{averageEta.subtitle}</span>
            </div>
            <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
          </div>

          <div className="card-glass p-3.5 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">معدل قبول العروض (Acceptance)</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm text-blue-600 dark:text-blue-400">
                {acceptanceRate}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">نسبة قبول السائقين للطلبات</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
          </div>

          <div className="card-glass p-3.5 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">متوسط مسافة المشوار</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm text-amber-600 dark:text-amber-400">
                {averageDistance} كم
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">محسوب بدقة الإحداثيات الفعلية</span>
            </div>
            <Compass className="w-5 h-5 text-amber-500 shrink-0" />
          </div>

          <div className="card-glass p-3.5 rounded-xl border border-slate-200 dark:border-rukoob-forest/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">معدل إنجاز الرحلات</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm text-purple-600 dark:text-purple-400">
                {fulfillmentRate}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">نسبة الرحلات المكتملة بنجاح</span>
            </div>
            <Activity className="w-5 h-5 text-purple-500 shrink-0" />
          </div>
        </div>

        {/* Analytics Charts & Fleet Ratio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Performance Chart */}
          <div className="lg:col-span-8 card-glass p-6 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-cairo">
                  تحليل منحنى النشاط والطلبات الفعلي
                </h3>
                <p className="text-xs text-slate-500">
                  متابعة حركة الطلبات والإيرادات في نطاق: {timeRange === 'today' ? 'اليوم' : timeRange === 'week' ? 'هذا الأسبوع' : timeRange === 'month' ? 'هذا الشهر' : 'كافة الأوقات'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-rukoob-dark rounded-xl border border-slate-200 dark:border-rukoob-forest/50 text-xs">
                <button
                  onClick={() => setChartMetric('rides')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    chartMetric === 'rides'
                      ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  عدد الرحلات
                </button>
                <button
                  onClick={() => setChartMetric('revenue')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    chartMetric === 'revenue'
                      ? 'bg-rukoob-forest dark:bg-rukoob-gold text-white dark:text-rukoob-dark shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  حجم التداول (ج.م)
                </button>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A880" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C5A880" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => chartMetric === 'revenue' ? `${val} ج.م` : val}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      chartMetric === 'revenue' ? `${value} ج.م` : `${value} رحلة`,
                      chartMetric === 'revenue' ? 'قيمة التداول الفعلي' : 'عدد الرحلات'
                    ]}
                    contentStyle={{
                      backgroundColor: '#0E1512',
                      borderColor: '#1B4D3E',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      direction: 'rtl',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartMetric}
                    stroke="#C5A880"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#chartGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fleet Breakdown & Trip Status */}
          <div className="lg:col-span-4 space-y-6">
            {/* Trip Status Donut */}
            <div className="card-glass p-6 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-cairo">
                توزيع حالات الرحلات
              </h3>
              <div className="h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tripStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {tripStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0E1512',
                        borderColor: '#1B4D3E',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className={`grid ${tripStatusData.length > 3 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 text-center text-xs`}>
                {tripStatusData.map((st) => (
                  <div key={st.name} className="p-2 rounded-xl bg-slate-50 dark:bg-rukoob-darker/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block truncate">{st.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono text-sm" style={{ color: st.color }}>
                      {st.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Fleet Ratio */}
            <div className="card-glass p-5 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-cairo flex items-center justify-between">
                <span>توزيع أسطول النقل الميداني</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalAssignedVehicles > 0 ? `${totalAssignedVehicles} رحلة معينة` : 'لا توجد مركبات معينة'}
                </span>
              </h3>
              <div className="space-y-2 text-xs">
                {vehicleSplitData.map((veh) => (
                  <div key={veh.name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      <span>{veh.name}</span>
                      <span className="font-mono">
                        {veh.value} رحلة {totalAssignedVehicles > 0 ? `(${Math.round((veh.value / totalAssignedVehicles) * 100)}%)` : ''}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-rukoob-darker rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${totalAssignedVehicles > 0 ? (veh.value / totalAssignedVehicles) * 100 : 0}%`,
                          backgroundColor: veh.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hotspot Routes Table */}
        <div className="card-glass p-6 rounded-2xl border border-slate-200 dark:border-rukoob-forest/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-cairo flex items-center gap-2">
                <Compass className="w-4 h-4 text-rukoob-gold" />
                <span>المسارات والخطوط الأكثر طلباً في أسوان (Hotspot Routes)</span>
              </h3>
              <p className="text-xs text-slate-500">
                ترتيب المسارات الحقيقية بحسب عدد الرحلات المحققة ونسبة الطلب الفعلي
              </p>
            </div>
            <Link
              to="/trips"
              className="text-xs font-bold text-rukoob-forest-light dark:text-rukoob-gold hover:underline flex items-center gap-1"
            >
              <span>سجل الرحلات الكامل</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {popularRoutes.map((route, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-rukoob-darker/60 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-rukoob-gold/40 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
                    {route.tag}
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {route.count} رحلة
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold truncate">
                    <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{route.from}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
                    <Route className="w-3 h-3 text-rose-500 shrink-0" />
                    <span className="truncate">{route.to}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/40">
                  {route.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
