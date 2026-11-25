import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouteMapComponent } from './route-map.component';

describe('RouteMapComponent', () => {
  let component: RouteMapComponent;
  let fixture: ComponentFixture<RouteMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteMapComponent);
    component = fixture.componentInstance;
    component.points = [
      { latitude: -8.05, longitude: -34.87, altitudeInMeters: 10, recordedAt: '2026-11-01T08:00:00' },
      { latitude: -8.06, longitude: -34.88, altitudeInMeters: 20, recordedAt: '2026-11-01T08:05:00' },
    ];
    fixture.detectChanges();
  });

  it('should create and initialize Leaflet map with route points', () => {
    expect(component).toBeTruthy();
    expect((component as any).map).toBeTruthy();
    expect((component as any).polyline).toBeTruthy();
  });

  it('should create and remove cursor marker when activeIndex changes', () => {
    component.activeIndex = 0;
    expect((component as any).cursorMarker).toBeTruthy();

    component.activeIndex = 1;
    expect((component as any).cursorMarker).toBeTruthy();

    component.activeIndex = null;
    expect((component as any).cursorMarker).toBeNull();
  });
});
