import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { adminGuard, authGuard, publicGuard } from './Auth.guard';
import { AuthService } from '../services/auth/auth.service';

describe('Auth Guards', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  const routeSnapshot = {} as ActivatedRouteSnapshot;
  const stateSnapshot = {} as RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'isAdmin']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('authGuard should allow when authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => authGuard(routeSnapshot, stateSnapshot));
    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('authGuard should redirect to /login when not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() => authGuard(routeSnapshot, stateSnapshot));
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('publicGuard should allow when not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() => publicGuard(routeSnapshot, stateSnapshot));
    expect(result).toBeTrue();
  });

  it('publicGuard should redirect to /home when authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => publicGuard(routeSnapshot, stateSnapshot));
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('adminGuard should allow when user is admin', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => adminGuard(routeSnapshot, stateSnapshot));
    expect(result).toBeTrue();
  });

  it('adminGuard should redirect to /home when user is not admin', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() => adminGuard(routeSnapshot, stateSnapshot));
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });
});
