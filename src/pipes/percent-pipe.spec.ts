import { describe, it, expect, beforeEach } from 'vitest';
import { PercentPipe } from './percent-pipe';

describe('PercentPipe', () => {
  let pipe: PercentPipe;

  beforeEach(() => {
    pipe = new PercentPipe();
  });

  it('should format for positive', () => {
    expect(pipe.transform(1.23)).toBe('1,23%');
    expect(pipe.transform(0.45)).toBe('0,45%');
  });

  it('should format for negative', () => {
    expect(pipe.transform(-1.23)).toBe('-1,23%');
    expect(pipe.transform(-0.45)).toBe('-0,45%');
  });

  it('should handle null and undefined values', () => {
    expect(pipe.transform(null as any)).toBe('0,00%');
    expect(pipe.transform(undefined as any)).toBe('0,00%');
  });

  it('should handle zero', () => {
    expect(pipe.transform(0)).toBe('0,00%');
  });
});
