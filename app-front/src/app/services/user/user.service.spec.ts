import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch authenticated user via GET /api/user/me', () => {
    service.getMe().subscribe((user) => {
      expect(user.email).toBe('victor@teste.com');
    });

    const req = httpMock.expectOne('/api/user/me');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'u-1', name: 'Victor', email: 'victor@teste.com' });
  });

  it('should update authenticated user via PUT /api/user/me', () => {
    const payload = {
      name: 'Victor Novo',
      email: 'victor@teste.com',
      age: 27,
      weight: 73,
      bornAt: '1998-03-19T00:00:00',
      tipoSanguineo: 'O_POSITIVO' as const,
    };

    service.updateMe(payload).subscribe((user) => {
      expect(user.name).toBe('Victor Novo');
    });

    const req = httpMock.expectOne('/api/user/me');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'u-1', ...payload });
  });
});
