import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'getAccessToken']);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should validate non-empty email and password', () => {
    expect(component.isValid()).toBeFalse();
    component.email = 'atleta@teste.com';
    component.password = 'Senha123';
    expect(component.isValid()).toBeTrue();
  });

  it('should login and navigate to /home on success', fakeAsync(() => {
    authServiceSpy.login.and.returnValue(of({ accessToken: 'a', refreshToken: 'r' }));
    component.email = 'atleta@teste.com';
    component.password = 'Senha123';

    component.onLogin();
    tick(150);

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'atleta@teste.com',
      password: 'Senha123',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('should show 401 message and clear password on invalid credentials', () => {
    const notification = TestBed.inject(NotificationService);
    const errorSpy = spyOn(notification, 'error');
    authServiceSpy.login.and.returnValue(throwError(() => ({ status: 401 })));
    component.email = 'atleta@teste.com';
    component.password = 'errada';

    component.onLogin();

    expect(component.errorMessage).toBe('E-mail ou senha incorretos.');
    expect(component.password).toBe('');
    expect(errorSpy).toHaveBeenCalledWith('E-mail ou senha incorretos.');
  });

  it('should navigate to /subscribe on onRegister', () => {
    component.onRegister();
    expect(router.navigate).toHaveBeenCalledWith(['/subscribe']);
  });
});
