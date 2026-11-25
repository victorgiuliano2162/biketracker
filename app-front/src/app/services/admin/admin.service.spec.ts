import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list users via GET /api/admin/users', () => {
    service.listUsers().subscribe((users) => {
      expect(users.length).toBe(1);
      expect(users[0].email).toBe('a@b.com');
    });

    const req = httpMock.expectOne('/api/admin/users');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: '1',
        name: 'User',
        email: 'a@b.com',
        age: 25,
        weight: 70,
        role: 'USER',
        active: true,
        createdAt: '2026-01-01',
      },
    ]);
  });

  it('should toggle user active status via PATCH /api/admin/users/:id/toggle-active', () => {
    service.toggleActive('u-1').subscribe((user) => {
      expect(user.active).toBeFalse();
    });

    const req = httpMock.expectOne('/api/admin/users/u-1/toggle-active');
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 'u-1', active: false });
  });

  it('should delete user via DELETE /api/admin/users/:id', () => {
    service.deleteUser('u-1').subscribe();

    const req = httpMock.expectOne('/api/admin/users/u-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
