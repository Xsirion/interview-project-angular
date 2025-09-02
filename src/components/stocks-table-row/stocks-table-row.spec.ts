import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StocksTableRow } from './stocks-table-row';

describe('StocksTableRow', () => {
  let component: StocksTableRow;
  let fixture: ComponentFixture<StocksTableRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StocksTableRow],
    }).compileComponents();

    fixture = TestBed.createComponent(StocksTableRow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
