// src/app/utils/geo.utils.ts

import { BoundingBox } from '../models/route.model';

/**
 * Calcula um bounding box aproximado a partir de um ponto central e um raio em km.
 * Usa a fórmula de deslocamento equiretangular — precisão suficiente para buscas geo.
 */
export function computeBoundingBox(lat: number, lng: number, radiusKm: number): BoundingBox {
  const EARTH_RADIUS_KM = 6371;

  const deltaLat = (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI);
  const deltaLon = (radiusKm / (EARTH_RADIUS_KM * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);

  return {
    minLat: lat - deltaLat,
    maxLat: lat + deltaLat,
    minLon: lng - deltaLon,
    maxLon: lng + deltaLon,
  };
}

/**
 * Formata segundos para string legível: "1h 23min" ou "45min"
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}