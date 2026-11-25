import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './Auth.interceptor';
import { AuthService } from '../../services/auth/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getAccessToken',
      'refresh',
      'logout',
    ]);
    authServiceSpy.getAccessToken.and.returnValue('token-123');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should attach Authorization header on protected endpoints', () => {
    http.get('/api/routes/my').subscribe();

    const req = httpMock.expectOne('/api/routes/my');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush([]);
  });

  it('should NOT attach Authorization header on public auth endpoints', () => {
    http.post('/api/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should NOT attach Authorization header on user registration POST /api/user', () => {
    http.post('/api/user', {}).subscribe();

    const req = httpMock.expectOne('/api/user');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should refresh token and retry request on 401', () => {
    authServiceSpy.getAccessToken.and.returnValues('expired-token', 'new-token');
    authServiceSpy.refresh.and.returnValue(
      of({ accessToken: 'new-token', refreshToken: 'new-refresh' }),
    );

    let responseData: any;
    http.get('/api/user/me').subscribe((res) => (responseData = res));

    const firstReq = httpMock.expectOne('/api/user/me');
    expect(firstReq.request.headers.get('Authorization')).toBe('Bearer expired-token');
    firstReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    const retryReq = httpMock.expectOne('/api/user/me');
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
    retryReq.flush({ id: 'u-1' });

    expect(responseData).toEqual({ id: 'u-1' });
  });

  it('should logout when refresh fails after 401', () => {
    authServiceSpy.refresh.and.returnValue(throwError(() => new Error('refresh failed')));

    let failed = false;
    http.get('/api/user/me').subscribe({
      error: () => (failed = true),
    });

    const req = httpMock.expectOne('/api/user/me');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(failed).toBeTrue();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
