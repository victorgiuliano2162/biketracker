import { TestBed } from '@angular/core/testing';
import { ElevationService } from './elevation.service';

describe('ElevationService', () => {
  let service: ElevationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElevationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate positive elevation gain only', () => {
    expect(service.calculateElevationGain([100, 120, 110, 150, 140])).toBe(60);
    expect(service.calculateElevationGain([])).toBe(0);
  });

  it('should calculate distance in km using Haversine', () => {
    const km = service.calculateDistanceKm([
      [-8.05, -34.87],
      [-8.06, -34.87],
    ]);
    expect(km).toBeGreaterThan(1.0);
    expect(km).toBeLessThan(1.2);
  });

  it('should build elevation profile with cumulative distances', () => {
    const profile = service.buildProfile(
      [[-8.05, -34.87], [-8.06, -34.87]],
      [10, 25],
    );
    expect(profile.distances.length).toBe(2);
    expect(profile.distances[0]).toBe(0);
    expect(profile.distances[1]).toBeGreaterThan(0);
    expect(profile.elevations).toEqual([10, 25]);
  });

  it('should downsample coordinates when exceeding max', () => {
    const coords: [number, number][] = Array.from({ length: 20 }, (_, i) => [i, i]);
    expect(service.sample(coords, 50).length).toBe(20);
    expect(service.sample(coords, 5).length).toBe(5);
  });
});
