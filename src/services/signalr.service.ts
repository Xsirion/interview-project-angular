import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject, BehaviorSubject } from 'rxjs';
import { Stock, ConnectionStatus } from '../model/stock.model';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private readonly hubUrl = '/stocks';
  //private readonly hubUrl = 'http://localhost:32770/stocks';
  // private readonly apiUrl = 'http://localhost:32770/api/stocks';

  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(
    ConnectionStatus.Disconnected,
  );
  private stockUpdatesSubject = new Subject<Stock>();
  private allStocksSubject = new Subject<Stock[]>();

  public connectionStatus = this.connectionStatusSubject.asObservable();
  public stockUpdates = this.stockUpdatesSubject.asObservable();
  public allStocks = this.allStocksSubject.asObservable();

  constructor(private http: HttpClient) {}

  async connect() {
    try {
      console.log('🔄 Trying to connect to SignalR at:', this.hubUrl);
      this.connectionStatusSubject.next(ConnectionStatus.Connecting);

      this.hubConnection = new HubConnectionBuilder()
        .withUrl(this.hubUrl)
        .withAutomaticReconnect([0, 1000, 5000, 10000, 30000])
        .build();

      this.setupEventHandlers();

      await this.hubConnection.start();
      console.log('SignalR Connected successfully!');

      this.connectionStatusSubject.next(ConnectionStatus.Connected);

      //await this.getStocksHttp();
      try {
        console.log('📊 Requesting initial stock data...');
        const stocks = await this.hubConnection.invoke('getAllStocks');
        console.log('📈 Received stocks:', stocks?.length || 0);
        this.allStocksSubject.next(stocks);
      } catch (error) {
        console.warn('Nie można pobrać danych po połączeniu:', error);
      }
    } catch (error) {
      console.error('Error connecting to SignalR:', error);
      this.connectionStatusSubject.next(ConnectionStatus.Error);
    }
  }

  private setupEventHandlers() {
    if (!this.hubConnection) return;

    this.hubConnection.on('StockUpdate', (stock: Stock) => {
      console.log('Stock update received:', stock);
      this.stockUpdatesSubject.next(stock);
    });

    this.hubConnection.on('AllStocks', (stocks: Stock[]) => {
      console.log('All stocks received:', stocks?.length || 0);
      this.allStocksSubject.next(stocks);
    });

    // Handler dla backendu Docker (updateStockPrice)
    this.hubConnection.on('updateStockPrice', (stockUpdate: Stock) => {
      if (stockUpdate) {
        // const stock: Stock = {
        //   symbol: stockUpdate.symbol,
        //   price: stockUpdate.price,
        //   change: stockUpdate.change,
        //   percentChange: stockUpdate.percentChange,
        //   dayMax: stockUpdate.dayMax,
        //   dayMin: stockUpdate.dayMin,
        //   dayOpen: stockUpdate.dayOpen,
        //   lastUpdate: stockUpdate.lastUpdate,
        // };

        console.log('Transformed stock update:', stockUpdate);
        this.stockUpdatesSubject.next(stockUpdate);
      }
    });

    // this.hubConnection.on('*', (...args: any[]) => {
    //   console.log('🔍 Unknown SignalR event received:', args);
    // });

    // Obsługa event-ów połączenia
    this.hubConnection.onclose(() => {
      this.connectionStatusSubject.next(ConnectionStatus.Disconnected);
      console.log('SignalR Disconnected');
    });

    this.hubConnection.onreconnecting(() => {
      this.connectionStatusSubject.next(ConnectionStatus.Reconnecting);
      console.log('SignalR Reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      this.connectionStatusSubject.next(ConnectionStatus.Connected);
      console.log('SignalR Reconnected');
    });
  }

  async disconnect() {
    try {
      if (this.hubConnection) {
        await this.hubConnection.stop();
        this.connectionStatusSubject.next(ConnectionStatus.Disconnected);
        console.log('SignalR Disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting from SignalR:', error);
    }
  }

  // Sprawdzenie statusu połączenia
  get isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }

  // HTTP methods for REST API calls
  // getStocksHttp(): Observable<Stock[]> {
  //   return this.http.get<Stock[]>('/stocks');
  // }

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
