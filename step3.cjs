const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\yasser hesham\\Desktop\\Rukoob\\RUKOOBAPP\\RUKOOB_Admin_Dashboard';
const srcDir = path.join(targetDir, 'src');

// 1. src/api/mockData.ts
fs.writeFileSync(path.join(srcDir, 'api', 'mockData.ts'), `
import { DashboardStats, Driver, Passenger, Ride, SupportTicket, PlatformSettings, BroadcastLog, AuditLogItem } from '../types';

export const mockStats: DashboardStats = {
  todayRevenue: 14850,
  todayCompletedRides: 142,
  activeOnlineDrivers: 28,
  totalRegisteredDrivers: 84,
  totalRegisteredPassengers: 1260,
  pendingDriverVerifications: 5,
  openSupportTickets: 4,
  driverCommissionRate: 0.08,
  weeklyRevenue: [8200, 9400, 11200, 10500, 13100, 15400, 14850],
  tripsByStatus: {
    completed: 142,
    cancelled: 12,
    inProgress: 18,
    pending: 6,
  },
  fleetStatus: {
    online: 28,
    busy: 18,
    offline: 38,
  },
  peakHours: [
    { hour: '07:00', count: 18 },
    { hour: '08:00', count: 34 },
    { hour: '09:00', count: 28 },
    { hour: '12:00', count: 22 },
    { hour: '14:00', count: 42 },
    { hour: '16:00', count: 38 },
    { hour: '19:00', count: 45 },
    { hour: '21:00', count: 50 },
    { hour: '23:00', count: 24 },
  ],
  recentActivity: [
    { id: '1', type: 'verification', title: 'طلب توثيق جديد', description: 'سائق جديد (أحمد عبد المنعم) قدم المستندات للمراجعة', timestamp: 'منذ 5 دقائق', severity: 'info' },
    { id: '2', type: 'ride', title: 'مشوار مكتمل', description: 'رحلة من محطة قطار أسوان إلى فندق هلنان (45 ج.م)', timestamp: 'منذ 8 دقائق', severity: 'success' },
    { id: '3', type: 'ticket', title: 'تذكرة دعم جديدة #204', description: 'العميل يبلغ عن فقدان متعلقات في السيارة', timestamp: 'منذ 15 دقيقة', severity: 'warning' },
    { id: '4', type: 'broadcast', title: 'إشعار جماعي', description: 'تم إرسال إشعار ترويجي لكافة الركاب في أسوان', timestamp: 'منذ ساعتين', severity: 'info' },
  ],
};

export const mockDrivers: Driver[] = [
  {
    id: 'drv-01',
    fullName: 'محمود عبد الرحمن الأسواني',
    phone: '01123456789',
    email: 'mahmoud.aswan@gmail.com',
    isOnline: true,
    isApproved: true,
    verificationStatus: 'Approved',
    rating: 4.9,
    totalTrips: 342,
    totalEarnings: 15400,
    currentLatitude: 24.0889,
    currentLongitude: 32.8998,
    joinedAt: '2026-01-10',
    vehicle: {
      make: 'Hyundai',
      model: 'Elantra HD',
      year: 2021,
      licensePlate: 'ص ق هـ 4821',
      color: 'فضي ميتاليك',
      vehicleType: 'Car',
    },
    documents: [
      { id: 'd1', type: 'nationalIdFront', titleAr: 'بطاقة الرقم القومي (الوجه الأول)', titleEn: 'National ID Front', url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800', uploadedAt: '2026-01-10', isVerified: true },
      { id: 'd2', type: 'nationalIdBack', titleAr: 'بطاقة الرقم القومي (الوجه الثاني)', titleEn: 'National ID Back', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800', uploadedAt: '2026-01-10', isVerified: true },
      { id: 'd3', type: 'licenseFront', titleAr: 'رخصة القيادة (الوجه الأول)', titleEn: 'Driving License Front', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800', uploadedAt: '2026-01-10', isVerified: true },
      { id: 'd4', type: 'licenseBack', titleAr: 'رخصة القيادة (الوجه الثاني)', titleEn: 'Driving License Back', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', uploadedAt: '2026-01-10', isVerified: true },
      { id: 'd5', type: 'criminalRecord', titleAr: 'صحيفة الحالة الجنائية (فيش وتشبيه)', titleEn: 'Criminal Background Check', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', uploadedAt: '2026-01-10', isVerified: true },
      { id: 'd6', type: 'drugTest', titleAr: 'تحليل المخدرات المعتمد', titleEn: 'Drug Test Certificate', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', uploadedAt: '2026-01-10', isVerified: true },
      { id: 'd7', type: 'vehicleRegFront', titleAr: 'رخصة تسيير المركبة (الوجه الأول)', titleEn: 'Vehicle Registration Front', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800', uploadedAt: '2026-01-10', isVerified: true },
      { id: 'd8', type: 'vehicleRegBack', titleAr: 'رخصة تسيير المركبة (الوجه الثاني)', titleEn: 'Vehicle Registration Back', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800', uploadedAt: '2026-01-10', isVerified: true },
      { id: 'd9', type: 'vehicleFront', titleAr: 'صورة السيارة من الأمام', titleEn: 'Vehicle Front View', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', uploadedAt: '2026-01-10', isVerified: true },
    ],
  },
  {
    id: 'drv-02',
    fullName: 'ياسين حسن الشريف',
    phone: '01098765432',
    email: 'yassin.sherif@yahoo.com',
    isOnline: false,
    isApproved: false,
    verificationStatus: 'Pending',
    rating: 0,
    totalTrips: 0,
    totalEarnings: 0,
    joinedAt: '2026-09-15',
    vehicle: {
      make: 'Nissan',
      model: 'Sunny',
      year: 2023,
      licensePlate: 'ص و ر 9152',
      color: 'أبيض لؤلؤي',
      vehicleType: 'Car',
    },
    documents: [
      { id: 'd1', type: 'nationalIdFront', titleAr: 'بطاقة الرقم القومي (الوجه الأول)', titleEn: 'National ID Front', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800', uploadedAt: '2026-09-15' },
      { id: 'd2', type: 'nationalIdBack', titleAr: 'بطاقة الرقم القومي (الوجه الثاني)', titleEn: 'National ID Back', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800', uploadedAt: '2026-09-15' },
      { id: 'd3', type: 'licenseFront', titleAr: 'رخصة القيادة (الوجه الأول)', titleEn: 'Driving License Front', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800', uploadedAt: '2026-09-15' },
      { id: 'd4', type: 'licenseBack', titleAr: 'رخصة القيادة (الوجه الثاني)', titleEn: 'Driving License Back', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800', uploadedAt: '2026-09-15' },
      { id: 'd5', type: 'criminalRecord', titleAr: 'صحيفة الحالة الجنائية (فيش وتشبيه)', titleEn: 'Criminal Background Check', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', uploadedAt: '2026-09-15' },
      { id: 'd6', type: 'drugTest', titleAr: 'تحليل المخدرات المعتمد', titleEn: 'Drug Test Certificate', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', uploadedAt: '2026-09-15' },
      { id: 'd7', type: 'vehicleRegFront', titleAr: 'رخصة تسيير المركبة (الوجه الأول)', titleEn: 'Vehicle Registration Front', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', uploadedAt: '2026-09-15' },
      { id: 'd8', type: 'vehicleRegBack', titleAr: 'رخصة تسيير المركبة (الوجه الثاني)', titleEn: 'Vehicle Registration Back', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', uploadedAt: '2026-09-15' },
      { id: 'd9', type: 'vehicleFront', titleAr: 'صورة السيارة من الأمام', titleEn: 'Vehicle Front View', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', uploadedAt: '2026-09-15' },
    ],
  },
  {
    id: 'drv-03',
    fullName: 'مصطفى كمال النوبي',
    phone: '01234567890',
    email: 'mostafa.kamal@gmail.com',
    isOnline: true,
    isApproved: true,
    verificationStatus: 'Approved',
    rating: 4.8,
    totalTrips: 189,
    totalEarnings: 8200,
    currentLatitude: 24.0950,
    currentLongitude: 32.9050,
    joinedAt: '2026-02-01',
    vehicle: {
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      licensePlate: 'ص ط ج 1198',
      color: 'أسود ملوكي',
      vehicleType: 'Car',
    },
    documents: [],
  },
  {
    id: 'drv-04',
    fullName: 'عمر خالد السلولي',
    phone: '01511223344',
    isOnline: false,
    isApproved: false,
    verificationStatus: 'Rejected',
    rejectionReason: 'صورة رخصة القيادة غير واضحة ومنتهية الصلاحية',
    rating: 0,
    totalTrips: 0,
    totalEarnings: 0,
    joinedAt: '2026-08-20',
    documents: [],
  },
];

export const mockPassengers: Passenger[] = [
  { id: 'pas-01', fullName: 'أحمد محمود إسماعيل', phone: '01011223344', email: 'ahmed.m@gmail.com', rating: 4.9, totalRides: 48, totalSpent: 2150, isSuspended: false, createdAt: '2026-01-15' },
  { id: 'pas-02', fullName: 'سارة عبد الله قاسم', phone: '01155667788', rating: 5.0, totalRides: 26, totalSpent: 1320, isSuspended: false, createdAt: '2026-02-10' },
  { id: 'pas-03', fullName: 'محمد طارق المصري', phone: '01299887766', rating: 4.6, totalRides: 14, totalSpent: 750, isSuspended: false, createdAt: '2026-03-05' },
  { id: 'pas-04', fullName: 'إبراهيم ناصر الدين', phone: '01033445566', rating: 3.8, totalRides: 8, totalSpent: 420, isSuspended: true, createdAt: '2026-05-12' },
];

export const mockRides: Ride[] = [
  {
    id: 'ride-101',
    passengerId: 'pas-01',
    passengerName: 'أحمد محمود إسماعيل',
    passengerPhone: '01011223344',
    driverId: 'drv-01',
    driverName: 'محمود عبد الرحمن الأسواني',
    driverPhone: '01123456789',
    pickup: { address: 'محطة قطار أسوان', latitude: 24.0889, longitude: 32.8998 },
    destination: { address: 'فندق هلنان أسوان (كورنيش النيل)', latitude: 24.0820, longitude: 32.8910 },
    status: 'Completed',
    offeredPrice: 45,
    finalPrice: 45,
    distanceKm: 3.4,
    durationMinutes: 9,
    commissionRate: 0.08,
    driverEarning: 41.4,
    createdAt: '2026-09-16T11:15:00',
    startedAt: '2026-09-16T11:20:00',
    completedAt: '2026-09-16T11:29:00',
  },
  {
    id: 'ride-102',
    passengerId: 'pas-02',
    passengerName: 'سارة عبد الله قاسم',
    passengerPhone: '01155667788',
    driverId: 'drv-03',
    driverName: 'مصطفى كمال النوبي',
    driverPhone: '01234567890',
    pickup: { address: 'جامعة أسوان (صحاري)', latitude: 24.0150, longitude: 32.8550 },
    destination: { address: 'ميدان المحطة - وسط البلد', latitude: 24.0889, longitude: 32.8998 },
    status: 'InProgress',
    offeredPrice: 85,
    finalPrice: 85,
    distanceKm: 12.8,
    durationMinutes: 22,
    commissionRate: 0.08,
    driverEarning: 78.2,
    createdAt: '2026-09-16T14:40:00',
    startedAt: '2026-09-16T14:48:00',
  },
  {
    id: 'ride-103',
    passengerId: 'pas-03',
    passengerName: 'محمد طارق المصري',
    passengerPhone: '01299887766',
    pickup: { address: 'متحف النوبة', latitude: 24.0805, longitude: 32.8885 },
    destination: { address: 'مطار أسوان الدولي', latitude: 23.9644, longitude: 32.8197 },
    status: 'Pending',
    offeredPrice: 180,
    distanceKm: 21.5,
    durationMinutes: 30,
    commissionRate: 0.08,
    driverEarning: 165.6,
    createdAt: '2026-09-16T15:10:00',
  },
];

export const mockTickets: SupportTicket[] = [
  {
    id: 'tkt-01',
    ticketNumber: 'TKT-1082',
    userId: 'pas-01',
    userName: 'أحمد محمود',
    userPhone: '01011223344',
    userType: 'passenger',
    subject: 'نسيان حقيبة يد صغيرة في السيارة',
    category: 'trip_issue',
    status: 'Open',
    priority: 'high',
    createdAt: '2026-09-16T13:45:00',
    updatedAt: '2026-09-16T14:10:00',
    rideId: 'ride-101',
    messages: [
      { id: 'm1', senderId: 'pas-01', senderName: 'أحمد محمود', senderType: 'user', message: 'السلام عليكم، نسيت حقيبة جلدية صغيرة سوداء في المقعد الخلفي للكابتن محمود.', timestamp: '13:45' },
      { id: 'm2', senderId: 'adm-01', senderName: 'فريق الدعم (أحمد علي)', senderType: 'admin', message: 'أهلاً بك يا فندم، تم التواصل مع الكابتن محمود وأكد وجود الحقيبة معه بأمان، وسيقوم بتسليمها لك.', timestamp: '14:10' },
    ],
  },
  {
    id: 'tkt-02',
    ticketNumber: 'TKT-1083',
    userId: 'drv-01',
    userName: 'محمود عبد الرحمن (كابتن)',
    userPhone: '01123456789',
    userType: 'driver',
    subject: 'استفسار بخصوص تسوية أرباح الأسبوع',
    category: 'payment_fare',
    status: 'InProgress',
    priority: 'medium',
    createdAt: '2026-09-16T10:20:00',
    updatedAt: '2026-09-16T11:05:00',
    messages: [
      { id: 'm1', senderId: 'drv-01', senderName: 'محمود عبد الرحمن', senderType: 'user', message: 'أود الاستفسار عن موعد تحويل مستحقات المحفظة الأسبوعية للحساب البنكي.', timestamp: '10:20' },
      { id: 'm2', senderId: 'adm-01', senderName: 'فريق الحسابات', senderType: 'admin', message: 'مرحباً كابتن محمود، يتم إيداع الأرباح كل يوم خميس أسبوعياً بشكل تلقائي.', timestamp: '11:05' },
    ],
  },
];

export const mockSettings: PlatformSettings = {
  baseFare: 15.0,
  pricePerKm: 5.5,
  minimumFare: 20.0,
  nightMultiplier: 1.25,
  driverCommissionRate: 0.08,
  cancellationFee: 15.0,
  searchRadiusKm: 5.0,
  maxTripDistanceKm: 45.0,
  driverResponseTimeoutSec: 45,
  lastUpdatedBy: 'المدير التنفيذي (SuperAdmin)',
  lastUpdatedAt: '2026-09-16T10:00:00',
};

export const mockBroadcasts: BroadcastLog[] = [
  { id: 'b1', title: 'عروض الخريف في أسوان 🍂', message: 'خصم 20% على مشاوير جامعة أسوان هذا الأسبوع!', targetAudience: 'passengers', recipientCount: 1240, sentBy: 'Super Admin', sentAt: '2026-09-15 16:00' },
  { id: 'b2', title: 'حافز إضافي للكباتن 💰', message: 'أكمل 10 مشاوير اليوم واحصل على بونص 100 ج.م إضافي بدون عمولة.', targetAudience: 'drivers', recipientCount: 82, sentBy: 'Super Admin', sentAt: '2026-09-16 08:30' },
];

export const mockAuditLogs: AuditLogItem[] = [
  { id: 'a1', adminName: 'ياسر هشام (Super Admin)', action: 'تعديل تسعيرة', target: 'سعر الكيلومتر', details: 'تعديل سعر الكيلو من 5.0 إلى 5.5 ج.م', timestamp: '2026-09-16 10:00' },
  { id: 'a2', adminName: 'أحمد علي (Ops Admin)', action: 'اعتماد سائق', target: 'محمود عبد الرحمن (ص ق هـ 4821)', details: 'تمت مراجعة جميع الوثائق الـ 9 والموافقة', timestamp: '2026-09-16 11:30' },
];
`);

