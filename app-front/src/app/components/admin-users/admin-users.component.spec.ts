import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { AdminService, AdminUserResponse } from '../../services/admin/admin.service';
import { AuthService } from '../../services/auth/auth.service';

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let fixture: ComponentFixture<AdminUsersComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUsers: AdminUserResponse[] = [
    {
      id: 'admin-1',
      name: 'Admin Master',
      email: 'admin@teste.com',
      age: 30,
      weight: 75,
      role: 'ADMIN',
      active: true,
      createdAt: '2026-01-01T10:00:00',
    },
    {
      id: 'user-2',
      name: 'Atleta João',
      email: 'joao@teste.com',
      age: 25,
      weight: 70,
      role: 'USER',
      active: true,
      createdAt: '2026-01-02T10:00:00',
    },
  ];

  beforeEach(async () => {
    adminServiceSpy = jasmine.createSpyObj('AdminService', [
      'listUsers',
      'toggleActive',
      'deleteUser',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);

    adminServiceSpy.listUsers.and.returnValue(of(mockUsers));
    authServiceSpy.getCurrentUserId.and.returnValue('admin-1');

    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load users', () => {
    expect(component).toBeTruthy();
    expect(component.loading).toBeFalse();
    expect(component.error).toBeFalse();
    expect(component.users.length).toBe(2);
    expect(component.currentUserId).toBe('admin-1');
  });

  it('should set error state when listUsers fails', () => {
    adminServiceSpy.listUsers.and.returnValue(throwError(() => new Error('500')));
    component.loadUsers();
    expect(component.error).toBeTrue();
    expect(component.loading).toBeFalse();
  });

  it('should toggle user active status', () => {
    const updated: AdminUserResponse = { ...mockUsers[1], active: false };
    adminServiceSpy.toggleActive.and.returnValue(of(updated));

    component.toggleActive(mockUsers[1]);

    expect(adminServiceSpy.toggleActive).toHaveBeenCalledWith('user-2');
    expect(component.users.find((u) => u.id === 'user-2')?.active).toBeFalse();
  });

  it('should delete user after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    adminServiceSpy.deleteUser.and.returnValue(of(void 0));

    component.deleteUser(mockUsers[1]);

    expect(adminServiceSpy.deleteUser).toHaveBeenCalledWith('user-2');
    expect(component.users.length).toBe(1);
  });

  it('should not delete user when confirmation is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteUser(mockUsers[1]);

    expect(adminServiceSpy.deleteUser).not.toHaveBeenCalled();
    expect(component.users.length).toBe(2);
  });
});
