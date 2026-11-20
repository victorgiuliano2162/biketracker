import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { RouteCardComponent } from './route-card.component';

describe('RouteCardComponent', () => {
  let component: RouteCardComponent;
  let fixture: ComponentFixture<RouteCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteCardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteCardComponent);
    component = fixture.componentInstance;
    component.route = {
      id: '1',
      name: 'Rota Teste',
      country: 'BR',
      totalDistance: 10,
      elevationGain: 100,
      elevationLoss: 100,
      elevationMax: 500,
      elevationMin: 200,
      dificulty: 'MODERATE',
      isPublic: true,
      hasPreview: false,
      previewUrl: '',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      activityImages: [],
      userName: 'User Test',
      userId: 'user-1'
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
