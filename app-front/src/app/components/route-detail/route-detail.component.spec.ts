import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { RouteDetailComponent } from './route-detail.component';

describe('RouteDetailComponent', () => {
  let component: RouteDetailComponent;
  let fixture: ComponentFixture<RouteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                data: {
                  route: {
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
                    createdDate: new Date().toISOString(),
                    activityImages: [],
                  },
                  points: [],
                },
              },
            },
          },
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
