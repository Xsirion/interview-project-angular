import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { StocksService } from './stocks.service';
import { StocksStore } from '../stores/stocks.store';
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

describe('StocksService + StocksStore Integration', () => {
  let service: StocksService;
  let store: typeof StocksStore;

  const mockStocks: Stock[] = [
    {
      symbol: 'DELL',
      price: 150.25,
      dayMax: 152.0,
      dayMin: 148.5,
      dayOpen: 149.0,
      lastUpdate: '2024-01-15T10:30:00Z',
      change: 1.25,
      percentChange: 0.84,
    },
    {
      symbol: 'GOOGL',
      price: 2800.5,
      dayMax: 2820.0,
      dayMin: 2790.0,
      dayOpen: 2795.0,
      lastUpdate: '2024-01-15T10:30:00Z',
      change: -15.5,
      percentChange: -0.55,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StocksService, StocksStore],
    });

    service = TestBed.inject(StocksService);
    store = TestBed.inject(StocksStore);

    vi.clearAllMocks();
    mockHubConnection.state = 'Disconnected';
  });

  it('should integrate service connection with store state management', async () => {
    mockHubConnection.start.mockResolvedValue(undefined);
    mockHubConnection.invoke.mockResolvedValue(mockStocks);

    let stockUpdateHandler: (stock: Stock) => void;
    let allStocksHandler: (stocks: Stock[]) => void;

    mockHubConnection.on.mockImplementation((event: string, handler: any) => {
      if (event === 'StockUpdate') stockUpdateHandler = handler;
      if (event === 'AllStocks') allStocksHandler = handler;
    });

    store.initialize();
    store.listenToConnectionStatus();
    store.listenToAllStocks();
    store.listenToStockUpdates();

    await service.connect();
    mockHubConnection.state = 'Connected';

    allStocksHandler!(mockStocks);

    await vi.waitFor(async () => {
      expect(store.stocks().length).toBe(2);
      expect(store.connectionStatus()).toBe(ConnectionStatus.Connected);
      expect(store.isLoading()).toBe(false);
      expect(store.stocksCount()).toBe(2);
      expect(store.gainCount()).toBe(1);
      expect(store.lossCount()).toBe(1);
    });
  });

  it('should handle real-time stock updates with animations', async () => {
    mockHubConnection.start.mockResolvedValue(undefined);
    mockHubConnection.invoke.mockResolvedValue(mockStocks);

    let stockUpdateHandler: (stock: Stock) => void;
    mockHubConnection.on.mockImplementation((event: string, handler: any) => {
      if (event === 'StockUpdate') stockUpdateHandler = handler;
    });

    store.initialize();
    store.listenToStockUpdates();
    await service.connect();
    store.setStocks(mockStocks);

    const updatedStock: Stock = {
      ...mockStocks[0],
      price: 155.0,
      change: 5.75,
      percentChange: 3.83,
    };

    stockUpdateHandler!(updatedStock);

    await vi.waitFor(() => {
      expect(store.hasAnimation('DELL', 'price', 'increase')).toBe(true);
      expect(store.hasAnimation('DELL', 'change', 'increase')).toBe(true);

      const stocks = store.stocks();
      const appleStock = stocks.find((s) => s.symbol === 'DELL');
      expect(appleStock?.price).toBe(155.0);
    });
  });
});
