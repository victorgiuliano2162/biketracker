import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MyRoutesComponent } from './my-routes.component';
import { RouteService } from '../../services/route/route.service';
import { NotificationService } from '../../shared/services/notification.service';

describe('MyRoutesComponent', () => {
  let component: MyRoutesComponent;
  let fixture: ComponentFixture<MyRoutesComponent>;
  let routeServiceSpy: jasmine.SpyObj<RouteService>;

  beforeEach(async () => {
    routeServiceSpy = jasmine.createSpyObj('RouteService', [
      'listMine',
      'deleteRoute',
      'toggleVisibility',
    ]);
    routeServiceSpy.listMine.and.returnValue(
      of({
        content: [
          {
            id: 'r-1',
            name: 'Rota 1',
            distanceInKm: 15,
            elevationInMeters: 200,
            startTime: '2026-11-01T08:00:00',
            endTime: '2026-11-01T09:00:00',
            createdAt: '2026-11-01T09:00:00',
            startCity: 'Recife',
            country: 'BR',
            isPublic: false,
            routeDifficulty: 'FACIL',
            userName: 'Victor',
          },
        ],
        page: { size: 10, number: 0, totalElements: 25, totalPages: 3 },
      }),
    );

    await TestBed.configureTestingModule({
      imports: [MyRoutesComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: RouteService, useValue: routeServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and read totalElements from Spring page wrapper', () => {
    expect(component).toBeTruthy();
    expect(component.routes.length).toBe(1);
    expect(component.totalElements).toBe(25);
  });

  it('should delete route when confirmed', () => {
    const notification = TestBed.inject(NotificationService);
    spyOn(notification, 'confirm').and.returnValue(of(true));
    routeServiceSpy.deleteRoute.and.returnValue(of(void 0));

    component.deleteRoute(component.routes[0], new MouseEvent('click'));

    expect(routeServiceSpy.deleteRoute).toHaveBeenCalledWith('r-1');
    expect(component.routes.length).toBe(0);
    expect(component.totalElements).toBe(24);
  });
});
