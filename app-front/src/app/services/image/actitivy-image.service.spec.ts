import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ActivityImageService } from './actitivy-image.service';

describe('ActivityImageService', () => {
  let service: ActivityImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ActivityImageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(ActivityImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
