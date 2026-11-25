import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { StatusComponent } from './status.component';
import { HomeDataService, HomeStats } from '../../services/home-data/home-data.service';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;
  let homeDataServiceSpy: jasmine.SpyObj<HomeDataService>;

  const mockStats: HomeStats = {
    totalRides: 4,
    totalDistanceKm: 120.5,
    totalElevationMeters: 1500,
    activeGoals: [
      {
        id: 1,
        name: 'Meta 1',
        description: 'Desc',
        targetValue: 100,
        currentValue: 20,
        progressPercent: 20,
        unit: 'km',
        deadLine: '2026-12-31',
      },
      {
        id: 2,
        name: 'Meta 2',
        description: 'Desc',
        targetValue: 100,
        currentValue: 80,
        progressPercent: 80,
        unit: 'km',
        deadLine: '2026-12-31',
      },
    ],
    recentRides: [],
    weeklyChart: [{ date: '2026-11-20', distanceKm: 30 }],
  };

  beforeEach(async () => {
    homeDataServiceSpy = jasmine.createSpyObj('HomeDataService', ['getStats']);
    homeDataServiceSpy.getStats.and.returnValue(of(mockStats));

    await TestBed.configureTestingModule({
      imports: [StatusComponent],
      providers: [
        provideNoopAnimations(),
        { provide: HomeDataService, useValue: homeDataServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and sort active goals by progress descending', () => {
    expect(component).toBeTruthy();
    expect(component.loading).toBeFalse();
    expect(component.error).toBeFalse();
    expect(component.stats?.activeGoals[0].id).toBe(2);
    expect(component.chartData).toEqual([{ name: '2026-11-20', value: 30 }]);
  });

  it('should set error state when getStats fails and recover on retry', () => {
    homeDataServiceSpy.getStats.and.returnValue(throwError(() => new Error('fail')));
    component.loadStats();

    expect(component.error).toBeTrue();
    expect(component.loading).toBeFalse();

    homeDataServiceSpy.getStats.and.returnValue(of(mockStats));
    component.loadStats();

    expect(component.error).toBeFalse();
    expect(component.stats).toBeTruthy();
  });
});
