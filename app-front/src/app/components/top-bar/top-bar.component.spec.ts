import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { TopBarComponent } from './top-bar.component';
import { AuthService } from '../../services/auth/auth.service';

describe('TopBarComponent', () => {
  let component: TopBarComponent;
  let fixture: ComponentFixture<TopBarComponent>;
  let authServiceMock: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    isAdmin: jasmine.Spy;
    logout: jasmine.Spy;
  };
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      isAuthenticated: signal(true),
      isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false),
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [TopBarComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(TopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should navigate to /profile when clicking Perfil', () => {
    component.onPerfil();
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should call authService.logout on logout', () => {
    component.onLogout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should show Admin link only when user is admin', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Admin');

    authServiceMock.isAdmin.and.returnValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Admin');
  });
});
