import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject, BehaviorSubject } from 'rxjs';
import { Stock, ConnectionStatus } from '../model/stock.model';

@Injectable({
  providedIn: 'root',
})
export class StocksService {
  private hubConnection: HubConnection | null = null;
  private readonly hubUrl = '/stocks';

  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(
    ConnectionStatus.Disconnected,
  );
  private stockUpdatesSubject = new Subject<Stock>();
  private allStocksSubject = new Subject<Stock[]>();

  public connectionStatus = this.connectionStatusSubject.asObservable();
  public stockUpdates = this.stockUpdatesSubject.asObservable();
  public allStocks = this.allStocksSubject.asObservable();

  constructor() {}

  async connect() {
    try {
      this.connectionStatusSubject.next(ConnectionStatus.Connecting);

      this.hubConnection = new HubConnectionBuilder()
        .withUrl(this.hubUrl)
        .withAutomaticReconnect([0, 1000, 5000, 10000, 30000])
        .build();

      this.setupEventHandlers();

      await this.hubConnection.start();

      this.connectionStatusSubject.next(ConnectionStatus.Connected);

      try {
        const stocks = await this.hubConnection.invoke('getAllStocks');
        this.allStocksSubject.next(stocks);
      } catch (error) {
        console.warn('Cannot get data after connection:', error);
      }
    } catch (error) {
      console.error('Error connecting to SignalR:', error);
      this.connectionStatusSubject.next(ConnectionStatus.Error);
    }
  }

  private setupEventHandlers() {
    if (!this.hubConnection) return;

    this.hubConnection.on('StockUpdate', (stock: Stock) => {
      this.stockUpdatesSubject.next(stock);
    });

    this.hubConnection.on('AllStocks', (stocks: Stock[]) => {
      this.allStocksSubject.next(stocks);
    });

    this.hubConnection.on('updateStockPrice', (stockUpdate: Stock) => {
      if (stockUpdate) {
        this.stockUpdatesSubject.next(stockUpdate);
      }
    });

    this.hubConnection.onclose(() => {
      this.connectionStatusSubject.next(ConnectionStatus.Disconnected);
    });

    this.hubConnection.onreconnecting(() => {
      this.connectionStatusSubject.next(ConnectionStatus.Reconnecting);
    });

    this.hubConnection.onreconnected(() => {
      this.connectionStatusSubject.next(ConnectionStatus.Connected);
    });
  }

  async disconnect() {
    try {
      if (this.hubConnection) {
        await this.hubConnection.stop();
        this.connectionStatusSubject.next(ConnectionStatus.Disconnected);
      }
    } catch (error) {
      console.error('Error disconnecting from SignalR:', error);
    }
  }

  get isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }

  async getStocksHttp(): Promise<Stock[]> {
    if (this.hubConnection && this.isConnected) {
      try {
        return await this.hubConnection.invoke('getAllStocks');
      } catch (error) {
        console.error('Error getting stocks from SignalR:', error);
        return [];
      }
    } else {
      return [];
    }
  }
}
