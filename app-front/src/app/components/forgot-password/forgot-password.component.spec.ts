import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../services/auth/auth.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['forgotPassword']);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not submit when email is invalid', () => {
    component.form.patchValue({ email: 'email-invalido' });
    component.onSubmit();
    expect(authServiceSpy.forgotPassword).not.toHaveBeenCalled();
  });

  it('should mark submitted on success', () => {
    authServiceSpy.forgotPassword.and.returnValue(of(void 0));
    component.form.patchValue({ email: 'atleta@teste.com' });

    component.onSubmit();

    expect(authServiceSpy.forgotPassword).toHaveBeenCalledWith('atleta@teste.com');
    expect(component.submitted).toBeTrue();
    expect(component.loading).toBeFalse();
  });

  it('should also mark submitted on error to avoid user enumeration', () => {
    authServiceSpy.forgotPassword.and.returnValue(throwError(() => new Error('500')));
    component.form.patchValue({ email: 'desconhecido@teste.com' });

    component.onSubmit();

    expect(component.submitted).toBeTrue();
    expect(component.loading).toBeFalse();
  });
});
