import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PhotoUploaderComponent } from './photo-uploader.component';
import { NsfwValidationService } from '../../../services/nsfw/nsfw-validation.service';
import { NotificationService } from '../../services/notification.service';

describe('PhotoUploaderComponent', () => {
  let component: PhotoUploaderComponent;
  let fixture: ComponentFixture<PhotoUploaderComponent>;
  let nsfwSpy: jasmine.SpyObj<NsfwValidationService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    nsfwSpy = jasmine.createSpyObj('NsfwValidationService', ['classify']);
    notificationSpy = jasmine.createSpyObj('NotificationService', ['info', 'error', 'success']);

    await TestBed.configureTestingModule({
      imports: [PhotoUploaderComponent],
      providers: [
        provideNoopAnimations(),
        { provide: NsfwValidationService, useValue: nsfwSpy },
        { provide: NotificationService, useValue: notificationSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should reject unsupported file types and allow valid images', () => {
    const txt = new File(['abc'], 'notes.txt', { type: 'text/plain' });
    const png = new File(['img'], 'photo.png', { type: 'image/png' });

    expect((component as any).validate(txt)).toBeFalse();
    expect((component as any).validate(png)).toBeTrue();
  });

  it('should notify and reject files larger than 10 MB', () => {
    const bigFile = new File([new Uint8Array(11 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    });

    expect((component as any).validate(bigFile)).toBeFalse();
    expect(notificationSpy.info).toHaveBeenCalled();
  });
});
