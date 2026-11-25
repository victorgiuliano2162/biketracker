import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store tokens and update isAuthenticated on login', () => {
    const token = makeJwt({
      user_id: 'u-1',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    service.login({ email: 'a@b.com', password: 'secret' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: token, refreshToken: 'refresh-1' });

    expect(localStorage.getItem('accessToken')).toBe(token);
    expect(localStorage.getItem('refreshToken')).toBe('refresh-1');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getCurrentUserId()).toBe('u-1');
    expect(service.getCurrentUserRole()).toBe('ADMIN');
    expect(service.isAdmin()).toBeTrue();
  });

  it('should call /api/auth/logout, clear storage and navigate to /login on logout', () => {
    localStorage.setItem('accessToken', 'acc');
    localStorage.setItem('refreshToken', 'ref-1');
    service.isAuthenticated.set(true);

    service.logout();

    const req = httpMock.expectOne('/api/auth/logout');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'ref-1' });
    req.flush(null);

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
