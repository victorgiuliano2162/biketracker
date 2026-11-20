import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { SuccessdialogComponent } from './successdialog.component';

describe('SuccessdialogComponent', () => {
  let component: SuccessdialogComponent;
  let fixture: ComponentFixture<SuccessdialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessdialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
