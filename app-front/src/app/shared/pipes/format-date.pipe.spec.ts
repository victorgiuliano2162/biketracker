import { FormatDatePipe } from './format-date.pipe';

describe('FormatDatePipe', () => {
  const pipe = new FormatDatePipe();

  it('should return empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should format ISO date in pt-BR short and long styles', () => {
    const shortRes = pipe.transform('2026-11-15T12:00:00Z', 'short');
    const longRes = pipe.transform('2026-11-15T12:00:00Z', 'long');
    expect(shortRes).toContain('2026');
    expect(longRes).toContain('2026');
    expect(longRes.length).toBeGreaterThanOrEqual(shortRes.length);
  });
});
