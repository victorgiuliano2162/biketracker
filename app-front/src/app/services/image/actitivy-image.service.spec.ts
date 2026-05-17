import { TestBed } from '@angular/core/testing';

import { ActitivyImageService } from './actitivy-image.service';

describe('ActitivyImageService', () => {
  let service: ActitivyImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActitivyImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
