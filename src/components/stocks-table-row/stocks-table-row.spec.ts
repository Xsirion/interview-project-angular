import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StocksTableRow } from './stocks-table-row';
import { StocksStore } from '../../stores/stocks.store';
import { Stock } from '../../model/stock.model';

describe('StocksTableRow', () => {
  let component: StocksTableRow;
  let fixture: ComponentFixture<StocksTableRow>;
  let mockStocksStore: Partial<typeof StocksStore>;
  let mockStock: Stock;

  beforeEach(async () => {
    mockStock = {
      symbol: 'DELL',
      price: 150.25,
      dayMax: 152.0,
      dayMin: 148.5,
      dayOpen: 149.0,
      lastUpdate: '2024-01-15T10:30:00Z',
      change: 1.25,
      percentChange: 0.84,
    };

    mockStocksStore = {
      hasAnimation: () => false,
    };

    await TestBed.configureTestingModule({
      imports: [StocksTableRow],
      providers: [{ provide: StocksStore, useValue: mockStocksStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(StocksTableRow);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('stock', mockStock);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have stock input set', () => {
    expect(component.stock()).toEqual(mockStock);
  });

  it('should check change class for positive change', () => {
    const result = component.getChangeClass(1.25);
    expect(result).toBe('text-green-600');
  });

  it('should check change class for negative change', () => {
    const result = component.getChangeClass(-1.25);
    expect(result).toBe('text-red-600');
  });

  it('should check change class for zero change', () => {
    const result = component.getChangeClass(0);
    expect(result).toBe('text-gray-900');
  });

  it('should check change icon for positive change', () => {
    const result = component.getChangeIcon(1.25);
    expect(result).toBe('↗');
  });

  it('should check change icon for negative change', () => {
    const result = component.getChangeIcon(-1.25);
    expect(result).toBe('↘');
  });

  it('should check change icon for zero change', () => {
    const result = component.getChangeIcon(0);
    expect(result).toBe('→');
  });

  it('should check empty string when no animation', () => {
    const result = component.getCellAnimationClass('DELL', 'price');
    expect(result).toBe('');
  });

  it('should check increase animation class', () => {
    mockStocksStore.hasAnimation = (symbol: string, field: string, type?: string) =>
      symbol === 'DELL' && field === 'price' && type === 'increase';

    const result = component.getCellAnimationClass('DELL', 'price');
    expect(result).toBe('cell-increase');
  });

  it('should check decrease animation class', () => {
    mockStocksStore.hasAnimation = (symbol: string, field: string, type?: string) =>
      symbol === 'DELL' && field === 'price' && type === 'decrease';

    const result = component.getCellAnimationClass('DELL', 'price');
    expect(result).toBe('cell-decrease');
  });

  it('should check time-update animation class', () => {
    mockStocksStore.hasAnimation = (symbol: string, field: string, type?: string) =>
      symbol === 'DELL' && field === 'price' && type === 'time-update';

    const result = component.getCellAnimationClass('DELL', 'price');
    expect(result).toBe('cell-time-update');
  });
});
