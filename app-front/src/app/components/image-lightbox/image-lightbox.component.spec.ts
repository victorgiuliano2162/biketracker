import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ImageLightboxComponent } from './image-lightbox.component';

describe('ImageLightboxComponent', () => {
  let component: ImageLightboxComponent;
  let fixture: ComponentFixture<ImageLightboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageLightboxComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') }
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { urls: [], index: 0 }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageLightboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
