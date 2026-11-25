import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from '../interceptors/auth/Auth.interceptor';
import { loadingInterceptor } from '../interceptors/loading/Loading.interceptor';
import { ProfileComponent } from '../components/profile/profile.component';
import { GoalListComponent } from '../components/goal-list/goal-list.component';

function buildJwt(payload: Record<string, unknown>): string {
  return `${btoa(JSON.stringify({ alg: 'RS256' }))}.${btoa(JSON.stringify(payload))}.sig`;
}

describe('Integration: Profile & Goals Flows (Components + Real Services + Interceptors)', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem(
      'accessToken',
      buildJwt({
        user_id: 'user-1',
        role: 'USER',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, GoalListComponent],
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should load and update user profile end-to-end through UserService and authInterceptor', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const getReq = httpMock.expectOne('/api/user/me');
    expect(getReq.request.method).toBe('GET');
    expect(getReq.request.headers.get('Authorization')).toContain('Bearer ');
    getReq.flush({
      id: 'user-1',
      name: 'Victor',
      email: 'victor@teste.com',
      age: 26,
      weight: 74.5,
      bornAt: '1998-03-19T00:00:00',
      tipoSanguineo: 'O_POSITIVO',
    });

    expect(component.loading).toBeFalse();
    expect(component.profileForm.value.name).toBe('Victor');

    component.profileForm.patchValue({ name: 'Victor Atualizado', weight: 72 });
    component.onSave();

    const putReq = httpMock.expectOne('/api/user/me');
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body.name).toBe('Victor Atualizado');
    expect(putReq.request.body.weight).toBe(72);
    putReq.flush({
      id: 'user-1',
      name: 'Victor Atualizado',
      email: 'victor@teste.com',
      age: 26,
      weight: 72,
      bornAt: '1998-03-19T00:00:00',
      tipoSanguineo: 'O_POSITIVO',
    });

    expect(component.saving).toBeFalse();
    expect(component.profileForm.pristine).toBeTrue();
  });

  it('should load goals list and delete a goal through GoalService and authInterceptor', () => {
    const fixture = TestBed.createComponent(GoalListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const listReq = httpMock.expectOne('/api/goal');
    expect(listReq.request.method).toBe('GET');
    expect(listReq.request.headers.get('Authorization')).toContain('Bearer ');
    listReq.flush([
      {
        id: 7,
        name: '200 km no mês',
        description: 'Meta mensal',
        targetValue: 200,
        currentValue: 120,
        progressPercent: 60,
        unit: 'km',
        createdAt: '2026-11-01',
        deadLine: '2026-11-30',
      },
    ]);

    expect(component.goals.length).toBe(1);
    expect(component.goals[0].progressPercent).toBe(60);

    spyOn(window, 'confirm').and.returnValue(true);
    component.delete(component.goals[0]);

    const delReq = httpMock.expectOne('/api/goal/7');
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush(null);

    expect(component.goals.length).toBe(0);
  });
});
