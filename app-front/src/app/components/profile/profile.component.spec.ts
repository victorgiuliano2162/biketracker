import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockUser = new User({
    id: 'user-1',
    name: 'Victor Ciclista',
    email: 'victor@teste.com',
    age: 26,
    weight: 74.5,
    bornAt: new Date('1998-03-19T00:00:00'),
    tipoSanguineo: 'O_POSITIVO',
  });

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getMe', 'updateMe']);
    userServiceSpy.getMe.and.returnValue(of(mockUser));
    userServiceSpy.updateMe.and.returnValue(of(mockUser));

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: UserService, useValue: userServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load profile data into form', () => {
    expect(component).toBeTruthy();
    expect(component.loading).toBeFalse();
    expect(component.profileForm.value.name).toBe('Victor Ciclista');
    expect(component.profileForm.value.tipoSanguineo).toBe('O_POSITIVO');
  });

  it('should submit updated profile payload', () => {
    component.profileForm.patchValue({ name: 'Victor Atualizado', weight: 72 });
    component.onSave();
    expect(userServiceSpy.updateMe).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'Victor Atualizado',
        weight: 72,
      }),
    );
  });

  it('should display error state when getMe fails', () => {
    userServiceSpy.getMe.and.returnValue(throwError(() => new Error('fail')));
    component.loadProfile();
    expect(component.loadError).toBeTrue();
    expect(component.loading).toBeFalse();
  });
});
