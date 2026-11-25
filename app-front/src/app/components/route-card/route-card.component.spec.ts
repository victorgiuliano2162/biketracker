import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { RouteCardComponent } from './route-card.component';
import { RouteService } from '../../services/route/route.service';

describe('RouteCardComponent', () => {
  let component: RouteCardComponent;
  let fixture: ComponentFixture<RouteCardComponent>;
  let routeServiceSpy: jasmine.SpyObj<RouteService>;

  const baseRoute: any = {
    id: 'r-1',
    name: 'Rota Teste',
    distanceInKm: 18.5,
    elevationInMeters: 320,
    startTime: '2026-11-01T08:00:00',
    endTime: '2026-11-01T09:30:00',
    createdAt: '2026-11-01T09:30:00',
    startCity: 'Recife',
    country: 'BR',
    isPublic: true,
    routeDifficulty: 'MODERADA',
    userName: 'Victor',
  };

  beforeEach(async () => {
    routeServiceSpy = jasmine.createSpyObj('RouteService', ['checkPreview', 'getRouteReplay']);
    routeServiceSpy.checkPreview.and.returnValue(of('https://minio/preview.png'));

    await TestBed.configureTestingModule({
      imports: [RouteCardComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: RouteService, useValue: routeServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteCardComponent);
    component = fixture.componentInstance;
    component.route = { ...baseRoute };
    fixture.detectChanges();
  });

  it('should map difficulty labels and colors', () => {
    expect(component.difficultyLabel).toBe('Moderada');
    expect(component.difficultyColor).toBe('#ff9800');

    component.route.routeDifficulty = 'DIFICIL';
    expect(component.difficultyLabel).toBe('Difícil');
    expect(component.difficultyColor).toBe('#f44336');
  });

  it('should set ready state when checkPreview returns URL', () => {
    (component as any).checkAndLoadPreview();
    expect(component.state).toBe('ready');
    expect(component.previewUrl).toBe('https://minio/preview.png');
  });

  it('should set error state when checkPreview returns null or fails', () => {
    routeServiceSpy.checkPreview.and.returnValue(of(null));
    (component as any).checkAndLoadPreview();
    expect(component.state).toBe('error');

    routeServiceSpy.checkPreview.and.returnValue(throwError(() => new Error('err')));
    (component as any).checkAndLoadPreview();
    expect(component.state).toBe('error');
  });
});
