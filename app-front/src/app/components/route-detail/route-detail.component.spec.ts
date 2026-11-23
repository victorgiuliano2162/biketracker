import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { RouteDetailComponent } from './route-detail.component';
import { AuthService } from '../../services/auth/auth.service';

describe('RouteDetailComponent', () => {
  let component: RouteDetailComponent;
  let fixture: ComponentFixture<RouteDetailComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);
    authServiceSpy.getCurrentUserId.and.returnValue('owner-1');

    await TestBed.configureTestingModule({
      imports: [RouteDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceSpy },
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
                    ownerId: 'owner-1',
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

  it('should identify owner and show action menu button', () => {
    expect(component.isOwner).toBeTrue();
    const moreBtn = fixture.nativeElement.querySelector('.more-btn');
    expect(moreBtn).toBeTruthy();
  });

  it('should hide action menu button for non-owner viewing public route', () => {
    authServiceSpy.getCurrentUserId.and.returnValue('other-user');
    fixture.detectChanges();
    expect(component.isOwner).toBeFalse();
    const moreBtn = fixture.nativeElement.querySelector('.more-btn');
    expect(moreBtn).toBeNull();
  });
});
