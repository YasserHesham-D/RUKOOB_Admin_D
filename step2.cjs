const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\yasser hesham\\Desktop\\Rukoob\\RUKOOBAPP\\RUKOOB_Admin_Dashboard';
const srcDir = path.join(targetDir, 'src');

// 1. src/types/index.ts
fs.writeFileSync(path.join(srcDir, 'types', 'index.ts'), `
export type AdminRole = 'SuperAdmin' | 'OpsAdmin' | 'SupportAgent';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  lastLogin?: string;
}

export interface DashboardStats {
  todayRevenue: number;
  todayCompletedRides: number;
  activeOnlineDrivers: number;
  totalRegisteredDrivers: number;
  totalRegisteredPassengers: number;
  pendingDriverVerifications: number;
  openSupportTickets: number;
  driverCommissionRate: number;
  weeklyRevenue: number[];
  tripsByStatus: {
    completed: number;
    cancelled: number;
    inProgress: number;
    pending: number;
  };
  fleetStatus: {
    online: number;
    busy: number;
    offline: number;
  };
  peakHours: { hour: string; count: number }[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'verification' | 'ticket' | 'ride' | 'broadcast' | 'setting';
  title: string;
  description: string;
  timestamp: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended';

export interface DriverDocument {
  id: string;
  type: 'nationalIdFront' | 'nationalIdBack' | 'licenseFront' | 'licenseBack' | 'criminalRecord' | 'drugTest' | 'vehicleRegFront' | 'vehicleRegBack' | 'vehicleFront' | 'vehicleBack' | 'vehicleInterior';
  titleAr: string;
  titleEn: string;
  url: string;
  uploadedAt: string;
  isVerified?: boolean;
}

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  profileImageUrl?: string;
  isOnline: boolean;
  isApproved: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  rating: number;
  totalTrips: number;
  totalEarnings: number;
  currentLatitude?: number;
  currentLongitude?: number;
  joinedAt: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    vehicleType: string;
  };
  documents: DriverDocument[];
}

export interface Passenger {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  profileImageUrl?: string;
  rating: number;
  totalRides: number;
  totalSpent: number;
  isSuspended: boolean;
  createdAt: string;
}

export type RideStatus = 'Pending' | 'Accepted' | 'DriverArrived' | 'InProgress' | 'Completed' | 'Cancelled';

export interface Ride {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  pickup: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    address: string;
    latitude: number;
    longitude: number;
  };
  status: RideStatus;
  offeredPrice: number;
  finalPrice?: number;
  distanceKm: number;
  durationMinutes: number;
  commissionRate: number;
  driverEarning: number;
  cancellationReason?: string;
  cancelledBy?: 'passenger' | 'driver' | 'system';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  userType: 'passenger' | 'driver';
  subject: string;
  category: 'trip_issue' | 'payment_fare' | 'account' | 'safety' | 'other';
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  assignedAdmin?: string;
  rideId?: string;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderType: 'user' | 'admin' | 'system';
    message: string;
    timestamp: string;
    isInternalNote?: boolean;
  }[];
}

export interface PlatformSettings {
  baseFare: number;
  pricePerKm: number;
  minimumFare: number;
  nightMultiplier: number;
  driverCommissionRate: number;
  cancellationFee: number;
  searchRadiusKm: number;
  maxTripDistanceKm: number;
  driverResponseTimeoutSec: number;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface BroadcastLog {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'drivers' | 'passengers';
  recipientCount: number;
  sentBy: string;
  sentAt: string;
}

export interface AuditLogItem {
  id: string;
  adminName: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}
`);

// 2. src/assets/logo.tsx
fs.writeFileSync(path.join(srcDir, 'assets', 'logo.tsx'), `
import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  isDark?: boolean;
  className?: string;
}

export const RukoobLogo: React.FC<LogoProps> = ({ size = 36, showText = true, isDark = true, className = '' }) => {
  return (
    <div className={\`flex items-center gap-3 \${className}\`}>
      {/* Emblem SVG with Islamic geometric interlaced R motif */}
      <div 
        style={{ width: size, height: size }} 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1B4D3E] to-[#132A20] border border-[#C5A880]/40 shadow-lg shadow-black/20"
      >
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
          {/* Outer geometric shield */}
          <path d="M24 4L38 12V36L24 44L10 36V12L24 4Z" stroke="#C5A880" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Inner Golden R monogram & pin curve */}
          <path d="M18 16H27C30.5 16 33 18.5 33 22C33 25.5 30.5 28 27 28H18V16Z" stroke="#E8B923" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 16V34" stroke="#E8B923" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M26 28L33 34" stroke="#C5A880" strokeWidth="2.5" strokeLinecap="round" />
          {/* Pin core dot */}
          <circle cx="24" cy="22" r="2.5" fill="#10B981" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span className="font-outfit font-black tracking-wider text-xl bg-gradient-to-r from-[#E8B923] via-[#C5A880] to-white bg-clip-text text-transparent">
              RUKOOB
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[#1B4D3E]/60 text-[#C5A880] border border-[#C5A880]/30">
              Admin
            </span>
          </div>
          <span className="text-[11px] font-cairo font-bold text-gray-400 dark:text-gray-400">
            رُكوب • لوحة التحكم
          </span>
        </div>
      )}
    </div>
  );
};
`);

console.log('Step 2 complete: types and logo created.');
