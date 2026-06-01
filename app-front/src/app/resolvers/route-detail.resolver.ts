import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { RouteResponse } from '../models/route.model';
import { RouteService, TrackPoint } from '../services/route/route.service';
import { inject } from '@angular/core';
import { of } from 'rxjs/internal/observable/of';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { map } from 'rxjs/internal/operators/map';
import { catchError } from 'rxjs';


export interface RouteDetailData {
  route: RouteResponse;
  points: TrackPoint[];
}

export const routeDetailResolver: ResolveFn<RouteDetailData | null> = (
  route: ActivatedRouteSnapshot
) => {
  const routeService = inject(RouteService);
  const router = inject(Router);
 
  const id = route.paramMap.get('id');
  if (!id) {
    router.navigate(['/routes']);
    return of(null);
  }
 
  return forkJoin({
    route: routeService.getById(id),
    replay: routeService.getReplay(id),
  }).pipe(
    map(({ route, replay }) => ({
      route,
      points: replay.points,
    })),
    catchError(() => {
      router.navigate(['/routes']);
      return of(null);
    })
  );
};
