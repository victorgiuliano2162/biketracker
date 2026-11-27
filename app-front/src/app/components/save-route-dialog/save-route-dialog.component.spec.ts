import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SaveRouteDialogComponent } from './save-route-dialog.component';

describe('SaveRouteDialogComponent', () => {
  let component: SaveRouteDialogComponent;
  let fixture: ComponentFixture<SaveRouteDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SaveRouteDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SaveRouteDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            defaultName: 'Minha Rota',
            stats: {
              activeId: '1',
              name: 'Minha Rota',
              points: 10,
              distanceKm: 12.345,
              elevationGainM: 250.4,
              loadingElevation: false,
              elevationProfile: null,
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SaveRouteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should format distance and elevation labels', () => {
    expect(component.distanceLabel).toBe('12.35 km');
    expect(component.elevationLabel).toBe('250 m');
  });

  it('should close dialog with name, trimmed description and visibility on confirm', () => {
    component.form.patchValue({
      name: 'Serra Negra',
      description: '  Subida técnica com água no km 10  ',
      country: 'BR',
      isPublic: true,
      difficulty: 'DIFICIL',
    });

    component.confirm();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      name: 'Serra Negra',
      description: 'Subida técnica com água no km 10',
      country: 'BR',
      isPublic: true,
      routeDifficulty: 'DIFICIL',
      images: [],
    });
  });

  it('should block confirm while images are validating', () => {
    component.onValidatingChange(true);
    component.confirm();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close without payload on cancel', () => {
    component.cancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });
});
