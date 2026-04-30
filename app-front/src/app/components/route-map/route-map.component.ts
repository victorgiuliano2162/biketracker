import {
  Component, Input, OnChanges, OnDestroy,
  AfterViewInit, ElementRef, ViewChild,
  Output, EventEmitter
} from '@angular/core';
import * as L from 'leaflet';
import { TrackPoint } from '../../services/route/route.service';

@Component({
  selector: 'app-route-map',
  standalone: true,
  template: `<div #mapContainer class="route-map"></div>`,
  styles: [`
    .route-map {
      width: 100%;
      height: 250px;
      border-radius: 8px;
      margin-top: 12px;
      z-index: 0;
    }
  `]
})
export class RouteMapComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() points: TrackPoint[] = [];
  @Input() color: string = '#185FA5';

  /** Índice do ponto sob o cursor no mapa → atualiza o gráfico */
  @Output() hoverIndex = new EventEmitter<number | null>();

  /** Recebe o índice do ponto em hover no gráfico → move o marker no mapa */
  @Input() set activeIndex(index: number | null) {
    this.updateCursorMarker(index);
  }

  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private map: L.Map | null = null;
  private polyline: L.Polyline | null = null;
  private cursorMarker: L.CircleMarker | null = null;
  private coords: [number, number][] = [];

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(): void {
    if (this.map) this.drawRoute();
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.remove(); this.map = null; }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.drawRoute();
  }

  private drawRoute(): void {
    if (!this.map || !this.points.length) return;
    if (this.polyline) this.map.removeLayer(this.polyline);

    this.coords = this.points.map(p => [p.latitude, p.longitude]);

    this.polyline = L.polyline(this.coords, {
      color: this.color,
      weight: 4,
      opacity: 0.85,
    }).addTo(this.map);

    // mapa → gráfico
    this.polyline.on('mousemove', (e: L.LeafletMouseEvent) => {
      const idx = this.closestIndex(e.latlng);
      this.hoverIndex.emit(idx);
      this.updateCursorMarker(idx);
    });

    this.polyline.on('mouseout', () => {
      this.hoverIndex.emit(null);
      this.removeCursorMarker();
    });

    this.map.fitBounds(this.polyline.getBounds(), { padding: [20, 20] });
  }

  private closestIndex(latlng: L.LatLng): number {
    let minDist = Infinity;
    let closest = 0;
    this.coords.forEach(([lat, lng], i) => {
      const d = latlng.distanceTo(L.latLng(lat, lng));
      if (d < minDist) { minDist = d; closest = i; }
    });
    return closest;
  }

  private updateCursorMarker(index: number | null): void {
    if (!this.map) return;
    if (index === null) { this.removeCursorMarker(); return; }

    const coord = this.coords[index];
    if (!coord) return;

    if (this.cursorMarker) {
      this.cursorMarker.setLatLng(coord);
    } else {
      this.cursorMarker = L.circleMarker(coord, {
        radius: 7,
        fillColor: this.color,
        fillOpacity: 1,
        color: '#fff',
        weight: 2,
      }).addTo(this.map);
    }
  }

  private removeCursorMarker(): void {
    if (this.cursorMarker && this.map) {
      this.map.removeLayer(this.cursorMarker);
      this.cursorMarker = null;
    }
  }
}