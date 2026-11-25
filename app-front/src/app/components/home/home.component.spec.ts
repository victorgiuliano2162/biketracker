import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { HomeComponent } from './home.component';
import { RouteService } from '../../services/route/route.service';
import { LocationService } from '../../services/location/location.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let routeServiceSpy: jasmine.SpyObj<RouteService>;
  let locationServiceSpy: jasmine.SpyObj<LocationService>;

  const samplePage = {
    content: [],
    page: { size: 9, number: 0, totalElements: 12, totalPages: 2 },
  };

  beforeEach(async () => {
    routeServiceSpy = jasmine.createSpyObj('RouteService', [
      'getPublicRoutes',
      'getPublicRoutesInRegion',
      'checkPreview',
    ]);
    locationServiceSpy = jasmine.createSpyObj('LocationService', ['getUserLocation']);

    routeServiceSpy.getPublicRoutes.and.returnValue(of(samplePage));
    routeServiceSpy.getPublicRoutesInRegion.and.returnValue(of(samplePage));

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: RouteService, useValue: routeServiceSpy },
        { provide: LocationService, useValue: locationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load public routes on init', () => {
    expect(component).toBeTruthy();
    expect(routeServiceSpy.getPublicRoutes).toHaveBeenCalledWith(0, 9);
    expect(component.totalElements).toBe(12);
    expect(component.loading).toBeFalse();
  });

  it('should load routes in region after requestLocation resolves', async () => {
    locationServiceSpy.getUserLocation.and.resolveTo({ lat: -8.05, lng: -34.87 });

    await component.requestLocation();

    expect(component.userLocation).toEqual({ lat: -8.05, lng: -34.87 });
    expect(routeServiceSpy.getPublicRoutesInRegion).toHaveBeenCalled();
  });

  it('should clear location and reload all public routes', () => {
    component.userLocation = { lat: -8.05, lng: -34.87 };
    component.currentPage = 2;

    component.clearLocation();

    expect(component.userLocation).toBeNull();
    expect(component.currentPage).toBe(0);
    expect(routeServiceSpy.getPublicRoutes).toHaveBeenCalledWith(0, 9);
  });

  it('should handle error when loading public routes fails', () => {
    routeServiceSpy.getPublicRoutes.and.returnValue(throwError(() => new Error('500')));
    component.onRadiusChange();
    expect(component.loading).toBeFalse();
  });
});
