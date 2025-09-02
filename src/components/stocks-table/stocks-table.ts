import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalRService } from '../../services/signalr.service';
import { StocksStore } from '../../stores/stocks.store';
import { ConnectionStatus } from '../../model/stock.model';

@Component({
  selector: 'app-stocks-table',
  imports: [CommonModule],
  templateUrl: './stocks-table.html',
  styleUrl: './stocks-table.css',
})
export class StocksTable implements OnInit, OnDestroy {
  public signalRService = inject(SignalRService);
  protected readonly stocksStore = inject(StocksStore);

  connect = () => this.signalRService.connect();
  disconnect = () => this.signalRService.disconnect();
  refresh = () => this.stocksStore.refresh();

  get isConnected() {
    return this.stocksStore.connectionStatus() === ConnectionStatus.Connected;
  }

  get isLoading() {
    return this.stocksStore.isLoading();
  }

  get isError() {
    return this.stocksStore.error();
  }

  ngOnInit(): void {
    this.setupSubscriptions();
    this.stocksStore.initialize();
  }

  ngOnDestroy(): void {
    this.signalRService.disconnect();
  }

  private setupSubscriptions(): void {
    this.stocksStore.listenToConnectionStatus();
    this.stocksStore.listenToStockUpdates();
    this.stocksStore.listenToAllStocks();
  }

  getCellAnimationClass(symbol: string, field: string): string {
    if (this.stocksStore.hasAnimation(symbol, field, 'increase')) {
      return 'cell-increase';
    }
    if (this.stocksStore.hasAnimation(symbol, field, 'decrease')) {
      return 'cell-decrease';
    }
    if (this.stocksStore.hasAnimation(symbol, field, 'time-update')) {
      return 'cell-time-update';
    }
    return '';
  }

  formatPrice(value: number): string {
    return value.toFixed(4).replace('.', ',');
  }

  formatPercent(value: number): string {
    if (value === null || value === undefined) return '0.00%';
    return value.toFixed(2).replace('.', ',') + '%';
  }

  formatDate(lastUpdateTime: string): string {
    const date = new Date(lastUpdateTime);
    return date.toLocaleTimeString('pl-PL');
  }

  getChangeClass(change: number): string {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-900';
  }

  getChangeIcon(change: number): string {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  }

  abs(value: number): number {
    return Math.abs(value);
  }
}
