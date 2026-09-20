import { apiClient } from './apiClient';
import {
  AdminDashboardDto,
  DriverProfileDto,
  PassengerProfileDto,
  RideDto,
  SupportTicketDto,
  TicketMessageDto,
  PlatformSettingDto,
  PaginatedList,
} from '../types';

export const AdminService = {
  // 1. Dashboard
  async getDashboard(): Promise<AdminDashboardDto> {
    const res = await apiClient.get('/api/Admin/dashboard');
    return res.data?.data || {
      totalPassengers: 0,
      totalDrivers: 0,
      activeDrivers: 0,
      ridesToday: 0,
      completedRides: 0,
      cancelledRides: 0,
      activeRides: 0,
      totalRideValue: 0,
      platformCommission: 0,
      pendingDriverVerifications: 0,
    };
  },

  // 2. Drivers
  async getDrivers(page: number = 1, pageSize: number = 10): Promise<PaginatedList<DriverProfileDto>> {
    const res = await apiClient.get('/api/Admin/drivers', { params: { page, pageSize } });
    if (res.data?.data?.items) {
      return res.data.data;
    }
    const items = Array.isArray(res.data?.data) ? res.data.data : [];
    return {
      items,
      page,
      pageSize,
      totalCount: items.length,
      totalPages: 1,
    };
  },

  async getPendingDrivers(): Promise<DriverProfileDto[]> {
    const res = await apiClient.get('/api/Admin/drivers/pending');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getDriverById(id: string): Promise<DriverProfileDto | null> {
    const res = await apiClient.get(`/api/Admin/drivers/${id}`);
    return res.data?.data || null;
  },

  async approveDriver(id: string): Promise<boolean> {
    const res = await apiClient.post(`/api/Admin/drivers/${id}/approve`);
    return res.data?.success ?? true;
  },

  async rejectDriver(id: string, reason?: string): Promise<boolean> {
    const res = await apiClient.post(`/api/Admin/drivers/${id}/reject`, { reason: reason || 'مستندات غير واضحة' });
    return res.data?.success ?? true;
  },

  async suspendDriver(id: string, reason?: string): Promise<boolean> {
    const res = await apiClient.post(`/api/Admin/drivers/${id}/suspend`, { reason: reason || 'إيقاف إداري' });
    return res.data?.success ?? true;
  },

  // 3. Passengers
  async getPassengers(page: number = 1, pageSize: number = 10): Promise<PaginatedList<PassengerProfileDto>> {
    const res = await apiClient.get('/api/Admin/passengers', { params: { page, pageSize } });
    if (res.data?.data?.items) {
      return res.data.data;
    }
    const items = Array.isArray(res.data?.data) ? res.data.data : [];
    return {
      items,
      page,
      pageSize,
      totalCount: items.length,
      totalPages: 1,
    };
  },

  async getPassengerById(id: string): Promise<PassengerProfileDto | null> {
    const res = await apiClient.get(`/api/Admin/passengers/${id}`);
    return res.data?.data || null;
  },

  // 4. Rides
  async getRides(page: number = 1, pageSize: number = 10): Promise<PaginatedList<RideDto>> {
    const res = await apiClient.get('/api/Admin/rides', { params: { page, pageSize } });
    if (res.data?.data?.items) {
      return res.data.data;
    }
    const items = Array.isArray(res.data?.data) ? res.data.data : [];
    return {
      items,
      page,
      pageSize,
      totalCount: items.length,
      totalPages: 1,
    };
  },

  async getActiveRides(): Promise<RideDto[]> {
    const res = await apiClient.get('/api/Admin/rides/active');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async getRideById(id: string): Promise<RideDto | null> {
    const res = await apiClient.get(`/api/Admin/rides/${id}`);
    return res.data?.data || null;
  },

  // 5. Tickets
  async getTickets(page: number = 1, pageSize: number = 10): Promise<PaginatedList<SupportTicketDto>> {
    const res = await apiClient.get('/api/Admin/tickets', { params: { page, pageSize } });
    if (res.data?.data?.items) {
      return res.data.data;
    }
    const items = Array.isArray(res.data?.data) ? res.data.data : [];
    return {
      items,
      page,
      pageSize,
      totalCount: items.length,
      totalPages: 1,
    };
  },

  async getTicketById(id: string): Promise<SupportTicketDto | null> {
    const res = await apiClient.get(`/api/Admin/tickets/${id}`);
    return res.data?.data || null;
  },

  async resolveTicket(id: string): Promise<boolean> {
    const res = await apiClient.post(`/api/Admin/tickets/${id}/resolve`);
    return res.data?.success ?? true;
  },

  async addTicketMessage(id: string, message: string): Promise<TicketMessageDto | null> {
    const res = await apiClient.post(`/api/Admin/tickets/${id}/messages`, { message });
    return res.data?.data || null;
  },

  // 6. Settings
  async getSettings(): Promise<PlatformSettingDto[]> {
    const res = await apiClient.get('/api/Admin/settings');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async updateSetting(key: string, value: string): Promise<boolean> {
    const res = await apiClient.put(`/api/Admin/settings/${key}`, { value });
    return res.data?.success ?? true;
  },

  // 7. Broadcast Notification
  async broadcastNotification(title: string, message: string, target: string = 'all'): Promise<number> {
    const res = await apiClient.post('/api/Admin/notifications/broadcast', {
      title,
      message,
      target,
    });
    return res.data?.data ?? 1;
  },
};

export const adminService = AdminService;
