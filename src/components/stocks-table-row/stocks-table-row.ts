import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Stock } from '../../model/stock.model';
import { PricePipe } from '../../pipes/price-pipe';
import { StocksStore } from '../../stores/stocks.store';
import { PercentPipe } from '../../pipes/percent-pipe';
import { CustomDatePipe } from '../../pipes/custom-date-pipe';

@Component({
  selector: '[app-stocks-table-row]',
  imports: [PricePipe, PercentPipe, CustomDatePipe],
  templateUrl: './stocks-table-row.html',
  styleUrl: './stocks-table-row.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StocksTableRow {
  stock = input.required<Stock>();
  private stocksStore = inject(StocksStore);

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
