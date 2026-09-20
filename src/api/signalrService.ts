import * as signalR from '@microsoft/signalr';
import { BASE_API_URL } from './apiClient';

class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;

  public async startConnection(token?: string) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_API_URL}/hubs/tracking`, {
        accessTokenFactory: () => token || localStorage.getItem('rukoob_admin_token') || '',
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.None)
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR Hub Connected successfully');
    } catch (err) {
      console.warn('SignalR Connection Error (will retry automatically):', err);
    }
  }

  public onDriverLocationUpdated(callback: (data: { driverId: string; lat: number; lng: number; bearing?: number }) => void) {
    this.hubConnection?.on('DriverLocationUpdated', callback);
  }

  public onRideStatusChanged(callback: (data: { rideId: string; status: number }) => void) {
    this.hubConnection?.on('RideStatusChanged', callback);
  }

  public stopConnection() {
    this.hubConnection?.stop();
  }
}

export const signalrService = new SignalRService();
