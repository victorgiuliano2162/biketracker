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
import { RouteService, CreateRouteRequest, RouteResponse } from '../../services/route/route.service';

// ── Paleta de cores para rotas GPX ───────────────────────────────────
const GPX_COLORS = [
  '#e53935', '#8e24aa', '#1e88e5', '#00897b',
  '#f4511e', '#6d4c41', '#00acc1', '#43a047',
];

interface RouteNode {
  name: string;
  id?: string;
  coordinates?: [number, number][];
  elevations?: number[];
  color?: string;
  isSaved?: boolean;
  savedId?: string;
  children?: RouteNode[];
}

interface FlatRouteNode {
  expandable: boolean;
  name: string;
  level: number;
  id?: string;
  coordinates?: [number, number][];
  elevations?: number[];
  color?: string;
  isSaved?: boolean;
  savedId?: string;
}

interface GpxStats {
  activeId: string; // id da rota cujo perfil está ativo
  name: string;
  points: number;
  distanceKm: number;
  elevationGainM: number | null;
  loadingElevation: boolean;
  elevationProfile: { distances: number[], elevations: number[], coords: [number, number][] } | null;
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
  private layers = new Map<string, L.Polyline>();
  private userMarker: L.CircleMarker | null = null;
  private cursorMarker: L.CircleMarker | null = null;
  private chartInstance: any = null;

  // Rotas carregadas localmente (não salvas)
  localRoutes: RouteNode[] = [];
  // Rotas salvas no backend
  savedRoutes: RouteNode[] = [];
  fileName: string = '';
  selectedRouteIds = new Set<string>();
  sidebarOpen = false;
  locating = false;
  gpxStats: GpxStats | null = null;
  gpxExpanded = false;
  savingRouteId: string | null = null;

  constructor(
    private locationService: LocationService,
    private routeService: RouteService,
    private snackBar: MatSnackBar
  ) {}

  // ── Tree ─────────────────────────────────────────────────────────────

  private get treeData(): RouteNode[] {
    return [
      { name: 'Carregadas',   children: this.localRoutes },
    ];
  }

  getActiveColor(): string {
  return this.localRoutes.find(r => r.id === this.gpxStats?.activeId)?.color
    ?? this.savedRoutes.find(r => r.id === this.gpxStats?.activeId)?.color
    ?? '#e53935';
  }

  private transformer = (node: RouteNode, level: number): FlatRouteNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level,
    id: node.id,
    coordinates: node.coordinates,
    elevations: node.elevations,
    color: node.color,
    isSaved: node.isSaved,
    savedId: node.savedId?.toString(),
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
  isLeaf   = (_: number, node: FlatRouteNode) => !node.expandable;

  private refreshTree(): void {
    this.dataSource.data = this.treeData;
    this.treeControl.expandAll();
  }

