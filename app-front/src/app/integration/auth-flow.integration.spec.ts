import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { UserService } from '../services/user/user.service';
import { LoadingService } from '../services/loading/loading.service';
import { authInterceptor } from '../interceptors/auth/Auth.interceptor';
import { loadingInterceptor } from '../interceptors/loading/Loading.interceptor';
import { adminGuard, authGuard } from '../guards/Auth.guard';

@Component({ standalone: true, template: '<p>Dummy</p>' })
class DummyComponent {}

function buildJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('Integration: Auth Flow (AuthService + Interceptors + Guards)', () => {
  let authService: AuthService;
  let userService: UserService;
  let loadingService: LoadingService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: DummyComponent },
          { path: 'home', component: DummyComponent, canActivate: [authGuard] },
          { path: 'admin/users', component: DummyComponent, canActivate: [authGuard, adminGuard] },
        ]),
      ],
    });

    authService = TestBed.inject(AuthService);
    userService = TestBed.inject(UserService);
    loadingService = TestBed.inject(LoadingService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should execute full lifecycle: login -> guarded navigation -> 401 refresh & retry -> logout', async () => {
    // 1. Sem login, rota protegida redireciona para /login
    await router.navigateByUrl('/home');
    expect(router.url).toBe('/login');

    // 2. Login armazena JWT com role USER e libera /home, mas bloqueia /admin/users
    const initialToken = buildJwt({
      user_id: 'user-1',
      role: 'USER',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    authService.login({ email: 'atleta@teste.com', password: 'Password1' }).subscribe();
    const loginReq = httpMock.expectOne('/api/auth/login');
    expect(loginReq.request.headers.has('Authorization')).toBeFalse();
    expect(loadingService.isLoading()).toBeTrue();
    loginReq.flush({ accessToken: initialToken, refreshToken: 'refresh-v1' });

    expect(authService.isAuthenticated()).toBeTrue();
    await router.navigateByUrl('/home');
    expect(router.url).toBe('/home');

    await router.navigateByUrl('/admin/users');
    expect(router.url).toBe('/home');

    // 3. Chamada protegida recebe 401 -> interceptor faz refresh -> refaz chamada com novo token
    const refreshedToken = buildJwt({
      user_id: 'user-1',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    let loadedUser: any;
    userService.getMe().subscribe((u) => (loadedUser = u));

    const firstMeReq = httpMock.expectOne('/api/user/me');
    expect(firstMeReq.request.headers.get('Authorization')).toBe(`Bearer ${initialToken}`);
    firstMeReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('/api/auth/refresh');
    expect(refreshReq.request.body).toEqual({ refreshToken: 'refresh-v1' });
    refreshReq.flush({ accessToken: refreshedToken, refreshToken: 'refresh-v2' });

    const retryMeReq = httpMock.expectOne('/api/user/me');
    expect(retryMeReq.request.headers.get('Authorization')).toBe(`Bearer ${refreshedToken}`);
    retryMeReq.flush({ id: 'user-1', name: 'Atleta', email: 'atleta@teste.com' });

    expect(loadedUser?.id).toBe('user-1');

    // Agora com role ADMIN no token renovado, /admin/users é liberado
    await router.navigateByUrl('/admin/users');
    expect(router.url).toBe('/admin/users');

    // 4. Logout revoga refresh token no backend e limpa sessão
    authService.logout();
    const logoutReq = httpMock.expectOne('/api/auth/logout');
    expect(logoutReq.request.body).toEqual({ refreshToken: 'refresh-v2' });
    logoutReq.flush(null);

    expect(authService.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
