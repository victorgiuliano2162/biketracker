import { TestBed } from '@angular/core/testing';

import { NsfwValidationService } from './nsfw-validation.service';

describe('NsfwValidationService', () => {
  let service: NsfwValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NsfwValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
