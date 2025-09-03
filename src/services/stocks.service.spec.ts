import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { StocksService } from './stocks.service';
import { ConnectionStatus, Stock } from '../model/stock.model';

const mockHubConnection = {
  start: vi.fn(),
  stop: vi.fn(),
  invoke: vi.fn(),
  on: vi.fn(),
  onclose: vi.fn(),
  onreconnecting: vi.fn(),
  onreconnected: vi.fn(),
  state: 'Disconnected',
};

const mockHubConnectionBuilder = {
  withUrl: vi.fn().mockReturnThis(),
  withAutomaticReconnect: vi.fn().mockReturnThis(),
  build: vi.fn().mockReturnValue(mockHubConnection),
};

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: vi.fn().mockImplementation(() => mockHubConnectionBuilder),
}));

describe('StocksService', () => {
  let service: StocksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StocksService);

    vi.clearAllMocks();
    mockHubConnection.state = 'Disconnected';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initial connection status as Disconnected', async () => {
    const status = await firstValueFrom(service.connectionStatus);
    expect(status).toBe(ConnectionStatus.Disconnected);
  });

  it('should init isConnected as false initially', () => {
    expect(service.isConnected).toBe(false);
  });

  it('should return true when hub connection state is Connected', async () => {
    mockHubConnection.start.mockResolvedValue(undefined);
    mockHubConnection.invoke.mockResolvedValue([]);
    mockHubConnection.state = 'Connected';

    await service.connect();
    expect(service.isConnected).toBe(true);
  });

  describe('connect method', () => {
    it('should return empty array when not connected', async () => {
      const result = await service.getStocksHttp();
      expect(result).toEqual([]);
    });

    it('should set connection status to Connecting when connect is called', async () => {
      mockHubConnection.start.mockResolvedValue(undefined);
      mockHubConnection.invoke.mockResolvedValue([]);

      const connectPromise = service.connect();

      const status = await firstValueFrom(service.connectionStatus);
      expect(status).toBe(ConnectionStatus.Connecting);

      await connectPromise;
    });

    it('should set connection status to Connected after successful connection', async () => {
      mockHubConnection.start.mockResolvedValue(undefined);
      mockHubConnection.invoke.mockResolvedValue([]);

      await service.connect();

      const status = await firstValueFrom(service.connectionStatus);
      expect(status).toBe(ConnectionStatus.Connected);
    });

    it('should set connection status to Error when connection fails', async () => {
      mockHubConnection.start.mockRejectedValue(new Error('Connection failed'));

      await service.connect();

      const status = await firstValueFrom(service.connectionStatus);
      expect(status).toBe(ConnectionStatus.Error);
    });

    it('should call getAllStocks after successful connection', async () => {
      const mockStocks: Stock[] = [
        {
          symbol: 'TEST',
          price: 100,
          dayMax: 110,
          dayMin: 90,
          dayOpen: 95,
          lastUpdate: '2024-01-15T10:00:00Z',
          change: 5,
          percentChange: 5.26,
        },
      ];

      mockHubConnection.start.mockResolvedValue(undefined);
      mockHubConnection.invoke.mockResolvedValue(mockStocks);

      await service.connect();

      expect(mockHubConnection.invoke).toHaveBeenCalledWith('getAllStocks');
    });
  });

  describe('disconnect method', () => {
    it('should call stop on hub connection and set status to Disconnected', async () => {
      mockHubConnection.start.mockResolvedValue(undefined);
      mockHubConnection.invoke.mockResolvedValue([]);
      mockHubConnection.stop.mockResolvedValue(undefined);

      await service.connect();
      await service.disconnect();

      expect(mockHubConnection.stop).toHaveBeenCalled();

      const status = await firstValueFrom(service.connectionStatus);
      expect(status).toBe(ConnectionStatus.Disconnected);
    });

    it('should handle disconnect errors gracefully', async () => {
      mockHubConnection.start.mockResolvedValue(undefined);
      mockHubConnection.invoke.mockResolvedValue([]);
      await service.connect();

      mockHubConnection.stop.mockRejectedValue(new Error('Disconnect failed'));

      await expect(service.disconnect()).resolves.toBeUndefined();
    });
  });
});
