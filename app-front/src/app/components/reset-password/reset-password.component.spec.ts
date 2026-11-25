import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../services/auth/auth.service';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let tokenParam: string | null = 'valid-token-123';

  beforeEach(async () => {
    tokenParam = 'valid-token-123';
    authServiceSpy = jasmine.createSpyObj('AuthService', ['resetPassword']);

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => tokenParam,
              },
            },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should detect password mismatch', () => {
    component.form.patchValue({ newPassword: 'Password1', confirmPassword: 'Password2' });
    expect(component.form.hasError('mismatch')).toBeTrue();
  });

  it('should reset password and redirect to /login on success', fakeAsync(() => {
    authServiceSpy.resetPassword.and.returnValue(of(void 0));
    component.form.patchValue({ newPassword: 'NewPassword1', confirmPassword: 'NewPassword1' });

    component.onSubmit();
    expect(component.success).toBeTrue();

    tick(3000);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should map expired and used token error messages', () => {
    component.form.patchValue({ newPassword: 'NewPassword1', confirmPassword: 'NewPassword1' });

    authServiceSpy.resetPassword.and.returnValue(
      throwError(() => ({ error: { message: 'Token expirado' } })),
    );
    component.onSubmit();
    expect(component.errorMessage).toContain('expirou');

    authServiceSpy.resetPassword.and.returnValue(
      throwError(() => ({ error: { message: 'Token já utilizado' } })),
    );
    component.onSubmit();
    expect(component.errorMessage).toContain('já foi usado');
  });

  it('should show invalid link message when token is missing', () => {
    tokenParam = null;
    component.ngOnInit();
    expect(component.token).toBe('');
    expect(component.errorMessage).toContain('Link inválido');
  });
});
