import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StocksService } from '../../services/stocks.service';
import { StocksStore } from '../../stores/stocks.store';
import { ConnectionStatus } from '../../model/stock.model';
import { StocksTableRow } from '../stocks-table-row/stocks-table-row';
import { CustomDatePipe } from '../../pipes/custom-date-pipe';

@Component({
  selector: 'app-stocks-table',
  imports: [CommonModule, StocksTableRow, CustomDatePipe],
  templateUrl: './stocks-table.html',
  styleUrl: './stocks-table.css',
})
export class StocksTable implements OnInit, OnDestroy {
  public stocksService = inject(StocksService);
  protected readonly stocksStore = inject(StocksStore);

  connect = () => this.stocksService.connect();
  disconnect = () => this.stocksService.disconnect();
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
    this.stocksStore.cleanup();
    this.stocksService.disconnect();
  }

  private setupSubscriptions(): void {
    this.stocksStore.listenToConnectionStatus();
    this.stocksStore.listenToStockUpdates();
    this.stocksStore.listenToAllStocks();
  }
}
