import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HomeDataService } from './home-data.service';

describe('HomeDataService', () => {
  let service: HomeDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HomeDataService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(HomeDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch dashboard stats via GET /api/home/stats', () => {
    service.getStats().subscribe((stats) => {
      expect(stats.totalRides).toBe(3);
      expect(stats.totalDistanceKm).toBe(45);
    });

    const req = httpMock.expectOne('/api/home/stats');
    expect(req.request.method).toBe('GET');
    req.flush({
      totalDistanceKm: 45,
      totalElevationMeters: 400,
      totalRides: 3,
      recentRides: [],
      weeklyChart: [],
      activeGoals: [],
    });
  });
});
