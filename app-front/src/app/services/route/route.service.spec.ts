import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { RouteService } from './route.service';

describe('RouteService', () => {
  let service: RouteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RouteService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RouteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update route metadata via PATCH /api/routes/:id', () => {
    const payload = { name: 'Novo Nome', difficulty: 'DIFICIL', description: 'Desc' };

    service.updateRoute('route-1', payload).subscribe((res) => {
      expect(res.name).toBe('Novo Nome');
    });

    const req = httpMock.expectOne('/api/routes/route-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'route-1', name: 'Novo Nome' });
  });

  it('should list user routes with page and size params', () => {
    service.listMine(1, 5).subscribe((page) => {
      expect(page.content.length).toBe(1);
    });

    const req = httpMock.expectOne('/api/routes/my?page=1&size=5');
    expect(req.request.method).toBe('GET');
    req.flush({ content: [{ id: 'r-1' }], page: { totalElements: 1, number: 1, size: 5, totalPages: 1 } });
  });

  it('should return null when checkPreview receives 204', () => {
    let result: string | null = 'initial';
    service.checkPreview('r-1').subscribe((res) => (result = res));

    const req = httpMock.expectOne('/api/routes/public/r-1/preview');
    req.flush('', { status: 204, statusText: 'No Content' });

    expect(result).toBeNull();
  });
});
