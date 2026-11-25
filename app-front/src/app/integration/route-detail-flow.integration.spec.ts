import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from '../interceptors/auth/Auth.interceptor';
import { authGuard } from '../guards/Auth.guard';
import { routeDetailResolver } from '../resolvers/route-detail.resolver';
import { RouteDetailComponent } from '../components/route-detail/route-detail.component';

function buildJwt(payload: Record<string, unknown>): string {
  return `${btoa(JSON.stringify({ alg: 'RS256' }))}.${btoa(JSON.stringify(payload))}.sig`;
}

describe('Integration: Route Detail Flow (Router + Resolver + Services + Component)', () => {
  let httpMock: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    localStorage.clear();
    const visitorToken = buildJwt({
      user_id: 'visitor-2',
      role: 'USER',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    localStorage.setItem('accessToken', visitorToken);

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([
          {
            path: 'routes/:id',
            component: RouteDetailComponent,
            canActivate: [authGuard],
            resolve: { data: routeDetailResolver },
          },
        ]),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should resolve another user public route, hide owner actions, and allow commenting', async () => {
    const navPromise = harness.navigateByUrl('/routes/pub-42', RouteDetailComponent);
    await Promise.resolve();

    // Resolver dispara GET route + GET replay em paralelo com Bearer token
    const routeReq = httpMock.expectOne('/api/routes/my/pub-42');
    expect(routeReq.request.headers.get('Authorization')).toContain('Bearer ');
    const replayReq = httpMock.expectOne('/api/routes/my/pub-42/replay');

    routeReq.flush({
      id: 'pub-42',
      name: 'Pedal Litoral Norte',
      description: 'Trecho plano com vista para o mar',
      distanceInKm: 32.4,
      elevationInMeters: 180,
      startTime: '2026-11-10T07:00:00',
      endTime: '2026-11-10T08:30:00',
      createdAt: '2026-11-10T08:35:00',
      startCity: 'Olinda',
      country: 'BR',
      isPublic: true,
      routeDifficulty: 'MODERADA',
      userName: 'Maria Ciclista',
      ownerId: 'owner-1',
    });

    replayReq.flush({
      routeId: 'pub-42',
      points: [
        { latitude: -8.01, longitude: -34.85, altitudeInMeters: 15, recordedAt: '2026-11-10T07:00:00' },
        { latitude: -8.02, longitude: -34.86, altitudeInMeters: 30, recordedAt: '2026-11-10T07:15:00' },
      ],
    });

    const component = await navPromise;

    // ngOnInit dispara carregamento assíncrono de fotos e comentários
    httpMock.expectOne('/api/activities/pub-42/images').flush([]);
    httpMock.expectOne('/api/routes/pub-42/comments').flush([]);
    harness.detectChanges();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Pedal Litoral Norte');
    expect(text).toContain('Por Maria Ciclista');
    expect(text).toContain('Trecho plano com vista para o mar');
    expect(component.isOwner).toBeFalse();
    expect(harness.routeNativeElement?.querySelector('.more-btn')).toBeNull();

    // Visitante publica um comentário real via CommentService + HttpClient
    component.newComment = 'Trilha sensacional!';
    component.submitComment();

    const postCommentReq = httpMock.expectOne('/api/routes/pub-42/comments');
    expect(postCommentReq.request.method).toBe('POST');
    expect(postCommentReq.request.body).toEqual({ content: 'Trilha sensacional!' });
    postCommentReq.flush({
      id: 99,
      routeId: 'pub-42',
      authorId: 'visitor-2',
      authorName: 'Visitante',
      content: 'Trilha sensacional!',
      edited: false,
      createdAt: '2026-11-10T09:00:00',
      updatedAt: '2026-11-10T09:00:00',
    });

    expect(component.comments.length).toBe(1);
    expect(component.canDeleteComment(component.comments[0])).toBeTrue();

    // Visitante exclui o próprio comentário
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteComment(component.comments[0]);

    const delCommentReq = httpMock.expectOne('/api/routes/pub-42/comments/99');
    expect(delCommentReq.request.method).toBe('DELETE');
    delCommentReq.flush(null);

    expect(component.comments.length).toBe(0);
  });
});
