import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

export interface TrackPoint {
  latitude: number;
  longitude: number;
  altitudeInMeters: number;
  recordedAt: string; // ISO 8601
}

export interface CreateRouteRequest {
  distanceInKm: number;
  elevationInMeters: number;
  startTime: string;
  endTime: string;
  startCity: string;
  country: string;
  isPublic: boolean;
  trackPoints: TrackPoint[];
  name: string;
  routeDificulty: string;
}

export interface RouteResponse {
  id: string;
  name: string;
  distanceInKm: number;
  elevationInMeters: number;
  startTime: string;
  endTime: string;
  startCity: string;
  country: string;
  activityTimeInSeconds: number;
  isPublic: boolean;
  routeDificulty: string;
}

export interface RouteReplayResponse {
  routeId: string;
  points: TrackPoint[];
}

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private readonly base = '/api/routes';

  constructor(private http: HttpClient) {}

  listMine(
    page = 0,
    size = 10,
  ): Observable<{ content: RouteResponse[]; totalElements: number }> {
    return this.http.get<{ content: RouteResponse[]; totalElements: number }>(
      `${this.base}/my`,
      { params: { page, size } },
    );
  }

  save(request: CreateRouteRequest): Observable<RouteResponse> {
    return this.http.post<RouteResponse>(this.base, request);
  }

  getReplay(routeId: string): Observable<RouteReplayResponse> {
    return this.http.get<RouteReplayResponse>(
      `${this.base}/my/${routeId}/replay`,
    );
  }

  deleteRoute(routeId: string): Observable<any> {
    return this.http.delete(`${this.base}/del/${routeId}`);
  }

  findByRegion(
    minLon: number,
    minLat: number,
    maxLon: number,
    maxLat: number,
  ): Observable<RouteResponse[]> {
    return this.http.get<RouteResponse[]>(`${this.base}/my/search/region`, {
      params: { minLon, minLat, maxLon, maxLat },
    });
  }

  toggleVisibility(routeId: string): Observable<RouteResponse> {
    return this.http.patch<RouteResponse>(
      `${this.base}/${routeId}/visibility`,
      {},
    );
  }
}
