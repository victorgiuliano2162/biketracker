import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { HomeDataService } from './home-data.service';

describe('HomeDataService', () => {
  let service: HomeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HomeDataService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(HomeDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
