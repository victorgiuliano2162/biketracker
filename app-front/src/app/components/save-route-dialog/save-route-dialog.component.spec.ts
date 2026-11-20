import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { SaveRouteDialogComponent } from './save-route-dialog.component';

describe('SaveRouteDialogComponent', () => {
  let component: SaveRouteDialogComponent;
  let fixture: ComponentFixture<SaveRouteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveRouteDialogComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') }
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            defaultName: 'Minha Rota',
            stats: {
              activeId: '1',
              name: 'Minha Rota',
              points: 10,
              distanceKm: 10,
              elevationGainM: 100,
              loadingElevation: false,
              elevationProfile: null
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveRouteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
