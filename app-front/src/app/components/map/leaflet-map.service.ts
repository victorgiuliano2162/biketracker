import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable()
export class LeafletMapService {
  private map: L.Map | null = null;
  private readonly layers = new Map<string, L.Polyline>();
  private userMarker: L.CircleMarker | null = null;
  private cursorMarker: L.CircleMarker | null = null;

  init(elementId: string, center: [number, number] = [-15.7797, -47.9297], zoom = 13): void {
    this.map = L.map(elementId, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);
  }

  destroy(): void {
    this.map?.remove();
    this.map = null;
    this.layers.clear();
    this.userMarker = null;
    this.cursorMarker = null;
  }

  flyTo(lat: number, lng: number, zoom = 15, duration = 1.5): void {
    this.map?.flyTo([lat, lng], zoom, { animate: true, duration });
  }

  setUserMarker(lat: number, lng: number): void {
    if (!this.map) return;
    if (this.userMarker) this.map.removeLayer(this.userMarker);
    this.userMarker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: '#1976d2',
      fillOpacity: 1,
      color: '#fff',
      weight: 2,
    })
      .addTo(this.map)
      .bindPopup('Você está aqui');
  }

  addRouteLayer(
    id: string,
    coords: [number, number][],
    options: { color: string; popupHtml: string; dashed?: boolean },
  ): void {
    if (!this.map) return;
    const polyline = L.polyline(coords, {
      color: options.color,
      weight: 4,
      opacity: options.dashed ? 0.9 : 0.85,
      ...(options.dashed ? { dashArray: '6, 4' } : {}),
    }).addTo(this.map);
    polyline.bindPopup(options.popupHtml);
    this.layers.set(id, polyline);
    this.map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  }

  renameLayer(oldId: string, newId: string, popupHtml: string): void {
    const layer = this.layers.get(oldId);
    if (!layer) return;
    this.layers.delete(oldId);
    this.layers.set(newId, layer);
    layer.bindPopup(popupHtml);
  }

  removeRouteLayer(id: string): void {
    const layer = this.layers.get(id);
    if (layer && this.map) {
      this.map.removeLayer(layer);
    }
    this.layers.delete(id);
  }

  clearAllLayers(): void {
    if (this.map) {
      this.layers.forEach((layer) => this.map!.removeLayer(layer));
    }
    this.layers.clear();
    this.clearCursorMarker();
  }

  setCursorMarker(coord: [number, number] | null, color: string): void {
    if (!coord || !this.map) {
      this.clearCursorMarker();
      return;
    }

    if (this.cursorMarker) {
      this.cursorMarker.setLatLng(coord);
    } else {
      this.cursorMarker = L.circleMarker(coord, {
        radius: 7,
        fillColor: color,
        fillOpacity: 1,
        color: '#fff',
        weight: 2,
      }).addTo(this.map);
    }
  }

  clearCursorMarker(): void {
    if (this.cursorMarker && this.map) {
      this.map.removeLayer(this.cursorMarker);
    }
    this.cursorMarker = null;
  }
}
