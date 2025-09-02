import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalRService } from '../../services/signalr.service';
import { StocksStore } from '../../stores/stocks.store';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stocks-table',
  imports: [CommonModule],
  templateUrl: './stocks-table.html',
  styleUrl: './stocks-table.css',
})
export class StocksTable implements OnInit, OnDestroy {
  public signalRService = inject(SignalRService);
  protected readonly stocksStore = inject(StocksStore);

  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.setupStoreSubscriptions();

    this.stocksStore.initialize();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.signalRService.disconnect();
  }

  getCellAnimationClass(symbol: string, field: string): string {
    const animationType = this.stocksStore.getAnimationType(symbol, field);
    if (!animationType) return '';

    switch (animationType) {
      case 'increase':
        return 'cell-increase';
      case 'decrease':
        return 'cell-decrease';
      case 'time-update':
        return 'cell-time-update';
      default:
        return '';
    }
  }

  getValueTextClass(symbol: string, field: string): string {
    const animationType = this.stocksStore.getAnimationType(symbol, field);
    if (!animationType) return '';

    switch (animationType) {
      case 'increase':
        return 'text-increase';
      case 'decrease':
        return 'text-decrease';
      case 'time-update':
        return 'text-time-updated';
      default:
        return '';
    }
  }

  private setupStoreSubscriptions(): void {
    this.stocksStore.listenToConnectionStatus();
    this.stocksStore.listenToStockUpdates();
    this.stocksStore.listenToAllStocks();
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
