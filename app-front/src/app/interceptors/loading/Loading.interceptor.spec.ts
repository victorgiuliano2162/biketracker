import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { loadingInterceptor } from './Loading.interceptor';
import { LoadingService } from '../../services/loading/loading.service';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        { provide: LoadingService, useValue: loadingServiceSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call show before request and hide on completion', () => {
    http.get('/api/test').subscribe();
    expect(loadingServiceSpy.show).toHaveBeenCalledTimes(1);
    expect(loadingServiceSpy.hide).not.toHaveBeenCalled();

    const req = httpMock.expectOne('/api/test');
    req.flush({ ok: true });

    expect(loadingServiceSpy.hide).toHaveBeenCalledTimes(1);
  });

  it('should call hide even when request fails', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/api/test');
    req.flush('err', { status: 500, statusText: 'Server Error' });

    expect(loadingServiceSpy.show).toHaveBeenCalledTimes(1);
    expect(loadingServiceSpy.hide).toHaveBeenCalledTimes(1);
  });
});
