import { TestBed } from '@angular/core/testing';

import { ElevationService } from './elevation.service';

describe('ElevationService', () => {
  let service: ElevationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElevationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
