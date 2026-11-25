import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommentService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list comments for a route', () => {
    service.list('route-1').subscribe((comments) => {
      expect(comments.length).toBe(1);
      expect(comments[0].content).toBe('Ótima rota');
    });

    const req = httpMock.expectOne('/api/routes/route-1/comments');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, content: 'Ótima rota' }]);
  });

  it('should create a comment on a route', () => {
    service.create('route-1', 'Muito bom!').subscribe((c) => {
      expect(c.id).toBe(10);
    });

    const req = httpMock.expectOne('/api/routes/route-1/comments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: 'Muito bom!' });
    req.flush({ id: 10, content: 'Muito bom!' });
  });

  it('should delete a comment from a route', () => {
    service.delete('route-1', 10).subscribe();

    const req = httpMock.expectOne('/api/routes/route-1/comments/10');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
