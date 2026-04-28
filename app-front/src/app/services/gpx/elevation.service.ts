import { Injectable } from '@angular/core';

export interface ElevationProfile {
  distances: number[];
  elevations: number[];
  coords: [number, number][];
}

@Injectable({ providedIn: 'root' })
export class ElevationService {

  /**
   * Distância total em km usando a fórmula de Haversine.
   * Não depende da instância do mapa (sem L.map.distance).
   */
  calculateDistanceKm(coords: [number, number][]): number {
    let totalMeters = 0;
    for (let i = 1; i < coords.length; i++) {
      totalMeters += this.haversineMeters(coords[i - 1], coords[i]);
    }
    return Math.round(totalMeters / 10) / 100;
  }

  calculateElevationGain(elevations: number[]): number {
    let gain = 0;
    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0) gain += diff;
    }
    return Math.round(gain);
  }

  buildProfile(coords: [number, number][], elevations: number[]): ElevationProfile {
    const distances: number[] = [0];
    let accumulated = 0;
    for (let i = 1; i < coords.length; i++) {
      accumulated += this.haversineMeters(coords[i - 1], coords[i]) / 1000;
      distances.push(Math.round(accumulated * 100) / 100);
    }
    return { distances, elevations, coords };
  }

  /**
   * Busca elevações na API open-meteo para coords amostradas.
   * Retorna null se a resposta for inválida.
   */
  async fetchElevations(coords: [number, number][], maxSamples = 100): Promise<number[] | null> {
    const sample = this.sample(coords, maxSamples);
    const lats = sample.map(c => c[0]).join(',');
    const lons = sample.map(c => c[1]).join(',');

    const res = await fetch(
      `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lons}`
    );
    const data = await res.json();
    return Array.isArray(data.elevation) ? data.elevation as number[] : null;
  }

  sample(coords: [number, number][], max: number): [number, number][] {
    if (coords.length <= max) return coords;
    const step = Math.ceil(coords.length / max);
    return coords.filter((_, i) => i % step === 0);
  }

  private haversineMeters(a: [number, number], b: [number, number]): number {
    const R = 6_371_000;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLon = (b[1] - a[1]) * Math.PI / 180;
    const sin2 =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(a[0] * Math.PI / 180) *
      Math.cos(b[0] * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
  }
}
