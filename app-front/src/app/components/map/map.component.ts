import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import * as L from 'leaflet';
import { LocationService } from '../../services/location/location.service';

interface RouteNode {
  name: string;
  id?: number;
  coordinates?: [number, number][];
  color?: string;
  children?: RouteNode[];
}

interface FlatRouteNode {
  expandable: boolean;
  name: string;
  level: number;
  id?: number;
  coordinates?: [number, number][];
  color?: string;
}

interface GpxStats {
  name: string;
  points: number;
  distanceKm: number;
  elevationGainM: number | null;
  loadingElevation: boolean;
  elevationProfile: { distances: number[], elevations: number[] } | null;
}

@Component({
  selector: 'app-map',
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('gpxInput') gpxInput!: ElementRef<HTMLInputElement>;

  private map!: L.Map;
  private layers: Map<number, L.Polyline> = new Map();
  private gpxLayer: L.Polyline | null = null;
  private userMarker: L.CircleMarker | null = null;
  private chartInstance: any = null;

  selectedRouteIds = new Set<number>();
  sidebarOpen = false;
  locating = false;
  gpxStats: GpxStats | null = null;
  gpxExpanded = false;

  constructor(
    private locationService: LocationService,
    private snackBar: MatSnackBar
  ) {}

  // --- Dados mock ---
  private treeData: RouteNode[] = [
    {
      name: 'Minhas Rotas',
      children: [
        { name: 'Trilha da Manhã',  id: 1, color: '#1976d2', coordinates: [[-3.71, -38.54], [-3.72, -38.53], [-3.73, -38.52]] },
        { name: 'Volta no Parque',  id: 2, color: '#388e3c', coordinates: [[-3.74, -38.55], [-3.75, -38.54], [-3.76, -38.53]] },
        { name: 'Rota do Trabalho', id: 3, color: '#f57c00', coordinates: [[-3.72, -38.50], [-3.73, -38.51], [-3.74, -38.52]] },
      ]
    },
    {
      name: 'Rotas Públicas',
      children: [
        { name: 'Ciclovia Beira-Mar', id: 4, color: '#7b1fa2', coordinates: [[-3.70, -38.52], [-3.71, -38.51], [-3.72, -38.50]] },
        { name: 'Parque do Cocó',     id: 5, color: '#c62828', coordinates: [[-3.75, -38.50], [-3.76, -38.49], [-3.77, -38.48]] },
      ]
    }
  ];

  // --- Tree ---
  private transformer = (node: RouteNode, level: number): FlatRouteNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level,
    id: node.id,
    coordinates: node.coordinates,
    color: node.color,
  });

  treeControl = new FlatTreeControl<FlatRouteNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: FlatRouteNode) => node.expandable;
  isLeaf  = (_: number, node: FlatRouteNode) => !node.expandable;

  // ── Lifecycle ────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.dataSource.data = this.treeData;
    this.treeControl.expandAll();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadChartJs();
  }

  ngOnDestroy(): void {
    if (this.chartInstance) this.chartInstance.destroy();
    if (this.map) this.map.remove();
  }

  // ── Mapa ─────────────────────────────────────────────────────────────

  private initMap(): void {
    const defaultCoords: L.LatLngExpression = [-15.7797, -47.9297];

    this.map = L.map('leaflet-map', {
      center: defaultCoords,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.locationService.getUserLocation()
      .then(coords => {
        this.map.flyTo([coords.lat, coords.lng], 15, { animate: true, duration: 1.5 });
      })
      .catch(() => {});
  }

  // ── Localização do usuário ───────────────────────────────────────────

  centerOnUser(): void {
    this.locating = true;

    this.locationService.getUserLocation()
      .then(coords => {
        this.map.flyTo([coords.lat, coords.lng], 16, { animate: true, duration: 1.2 });

        if (this.userMarker) this.map.removeLayer(this.userMarker);

        this.userMarker = L.circleMarker([coords.lat, coords.lng], {
          radius: 8,
          fillColor: '#1976d2',
          fillOpacity: 1,
          color: '#ffffff',
          weight: 2,
        }).addTo(this.map).bindPopup('Você está aqui');
      })
      .catch(() => {
        this.snackBar.open('Não foi possível obter sua localização.', 'OK', { duration: 3000 });
      })
      .finally(() => {
        this.locating = false;
      });
  }

  // ── GPX ──────────────────────────────────────────────────────────────

  openGpxPicker(): void {
    this.gpxInput.nativeElement.click();
  }

  onGpxFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      const { coords, elevations } = this.parseGpx(content);

      if (coords.length < 2) {
        this.snackBar.open('Arquivo GPX inválido ou sem pontos de rota.', 'OK', { duration: 3000 });
        return;
      }

      if (this.gpxLayer) this.map.removeLayer(this.gpxLayer);

      this.gpxLayer = L.polyline(coords, {
        color: '#e53935',
        weight: 4,
        opacity: 0.9,
        dashArray: '6, 4',
      }).addTo(this.map);

      this.map.fitBounds(this.gpxLayer.getBounds(), { padding: [40, 40] });

      const distanceKm = this.calculateDistance(coords);

      if (elevations.length === coords.length) {
        const gain = this.calculateElevationGain(elevations);
        const profile = this.buildElevationProfile(coords, elevations);
        this.gpxStats = {
          name: file.name.replace('.gpx', ''),
          points: coords.length,
          distanceKm,
          elevationGainM: gain,
          loadingElevation: false,
          elevationProfile: profile,
        };
      } else {
        this.gpxStats = {
          name: file.name.replace('.gpx', ''),
          points: coords.length,
          distanceKm,
          elevationGainM: null,
          loadingElevation: true,
          elevationProfile: null,
        };
        this.fetchElevation(coords);
      }
    };

    reader.readAsText(file);
    input.value = '';
  }

  private parseGpx(content: string): { coords: [number, number][], elevations: number[] } {
    const parser = new DOMParser();
    const xml = parser.parseFromString(content, 'application/xml');
    const trkpts = xml.querySelectorAll('trkpt, rtept');

    const coords: [number, number][] = [];
    const elevations: number[] = [];

    Array.from(trkpts).forEach(pt => {
      const lat = parseFloat(pt.getAttribute('lat') ?? '');
      const lon = parseFloat(pt.getAttribute('lon') ?? '');
      if (isNaN(lat) || isNaN(lon)) return;

      coords.push([lat, lon]);

      const eleEl = pt.querySelector('ele');
      if (eleEl?.textContent) {
        const ele = parseFloat(eleEl.textContent);
        if (!isNaN(ele)) elevations.push(ele);
      }
    });

    return { coords, elevations };
  }

  private calculateDistance(coords: [number, number][]): number {
    let totalMeters = 0;
    for (let i = 1; i < coords.length; i++) {
      totalMeters += this.map.distance(coords[i - 1], coords[i]);
    }
    return Math.round(totalMeters / 10) / 100;
  }

  private calculateElevationGain(elevations: number[]): number {
    let gain = 0;
    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0) gain += diff;
    }
    return Math.round(gain);
  }

  private buildElevationProfile(
    coords: [number, number][],
    elevations: number[]
  ): { distances: number[], elevations: number[] } {
    const distances: number[] = [0];
    let accumulated = 0;

    for (let i = 1; i < coords.length; i++) {
      accumulated += this.map.distance(coords[i - 1], coords[i]) / 1000;
      distances.push(Math.round(accumulated * 100) / 100);
    }

    return { distances, elevations };
  }

  private sampleCoords(coords: [number, number][], max: number): [number, number][] {
    if (coords.length <= max) return coords;
    const step = Math.ceil(coords.length / max);
    return coords.filter((_, i) => i % step === 0);
  }

  private fetchElevation(coords: [number, number][]): void {
    const sample = this.sampleCoords(coords, 100);
    const lats = sample.map(c => c[0]).join(',');
    const lons = sample.map(c => c[1]).join(',');

    fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lons}`)
      .then(r => r.json())
      .then(data => {
        if (!data.elevation || !this.gpxStats) return;
        const gain = this.calculateElevationGain(data.elevation);
        const profile = this.buildElevationProfile(sample, data.elevation);
        this.gpxStats = { ...this.gpxStats, elevationGainM: gain, loadingElevation: false, elevationProfile: profile };
      })
      .catch(() => {
        if (this.gpxStats) {
          this.gpxStats = { ...this.gpxStats, loadingElevation: false };
        }
        this.snackBar.open('Não foi possível obter dados de elevação.', 'OK', { duration: 3000 });
      });
  }

  clearGpx(): void {
    if (this.gpxLayer) {
      this.map.removeLayer(this.gpxLayer);
      this.gpxLayer = null;
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
    this.gpxStats = null;
    this.gpxExpanded = false;
  }

  // ── Gráfico de elevação ──────────────────────────────────────────────

  private loadChartJs(): void {
    if ((window as any).Chart) return;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    document.head.appendChild(script);
  }

  toggleGpxExpand(): void {
    this.gpxExpanded = !this.gpxExpanded;
    if (this.gpxExpanded) {
      setTimeout(() => this.renderElevationChart(), 50);
    } else {
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    }
  }

  private renderElevationChart(): void {
    const canvas = document.getElementById('elevation-chart') as HTMLCanvasElement;
    if (!canvas || !this.gpxStats?.elevationProfile) return;

    if (this.chartInstance) this.chartInstance.destroy();

    const ctx = canvas.getContext('2d')!;
    const { distances, elevations } = this.gpxStats.elevationProfile;

    this.chartInstance = new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels: distances.map(d => `${d.toFixed(1)} km`),
        datasets: [{
          label: 'Elevação (m)',
          data: elevations,
          borderColor: '#e53935',
          backgroundColor: 'rgba(229, 57, 53, 0.12)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (items: any[]) => `Dist: ${items[0].label}`,
              label: (item: any) => `Elevação: ${item.raw.toFixed(0)} m`,
            }
          }
        },
        scales: {
          x: {
            ticks: { maxTicksLimit: 8, font: { size: 11 } },
            grid: { display: false }
          },
          y: {
            ticks: { font: { size: 11 } },
            title: { display: true, text: 'Elevação (m)', font: { size: 11 } }
          }
        }
      }
    });
  }

  // ── Rotas da árvore ──────────────────────────────────────────────────

  toggleRoute(node: FlatRouteNode): void {
    if (!node.id || !node.coordinates) return;

    if (this.selectedRouteIds.has(node.id)) {
      this.selectedRouteIds.delete(node.id);
      const layer = this.layers.get(node.id);
      if (layer) {
        this.map.removeLayer(layer);
        this.layers.delete(node.id);
      }
    } else {
      this.selectedRouteIds.add(node.id);
      const polyline = L.polyline(node.coordinates, {
        color: node.color ?? '#1976d2',
        weight: 4,
        opacity: 0.85,
      }).addTo(this.map);

      polyline.bindPopup(`<b>${node.name}</b>`);
      this.layers.set(node.id, polyline);
      this.map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }

  isSelected(node: FlatRouteNode): boolean {
    return !!node.id && this.selectedRouteIds.has(node.id);
  }

  clearAll(): void {
    this.layers.forEach(layer => this.map.removeLayer(layer));
    this.layers.clear();
    this.selectedRouteIds.clear();
  }

  get hasGpx(): boolean {
    return this.gpxLayer !== null;
  }
}