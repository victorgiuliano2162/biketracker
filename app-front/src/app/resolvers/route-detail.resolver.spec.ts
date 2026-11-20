import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { routeDetailResolver, RouteDetailData } from './route-detail.resolver';

describe('routeDetailResolver', () => {
  const executeResolver: ResolveFn<RouteDetailData | null> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => routeDetailResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
