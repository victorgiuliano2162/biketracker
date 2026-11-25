import { computeBoundingBox, formatDuration } from './geo.utils';

describe('geo.utils', () => {
  it('should compute symmetric bounding box around coordinates', () => {
    const bbox = computeBoundingBox(-8.05, -34.87, 10);

    expect(bbox.minLat).toBeLessThan(-8.05);
    expect(bbox.maxLat).toBeGreaterThan(-8.05);
    expect(bbox.minLon).toBeLessThan(-34.87);
    expect(bbox.maxLon).toBeGreaterThan(-34.87);
    expect(bbox.maxLat - -8.05).toBeCloseTo(-8.05 - bbox.minLat, 6);
  });

  it('should format duration in minutes when under 1 hour', () => {
    expect(formatDuration(2700)).toBe('45min');
    expect(formatDuration(0)).toBe('0min');
  });

  it('should format duration in hours and minutes when >= 1 hour', () => {
    expect(formatDuration(4980)).toBe('1h 23min');
    expect(formatDuration(7200)).toBe('2h 0min');
  });
});
