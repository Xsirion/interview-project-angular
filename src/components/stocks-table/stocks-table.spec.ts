import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StocksTable } from './stocks-table';

describe('StocksTable', () => {
  let component: StocksTable;
  let fixture: ComponentFixture<StocksTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StocksTable],
    }).compileComponents();

    fixture = TestBed.createComponent(StocksTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
