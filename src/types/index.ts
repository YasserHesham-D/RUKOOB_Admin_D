export type Role = 'SuperAdmin' | 'OpsAdmin' | 'SupportAgent';

export type Permission =
  | 'view_dashboard'
  | 'verify_drivers'
  | 'manage_drivers'
  | 'manage_riders'
  | 'view_trips'
  | 'manage_support'
  | 'send_broadcast'
  | 'manage_settings'
  | 'manage_admins';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export enum DriverVerificationStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Suspended = 4,
}

export enum DocumentTypeEnum {
  NationalIdFront = 1,
  NationalIdBack = 2,
  DrivingLicenseFront = 3,
  DrivingLicenseBack = 4,
  VehicleLicenseFront = 5,
  VehicleLicenseBack = 6,
  CriminalRecord = 7,
  DrugAnalysis = 8,
  VehicleFront = 9,
  VehicleBack = 10,
}

export interface DriverDocumentDto {
  id: string;
  documentType: number;
  documentNumber?: string | null;
  fileUrl: string;
  status: number;
  rejectionReason?: string | null;
  uploadedAt: string;
  verifiedAt?: string | null;
}

export interface VehicleDto {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleType: number;
  isActive: boolean;
  photoUrl?: string | null;
}

export interface DriverProfileDto {
  id: string;
  phoneNumber: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
  verificationStatus: number; // 1: Pending, 2: Approved, 3: Rejected, 4: Suspended
  rejectionReason?: string | null;
  isOnline: boolean;
  isAvailable: boolean;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  rating: number;
  totalRatings: number;
  totalRides: number;
  walletBalance: number;
  vehicle?: VehicleDto | null;
  documents: DriverDocumentDto[];
  createdAt: string;
}

export interface PassengerProfileDto {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
  rating: number;
  totalRatings: number;
  totalRides: number;
  createdAt: string;
  isBanned?: boolean;
}

export interface LocationDto {
  latitude: number;
  longitude: number;
  address: string;
}

export interface RideDto {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  passengerPhotoUrl?: string | null;
  passengerRating: number;
  driverId?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  driverPhotoUrl?: string | null;
  driverRating?: number | null;
  driverVehicle?: VehicleDto | null;
  driverVehiclePhotoUrl?: string | null;
  pickup: LocationDto;
  destination: LocationDto;
  distanceKm: number;
  offeredPrice: number;
  finalPrice?: number | null;
  commissionRate: number;
  commissionAmount?: number | null;
  driverEarning?: number | null;
  status: number; // 1: Pending, 2: Accepted, 3: Arrived, 4: InRide, 5: Completed, 6: CancelledByDriver, 7: CancelledByPassenger
  paymentMethod: number;
  paymentStatus: number;
  createdAt: string;
  acceptedAt?: string | null;
  driverArrivedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
}

export interface TicketMessageDto {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  message: string;
  isAdminResponse: boolean;
  createdAt: string;
}

export interface SupportTicketDto {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  rideId?: string | null;
  subject: string;
  description: string;
  status: number; // 1: Open, 2: InProgress, 3: Resolved, 4: Closed
  priority: number;
  createdAt: string;
  resolvedAt?: string | null;
  messages: TicketMessageDto[];
}

export interface PlatformSettingDto {
  key: string;
  value: string;
  description?: string | null;
  updatedAt: string;
}

export interface AdminDashboardDto {
  totalPassengers: number;
  totalDrivers: number;
  activeDrivers: number;
  ridesToday: number;
  completedRides: number;
  cancelledRides: number;
  activeRides: number;
  totalRideValue: number;
  platformCommission: number;
  pendingDriverVerifications: number;
}

export interface PaginatedList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
