import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';
import { routeDetailResolver, RouteDetailData } from './route-detail.resolver';
import { RouteService } from '../services/route/route.service';

describe('routeDetailResolver', () => {
  let routeServiceSpy: jasmine.SpyObj<RouteService>;
  let routerSpy: jasmine.SpyObj<Router>;
  const state = {} as RouterStateSnapshot;

  const executeResolver: ResolveFn<RouteDetailData | null> = (...params) =>
    TestBed.runInInjectionContext(() => routeDetailResolver(...params));

  beforeEach(() => {
    routeServiceSpy = jasmine.createSpyObj('RouteService', ['getById', 'getReplay']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: RouteService, useValue: routeServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should resolve route and points when id is present', (done) => {
    routeServiceSpy.getById.and.returnValue(of({ id: 'r-1', name: 'Trilha' } as any));
    routeServiceSpy.getReplay.and.returnValue(of({ routeId: 'r-1', points: [{ latitude: -8, longitude: -34, altitudeInMeters: 10, recordedAt: '' }] }));

    const snapshot = { paramMap: { get: () => 'r-1' } } as unknown as ActivatedRouteSnapshot;
    const obs$ = executeResolver(snapshot, state) as any;

    obs$.subscribe((result: RouteDetailData | null) => {
      expect(result).toBeTruthy();
      expect(result?.route.id).toBe('r-1');
      expect(result?.points.length).toBe(1);
      done();
    });
  });

  it('should navigate to /routes when id is missing', (done) => {
    const snapshot = { paramMap: { get: () => null } } as unknown as ActivatedRouteSnapshot;
    const obs$ = executeResolver(snapshot, state) as any;

    obs$.subscribe((result: RouteDetailData | null) => {
      expect(result).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/routes']);
      done();
    });
  });

  it('should navigate to /routes when API fails', (done) => {
    routeServiceSpy.getById.and.returnValue(throwError(() => new Error('403')));
    routeServiceSpy.getReplay.and.returnValue(of({ routeId: 'r-1', points: [] }));

    const snapshot = { paramMap: { get: () => 'r-1' } } as unknown as ActivatedRouteSnapshot;
    const obs$ = executeResolver(snapshot, state) as any;

    obs$.subscribe((result: RouteDetailData | null) => {
      expect(result).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/routes']);
      done();
    });
  });
});
