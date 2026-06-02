import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import {
  BoundingBox,
  PageResponse,
  RouteResponse,
} from '../../models/route.model';
import { catchError, map, of, shareReplay } from 'rxjs';

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

export interface RouteReplayResponse {
  routeId: string;
  points: TrackPoint[];
}

interface CacheEntry<T> {
  data$: Observable<T>;
  expiresAt: number;
}
 
const CACHE_TTL_MS = 2 * 60 * 1000; // 2min
@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private readonly base = '/api/routes';
  private cache = new Map<string, CacheEntry<any>>();

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

  getById(routeId: string): Observable<RouteResponse> {
    return this.http.get<RouteResponse>(`${this.base}/my/${routeId}`);
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

 
  // ── Listagem pública sem filtro geo ───────────────────────────────────────
 
  getPublicRoutes(page: number, size: number): Observable<PageResponse<RouteResponse>> {
    const key = `public:${page}:${size}`;
    return this.cached(key, () => {
      const params = new HttpParams()
        .set('page', page)
        .set('size', size)
        .set('sort', 'startTime,desc');
      return this.http.get<PageResponse<RouteResponse>>(`${this.base}/public`, { params });
    });
  }
 
  // ── Listagem pública com bounding box ────────────────────────────────────
 
  getPublicRoutesInRegion(
    bbox: BoundingBox,
    page: number,
    size: number
  ): Observable<PageResponse<RouteResponse>> {
    const bboxKey = [bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat]
      .map((n) => n.toFixed(4))
      .join(':');
    const key = `region:${bboxKey}:${page}:${size}`;
 
    return this.cached(key, () => {
      const params = new HttpParams()
        .set('minLon', bbox.minLon)
        .set('minLat', bbox.minLat)
        .set('maxLon', bbox.maxLon)
        .set('maxLat', bbox.maxLat)
        .set('page', page)
        .set('size', size)
        .set('sort', 'startTime,desc');
      return this.http.get<PageResponse<RouteResponse>>(
        `${this.base}/public/search/region`,
        { params }
      );
    });
  }
 
 
  // ── Replay (usado no detalhe — não cacheado, payload grande) ──────────────
 
  getRouteReplay(routeId: string): Observable<RouteReplayResponse> {
    return this.http.get<RouteReplayResponse>(`${this.base}/my/${routeId}/replay`);
  }
 
  // ── URL do preview SVG (resolvida no template, sem chamada HTTP extra) ─────
 
  getPreviewSvgUrl(routeId: string): string {
    return `${this.base}/public/${routeId}/preview.svg`;
  }

    // ── Preview MinIO ─────────────────────────────────────────────────────────
 
  /**
   * Verifica se já existe preview no MinIO.
   * Retorna a URL pública (string) se existir, ou null se ainda não foi gerado (204).
   */
  checkPreview(routeId: string): Observable<string | null> {
    return this.http
      .get(`${this.base}/public/${routeId}/preview`, { responseType: 'text' })
      .pipe(
        map((url) => url ?? null),
        catchError((err) => {
          // 204 No Content — ainda não foi gerado
          if (err.status === 204) return of(null);
          // Qualquer outro erro — trata como "não disponível"
          return of(null);
        })
      );
  }

  /**
   * Envia o PNG gerado pelo Leaflet para o backend salvar no MinIO.
   */
  uploadPreview(routeId: string, pngBuffer: ArrayBuffer): Observable<string> {
    return this.http.post(
      `${this.base}/public/${routeId}/preview`,
      pngBuffer,
      {
        headers: { 'Content-Type': 'application/octet-stream' },
        responseType: 'text',
      }
    );
  }
 
  // ── Invalidação de cache ──────────────────────────────────────────────────
 
  invalidatePublicCache(): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith('public:') || key.startsWith('region:')) {
        this.cache.delete(key);
      }
    }
  }
 
  // ── Helper com TTL ────────────────────────────────────────────────────────
 
  private cached<T>(key: string, factory: () => Observable<T>): Observable<T> {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.data$;
    }
    const data$ = factory().pipe(
      shareReplay({ bufferSize: 1, refCount: false })
    );
    this.cache.set(key, { data$, expiresAt: Date.now() + CACHE_TTL_MS });
    return data$;
  }
}

