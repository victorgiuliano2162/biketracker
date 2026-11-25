import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { EditRouteDialogComponent } from './edit-route-dialog.component';
import { RouteResponse } from '../../models/route.model';

describe('EditRouteDialogComponent', () => {
  let component: EditRouteDialogComponent;
  let fixture: ComponentFixture<EditRouteDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditRouteDialogComponent>>;

  const mockRoute: RouteResponse = {
    id: 'route-1',
    name: 'Trilha da Serra',
    description: 'Subida forte',
    distanceInKm: 25,
    elevationInMeters: 500,
    startTime: '2026-05-01T08:00:00',
    endTime: '2026-05-01T10:00:00',
    createdAt: '2026-05-01T10:05:00',
    startCity: 'Recife',
    country: 'BR',
    isPublic: true,
    routeDifficulty: 'DIFICIL',
    userName: 'Victor',
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [EditRouteDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditRouteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize form with route values', () => {
    expect(component).toBeTruthy();
    expect(component.form.value).toEqual({
      name: 'Trilha da Serra',
      description: 'Subida forte',
      difficulty: 'DIFICIL',
      startCity: 'Recife',
      country: 'BR',
    });
  });

  it('should close dialog with trimmed payload when form is valid', () => {
    component.form.patchValue({
      name: '  Nova Trilha  ',
      description: '  Descrição atualizada  ',
      difficulty: 'MODERADA',
      startCity: '  Olinda  ',
      country: 'BR',
    });

    component.save();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      name: 'Nova Trilha',
      description: 'Descrição atualizada',
      difficulty: 'MODERADA',
      startCity: 'Olinda',
      country: 'BR',
    });
  });

  it('should not close dialog when name is empty', () => {
    component.form.patchValue({ name: '' });
    component.save();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close without payload on cancel', () => {
    component.cancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });
});
