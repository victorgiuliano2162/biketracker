// src/app/models/route.model.ts

export type RouteDifficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';

export interface RouteResponse {
  id: string;
  name: string;
  distanceInKm: number;
  elevationInMeters: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  startCity: string;
  country: string;
  isPublic: boolean;
  routeDifficulty: RouteDifficulty;
  userName: string;
  description?: string;
  ownerId?: string;
}

export interface TrackPoint {
  longitude: number;
  latitude: number;
  altitudeInMeters: number;
  recordedAt: string;
}

export interface RouteReplayResponse {
  routeId: string;
  points: TrackPoint[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface BoundingBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}