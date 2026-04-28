import { TestBed } from '@angular/core/testing';

import { GpxParserService } from './gpx-parser.service';

describe('GpxParserService', () => {
  let service: GpxParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GpxParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
