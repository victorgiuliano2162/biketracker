import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { routeDetailResolver } from './route-detail.resolver';

describe('routeDetailResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => routeDetailResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
