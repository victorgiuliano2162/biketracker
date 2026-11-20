import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { GoalEditDialogComponent } from './goal-edit-dialog.component';

describe('GoalEditDialogComponent', () => {
  let component: GoalEditDialogComponent;
  let fixture: ComponentFixture<GoalEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalEditDialogComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') }
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            name: 'Meta 1',
            description: 'Desc',
            targetValue: 100,
            unit: 'km',
            deadLine: new Date().toISOString()
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