  // ── Lifecycle ────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.refreshTree();
    this.loadSavedRoutes();
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
    this.map = L.map('leaflet-map', {
      center: [-15.7797, -47.9297],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.locationService.getUserLocation()
      .then(coords => this.map.flyTo([coords.lat, coords.lng], 15, { animate: true, duration: 1.5 }))
      .catch(() => {});
  }

  // ── Localização ──────────────────────────────────────────────────────

  centerOnUser(): void {
    this.locating = true;
    this.locationService.getUserLocation()
      .then(coords => {
        this.map.flyTo([coords.lat, coords.lng], 16, { animate: true, duration: 1.2 });
        if (this.userMarker) this.map.removeLayer(this.userMarker);
        this.userMarker = L.circleMarker([coords.lat, coords.lng], {
          radius: 8, fillColor: '#1976d2', fillOpacity: 1, color: '#fff', weight: 2,
        }).addTo(this.map).bindPopup('Você está aqui');
      })
      .catch(() => this.snackBar.open('Não foi possível obter sua localização.', 'OK', { duration: 3000 }))
      .finally(() => this.locating = false);
  }

  // ── Toggle de rota no mapa ───────────────────────────────────────────

  toggleRoute(node: FlatRouteNode): void {
    if (!node.id || !node.coordinates) return;

    if (this.selectedRouteIds.has(node.id)) {
      this.selectedRouteIds.delete(node.id);
      const layer = this.layers.get(node.id);
      if (layer) { this.map.removeLayer(layer); this.layers.delete(node.id); }
      if (this.gpxStats?.activeId === node.id) {
        this.gpxStats = null;
        this.gpxExpanded = false;
        if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
        if (this.cursorMarker) { this.map.removeLayer(this.cursorMarker); this.cursorMarker = null; }
      }
    } else {
      this.selectedRouteIds.add(node.id);
      const polyline = L.polyline(node.coordinates, {
        color: node.color ?? '#1976d2', weight: 4, opacity: 0.85,
      }).addTo(this.map);
      polyline.bindPopup(`<b>${node.name}</b>`);
      this.layers.set(node.id, polyline);
      this.map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

      // Abre o painel de stats para a rota clicada
      this.openStatsForNode(node);
    }
  }

  private openStatsForNode(node: FlatRouteNode): void {
    if (!node.coordinates) return;
    const distanceKm = this.calculateDistance(node.coordinates);
    const elevations = node.elevations ?? [];

    if (elevations.length === node.coordinates.length && elevations.length > 0) {
      const gain = this.calculateElevationGain(elevations);
      const profile = this.buildElevationProfile(node.coordinates, elevations);
      this.gpxStats = {
        activeId: node.id!,
        name: node.name,
        points: node.coordinates.length,
        distanceKm,
        elevationGainM: gain,
        loadingElevation: false,
        elevationProfile: profile,
      };
    } else {
      this.gpxStats = {
        activeId: node.id!,
        name: node.name,
        points: node.coordinates.length,
        distanceKm,
        elevationGainM: null,
        loadingElevation: true,
        elevationProfile: null,
      };
      this.fetchElevation(node.coordinates);
    }

    // Re-renderiza gráfico se estava expandido
    if (this.gpxExpanded) {
      setTimeout(() => this.renderElevationChart(), 50);
    }
  }

  isSelected(node: FlatRouteNode): boolean {
    return !!node.id && this.selectedRouteIds.has(node.id);
  }

  clearAll(): void {
    this.layers.forEach(layer => this.map.removeLayer(layer));
    this.layers.clear();
    this.selectedRouteIds.clear();
    this.gpxStats = null;
    this.gpxExpanded = false;
    if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
    if (this.cursorMarker) { this.map.removeLayer(this.cursorMarker); this.cursorMarker = null; }
  }

  // ── GPX — carregar arquivo ───────────────────────────────────────────

  openGpxPicker(): void {
    this.gpxInput.nativeElement.click();
  }

  onGpxFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    Array.from(input.files).forEach(file => this.processGpxFile(file));
    input.value = '';
  }

  private processGpxFile(file: File): void {
    const reader = new FileReader();
    this.fileName = file.name;
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const { coords, elevations } = this.parseGpx(content);

      if (coords.length < 2) {
        this.snackBar.open(`"${file.name}": GPX inválido ou sem pontos.`, 'OK', { duration: 3000 });
        return;
      }

      const id = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const color = GPX_COLORS[this.localRoutes.length % GPX_COLORS.length];

      const node: RouteNode = {
        id,
        name: file.name.replace('.gpx', ''),
        coordinates: coords,
        elevations,
        color,
        isSaved: false,
      };

      this.localRoutes.push(node);
      this.refreshTree();

      // Adiciona automaticamente no mapa
      this.selectedRouteIds.add(id);
      const polyline = L.polyline(coords, { color, weight: 4, opacity: 0.9, dashArray: '6, 4' }).addTo(this.map);
      polyline.bindPopup(`<b>📁 ${node.name}</b>`);
      this.layers.set(id, polyline);
      this.map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

      this.openStatsForNode({ ...node, expandable: false, level: 1 } as FlatRouteNode);
    };
    reader.readAsText(file);
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

  // ── GPX — persistir no backend ───────────────────────────────────────

  saveRoute(node: FlatRouteNode, event: MouseEvent): void {
    event.stopPropagation();
    if (!node.id || !node.coordinates || node.isSaved) return;

    this.savingRouteId = node.id;
    const coords = node.coordinates;
    const now = new Date().toISOString();

    const trackPoints = coords.map((c, i) => ({
      latitude: c[0],
      longitude: c[1],
      altitudeInMeters: node.elevations?.[i] ?? 0,
      recordedAt: now,
    }));

    const request: CreateRouteRequest = {
      distanceInKm: this.calculateDistance(coords),
      elevationInMeters: node.elevations ? this.calculateElevationGain(node.elevations) : 0,
      startTime: now,
      endTime: now,
      startCity: '',
      country: '',
      isPublic: false,
      trackPoints,
      name: this.fileName
    };

    this.routeService.save(request).subscribe({
      next: (saved) => {
        // Remove da lista local e adiciona nas salvas
        this.localRoutes = this.localRoutes.filter(r => r.id !== node.id);
        this.savedRoutes.push({
          id: `saved-${saved.id}`,
          name: node.name,
          coordinates: node.coordinates,
          elevations: node.elevations,
          color: node.color,
          isSaved: true,
          savedId: saved.id,
        });

        // Atualiza a layer para o novo id
        const layer = this.layers.get(node.id!);
        if (layer) {
          this.layers.delete(node.id!);
          this.layers.set(`saved-${saved.id}`, layer);
        }
        this.selectedRouteIds.delete(node.id!);
        this.selectedRouteIds.add(`saved-${saved.id}`);

        this.refreshTree();
        this.savingRouteId = null;
        this.snackBar.open(`"${node.name}" salva com sucesso!`, '✓', { duration: 3000 });
      },
      error: () => {
        this.savingRouteId = null;
        this.snackBar.open('Erro ao salvar rota. Tente novamente.', 'OK', { duration: 3000 });
      }
    });
  }

