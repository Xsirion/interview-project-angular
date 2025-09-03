import { describe, it, expect, beforeEach } from 'vitest';
import { CustomDatePipe } from './custom-date-pipe';

describe('CustomDatePipe', () => {
  let pipe: CustomDatePipe;

  beforeEach(() => {
    pipe = new CustomDatePipe();
  });

  it('should format ISO date string to Polish locale time hour minute second', () => {
    const isoString = '2024-01-15T10:30:45Z';
    const result = pipe.transform(isoString);

    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('should check for different date formats', () => {
    const dateString = '2024-01-15T14:25:30.123Z';
    const result = pipe.transform(dateString);

    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});
