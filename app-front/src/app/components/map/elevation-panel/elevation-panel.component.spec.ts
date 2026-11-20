import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ElevationPanelComponent } from './elevation-panel.component';

describe('ElevationPanelComponent', () => {
  let component: ElevationPanelComponent;
  let fixture: ComponentFixture<ElevationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElevationPanelComponent],
      providers: [
        provideNoopAnimations(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElevationPanelComponent);
    component = fixture.componentInstance;
    component.stats = {
      activeId: '1',
      name: 'Rota Teste',
      points: 10,
      distanceKm: 5,
      elevationGainM: 50,
      loadingElevation: false,
      elevationProfile: null
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