  // ── Carregar rotas salvas do backend ─────────────────────────────────

  private loadSavedRoutes(): void {
    this.routeService.listMine().subscribe({
      next: (page) => {
        this.savedRoutes = page.content.map((r, i) => ({
          id: `saved-${r.id}`,
          name: r.startCity || `Rota ${r.id}`,
          color: GPX_COLORS[i % GPX_COLORS.length],
          isSaved: true,
          savedId: r.id,
          // Coordenadas virão via replay endpoint — por ora só listamos
          coordinates: undefined,
        }));
        this.refreshTree();
      },
      error: () => {} // silencioso — usuário pode não ter rotas ainda
    });
  }

  // ── Cálculos ─────────────────────────────────────────────────────────

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
  ): { distances: number[], elevations: number[], coords: [number, number][] } {
    const distances: number[] = [0];
    let accumulated = 0;
    for (let i = 1; i < coords.length; i++) {
      accumulated += this.map.distance(coords[i - 1], coords[i]) / 1000;
      distances.push(Math.round(accumulated * 100) / 100);
    }
    return { distances, elevations, coords };
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
        if (this.gpxExpanded) setTimeout(() => this.renderElevationChart(), 50);
      })
      .catch(() => {
        if (this.gpxStats) this.gpxStats = { ...this.gpxStats, loadingElevation: false };
        this.snackBar.open('Não foi possível obter dados de elevação.', 'OK', { duration: 3000 });
      });
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
      if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
      if (this.cursorMarker) { this.map.removeLayer(this.cursorMarker); this.cursorMarker = null; }
    }
  }

  private renderElevationChart(): void {
    const canvas = document.getElementById('elevation-chart') as HTMLCanvasElement;
    if (!canvas || !this.gpxStats?.elevationProfile) return;
    if (this.chartInstance) this.chartInstance.destroy();

    const ctx = canvas.getContext('2d')!;
    const { distances, elevations, coords } = this.gpxStats.elevationProfile;
    const color = this.gpxStats ? (this.localRoutes.find(r => r.id === this.gpxStats?.activeId)?.color
      ?? this.savedRoutes.find(r => r.id === this.gpxStats?.activeId)?.color
      ?? '#e53935') : '#e53935';

    this.chartInstance = new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels: distances.map(d => `${d.toFixed(1)} km`),
        datasets: [{
          label: 'Elevação (m)',
          data: elevations,
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (items: any[]) => `Dist: ${items[0].label}`,
              label: (item: any) => `Elevação: ${item.raw.toFixed(0)} m`,
            },
            external: () => {} // sobrescrito abaixo via evento
          }
        },
        onHover: (_: any, elements: any[]) => {
          if (!elements.length) {
            if (this.cursorMarker) { this.map.removeLayer(this.cursorMarker); this.cursorMarker = null; }
            return;
          }
          const idx = elements[0].index;
          const coord = coords[idx];
          if (!coord) return;

          if (this.cursorMarker) {
            this.cursorMarker.setLatLng(coord);
          } else {
            this.cursorMarker = L.circleMarker(coord, {
              radius: 7,
              fillColor: color,
              fillOpacity: 1,
              color: '#fff',
              weight: 2,
              className: 'cursor-marker-pulse',
            }).addTo(this.map);
          }
        },
        scales: {
          x: { ticks: { maxTicksLimit: 8, font: { size: 11 } }, grid: { display: false } },
          y: { ticks: { font: { size: 11 } }, title: { display: true, text: 'Elevação (m)', font: { size: 11 } } }
        }
      }
    });
  }

  get hasGpx(): boolean {
    return this.localRoutes.length > 0;
  }
}