// 2. src/api/apiClient.ts
fs.writeFileSync(path.join(srcDir, 'api', 'apiClient.ts'), `
import axios from 'axios';

export const API_BASE_URL = 'https://rukoob-api.runasp.net';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rukoob_admin_token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized token expiry
      localStorage.removeItem('rukoob_admin_token');
      localStorage.removeItem('rukoob_admin_user');
    }
    return Promise.reject(error);
  }
);
`);

// 3. src/api/adminService.ts
fs.writeFileSync(path.join(srcDir, 'api', 'adminService.ts'), `
import { apiClient } from './apiClient';
import { 
  mockStats, 
  mockDrivers, 
  mockPassengers, 
  mockRides, 
  mockTickets, 
  mockSettings, 
  mockBroadcasts, 
  mockAuditLogs 
} from './mockData';
import { DashboardStats, Driver, Passenger, Ride, SupportTicket, PlatformSettings, BroadcastLog, AuditLogItem } from '../types';

let localDrivers = [...mockDrivers];
let localPassengers = [...mockPassengers];
let localRides = [...mockRides];
let localTickets = [...mockTickets];
let localSettings = { ...mockSettings };
let localBroadcasts = [...mockBroadcasts];
let localAuditLogs = [...mockAuditLogs];

export const AdminService = {
  // 1. Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await apiClient.get('/api/Admin/dashboard');
      if (res.data && res.data.success && res.data.data) {
        return { ...mockStats, ...res.data.data };
      }
    } catch (_) {}
    return { ...mockStats, pendingDriverVerifications: localDrivers.filter(d => d.verificationStatus === 'Pending').length };
  },

  // 2. Drivers
  async getDrivers(filter?: string): Promise<Driver[]> {
    try {
      const res = await apiClient.get('/api/Admin/drivers');
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
    } catch (_) {}
    if (filter === 'pending') {
      return localDrivers.filter(d => d.verificationStatus === 'Pending');
    }
    return localDrivers;
  },

  async getPendingDrivers(): Promise<Driver[]> {
    try {
      const res = await apiClient.get('/api/Admin/drivers/pending');
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
    } catch (_) {}
    return localDrivers.filter(d => d.verificationStatus === 'Pending');
  },

  async approveDriver(id: string): Promise<boolean> {
    try {
      await apiClient.post(\`/api/Admin/drivers/\${id}/approve\`);
    } catch (_) {}
    localDrivers = localDrivers.map(d => d.id === id ? { ...d, isApproved: true, verificationStatus: 'Approved' } : d);
    localAuditLogs.unshift({
      id: \`audit-\${Date.now()}\`,
      adminName: 'Admin',
      action: 'اعتماد سائق',
      target: id,
      details: 'تمت الموافقة على وثائق السائق واعتماده للعمل',
      timestamp: new Date().toLocaleString(),
    });
    return true;
  },

  async rejectDriver(id: string, reason: string): Promise<boolean> {
    try {
      await apiClient.post(\`/api/Admin/drivers/\${id}/reject\`, { reason });
    } catch (_) {}
    localDrivers = localDrivers.map(d => d.id === id ? { ...d, isApproved: false, verificationStatus: 'Rejected', rejectionReason: reason } : d);
    localAuditLogs.unshift({
      id: \`audit-\${Date.now()}\`,
      adminName: 'Admin',
      action: 'رفض وثائق سائق',
      target: id,
      details: \`السبب: \${reason}\`,
      timestamp: new Date().toLocaleString(),
    });
    return true;
  },

  async suspendDriver(id: string): Promise<boolean> {
    try {
      await apiClient.post(\`/api/Admin/drivers/\${id}/suspend\`);
    } catch (_) {}
    localDrivers = localDrivers.map(d => d.id === id ? { ...d, isApproved: false, isOnline: false, verificationStatus: 'Suspended' } : d);
    return true;
  },

  // 3. Passengers
  async getPassengers(): Promise<Passenger[]> {
    try {
      const res = await apiClient.get('/api/Admin/passengers');
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
    } catch (_) {}
    return localPassengers;
  },

  async toggleSuspendPassenger(id: string): Promise<boolean> {
    localPassengers = localPassengers.map(p => p.id === id ? { ...p, isSuspended: !p.isSuspended } : p);
    return true;
  },

  // 4. Rides
  async getRides(): Promise<Ride[]> {
    try {
      const res = await apiClient.get('/api/Admin/rides');
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
    } catch (_) {}
    return localRides;
  },

  // 5. Support Tickets
  async getTickets(): Promise<SupportTicket[]> {
    try {
      const res = await apiClient.get('/api/Admin/tickets');
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
    } catch (_) {}
    return localTickets;
  },

  async replyTicket(ticketId: string, message: string, isInternalNote: boolean = false): Promise<boolean> {
    localTickets = localTickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: isInternalNote ? t.status : 'InProgress',
          messages: [
            ...t.messages,
            {
              id: \`msg-\${Date.now()}\`,
              senderId: 'admin',
              senderName: isInternalNote ? 'ملاحظة إدارية داخلية' : 'فريق الدعم (Admin)',
              senderType: 'admin',
              message,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isInternalNote,
            }
          ]
        };
      }
      return t;
    });
    return true;
  },

  async resolveTicket(ticketId: string): Promise<boolean> {
    try {
      await apiClient.post(\`/api/Admin/tickets/\${ticketId}/resolve\`);
    } catch (_) {}
    localTickets = localTickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved' } : t);
    return true;
  },

  // 6. Settings
  async getSettings(): Promise<PlatformSettings> {
    try {
      const res = await apiClient.get('/api/Admin/settings');
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
    } catch (_) {}
    return localSettings;
  },

  async updateSettings(settings: Partial<PlatformSettings>, adminName: string): Promise<PlatformSettings> {
    try {
      await apiClient.post('/api/Admin/settings', settings);
    } catch (_) {}
    localSettings = { ...localSettings, ...settings, lastUpdatedBy: adminName, lastUpdatedAt: new Date().toISOString() };
    localAuditLogs.unshift({
      id: \`audit-\${Date.now()}\`,
      adminName,
      action: 'تعديل إعدادات المنصة',
      target: 'إعدادات التسعير والسياسات',
      details: JSON.stringify(settings),
      timestamp: new Date().toLocaleString(),
    });
    return localSettings;
  },

  // 7. Broadcast
  async getBroadcasts(): Promise<BroadcastLog[]> {
    return localBroadcasts;
  },

  async sendBroadcast(title: string, message: string, targetAudience: 'all' | 'drivers' | 'passengers', sentBy: string): Promise<boolean> {
    try {
      await apiClient.post('/api/Admin/notifications/broadcast', { title, message, targetAudience });
    } catch (_) {}
    const newBroadcast: BroadcastLog = {
      id: \`bc-\${Date.now()}\`,
      title,
      message,
      targetAudience,
      recipientCount: targetAudience === 'all' ? 1324 : (targetAudience === 'drivers' ? 84 : 1240),
      sentBy,
      sentAt: new Date().toLocaleString(),
    };
    localBroadcasts.unshift(newBroadcast);
    return true;
  },

  // 8. Audit Logs
  async getAuditLogs(): Promise<AuditLogItem[]> {
    return localAuditLogs;
  },
};
`);

// 4. src/api/signalrService.ts
fs.writeFileSync(path.join(srcDir, 'api', 'signalrService.ts'), `
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from './apiClient';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  public async startConnection(onRideUpdated?: (ride: any) => void) {
    if (this.connection) return;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(\`\${API_BASE_URL}/hubs/rides\`, {
          accessTokenFactory: () => localStorage.getItem('rukoob_admin_token') || '',
        })
        .withAutomaticReconnect()
        .build();

      this.connection.on('RideStatusUpdated', (ride) => {
        if (onRideUpdated) onRideUpdated(ride);
      });

      await this.connection.start();
      console.log('SignalR Admin Hub Connected');
    } catch (err) {
      console.warn('SignalR Admin Hub Connection Error:', err);
    }
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }
}

export const signalRService = new SignalRService();
`);

console.log('Step 3 complete: API clients, services, and mock data created.');
