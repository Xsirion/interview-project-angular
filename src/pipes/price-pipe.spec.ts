import { describe, it, expect, beforeEach } from 'vitest';
import { PricePipe } from './price-pipe';

describe('PricePipe', () => {
  let pipe: PricePipe;

  beforeEach(() => {
    pipe = new PricePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format to basic values', () => {
    expect(pipe.transform(123.4567)).toBe('123,4567');
    expect(pipe.transform(0.0001)).toBe('0,0001');
    expect(pipe.transform(1000)).toBe('1000,0000');
  });

  it('should handle for zero and negative values', () => {
    expect(pipe.transform(0)).toBe('0,0000');
    expect(pipe.transform(-123.45)).toBe('-123,4500');
  });
});
