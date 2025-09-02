import { Component, signal } from '@angular/core';
import { StocksTable } from '../components/stocks-table/stocks-table';

@Component({
  selector: 'app-root',
  imports: [StocksTable],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('interview-project-angular');
}
