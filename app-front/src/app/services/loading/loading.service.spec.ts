import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should stay loading while concurrent requests are active and hide after 500ms', fakeAsync(() => {
    expect(service.isLoading()).toBeFalse();

    service.show();
    service.show();
    expect(service.isLoading()).toBeTrue();

    service.hide();
    tick(600);
    expect(service.isLoading()).toBeTrue();

    service.hide();
    tick(400);
    expect(service.isLoading()).toBeTrue();

    tick(150);
    expect(service.isLoading()).toBeFalse();
  }));
});
