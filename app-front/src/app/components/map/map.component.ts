import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import * as L from 'leaflet';
import { LocationService } from '../../services/location/location.service';
import {
  RouteService,
  CreateRouteRequest,
  RouteResponse,
} from '../../services/route/route.service';
import { GpxParserService } from '../../services/gpx/gpx-parser.service';
import {
  ElevationService,
  ElevationProfile,
} from '../../services/gpx/elevation.service';
import { ElevationPanelComponent } from './elevation-panel/elevation-panel.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  SaveRouteDialogComponent,
  SaveRouteDialogData,
  SaveRouteDialogResult,
} from './../save-route-dialog/save-route-dialog.component';

const GPX_COLORS = [
  '#e53935',
  '#8e24aa',
  '#1e88e5',
  '#00897b',
  '#f4511e',
  '#6d4c41',
  '#00acc1',
  '#43a047',
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

export interface GpxStats {
  activeId: string;
  name: string;
  points: number;
  distanceKm: number;
  elevationGainM: number | null;
  loadingElevation: boolean;
  elevationProfile: ElevationProfile | null;
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
    ElevationPanelComponent,
    MatDialogModule,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gpxInput') gpxInput!: ElementRef<HTMLInputElement>;

  private map!: L.Map;
  private layers = new Map<string, L.Polyline>();
  private userMarker: L.CircleMarker | null = null;

  // Estado do cursor — preenchido pelo ElevationPanelComponent via Output
  cursorCoord: [number, number] | null = null;
  private cursorMarker: L.CircleMarker | null = null;

  localRoutes: RouteNode[] = [];
  savedRoutes: RouteNode[] = [];
  fileName = '';
  selectedRouteIds = new Set<string>();
  sidebarOpen = false;
  locating = false;
  savingRouteId: string | null = null;

  // Passado ao ElevationPanelComponent via @Input
  gpxStats: GpxStats | null = null;

  regionRoutes: RouteNode[] = [];
  private regionSearchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private locationService: LocationService,
    private routeService: RouteService,
    private gpxParser: GpxParserService,
    private elevationService: ElevationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  // ── Tree ─────────────────────────────────────────────────────────────

  private get treeData(): RouteNode[] {
    return [
      { name: 'Carregadas', children: this.localRoutes },
      { name: 'Salvas', children: this.savedRoutes },
      { name: 'Na região', children: this.regionRoutes },
    ];
  }

  private onMapMoveEnd(): void {
    if (this.regionSearchTimeout) clearTimeout(this.regionSearchTimeout);
    this.regionSearchTimeout = setTimeout(() => {
      const b = this.map.getBounds();
      this.routeService
        .findByRegion(b.getWest(), b.getSouth(), b.getEast(), b.getNorth())
        .subscribe({
          next: (routes) => {
            // Adiciona só rotas que ainda não estão na lista de salvas
            const knownIds = new Set(this.savedRoutes.map((r) => r.savedId));
            const newRoutes = routes.filter((r) => !knownIds.has(r.id));
            newRoutes.forEach((r) => {
              this.regionRoutes.push({
                id: `region-${r.id}`,
                name: r.name || `Rota ${r.id}`,
                color: this.pickColor(),
                isSaved: true,
                savedId: r.id,
                coordinates: undefined,
              });
            });
            this.refreshTree();
          },
          error: () => {},
        });
    }, 600); // debounce de 600ms
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
    savedId: node.savedId,
  });

  treeControl = new FlatTreeControl<FlatRouteNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: FlatRouteNode) => node.expandable;
  isLeaf = (_: number, node: FlatRouteNode) => !node.expandable;

  private refreshTree(): void {
    this.dataSource.data = this.treeData;
    this.treeControl.expandAll();
  }

  getActiveColor(): string {
    return (
      this.localRoutes.find((r) => r.id === this.gpxStats?.activeId)?.color ??
      this.savedRoutes.find((r) => r.id === this.gpxStats?.activeId)?.color ??
      '#e53935'
    );
  }

  private pickColor(): string {
    const usedColors = new Set([
      ...this.localRoutes.map((r) => r.color),
      ...this.savedRoutes.map((r) => r.color),
      ...this.regionRoutes.map((r) => r.color),
    ]);

    const free = GPX_COLORS.find((c) => !usedColors.has(c));

    // Se todas as cores já estão em uso, gera uma cor HSL única por índice
    if (!free) {
      const total = usedColors.size;
      const hue = Math.round((total * 137.5) % 360); // golden angle — espaçamento uniforme
      return `hsl(${hue}, 70%, 45%)`;
    }

    return free;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.refreshTree();
    this.loadSavedRoutes();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
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

    this.locationService
      .getUserLocation()
      .then((coords) =>
        this.map.flyTo([coords.lat, coords.lng], 15, {
          animate: true,
          duration: 1.5,
        }),
      )
      .catch(() => {});

    this.map.on('moveend', () => this.onMapMoveEnd());
  }

  // ── Localização ──────────────────────────────────────────────────────

  centerOnUser(): void {
    this.locating = true;
    this.locationService
      .getUserLocation()
      .then((coords) => {
        this.map.flyTo([coords.lat, coords.lng], 16, {
          animate: true,
          duration: 1.2,
        });
        if (this.userMarker) this.map.removeLayer(this.userMarker);
        this.userMarker = L.circleMarker([coords.lat, coords.lng], {
          radius: 8,
          fillColor: '#1976d2',
          fillOpacity: 1,
          color: '#fff',
          weight: 2,
        })
          .addTo(this.map)
          .bindPopup('Você está aqui');
      })
      .catch(() =>
        this.snackBar.open('Não foi possível obter sua localização.', 'OK', {
          duration: 3000,
        }),
      )
      .finally(() => (this.locating = false));
  }

  // ── Toggle de rota no mapa ───────────────────────────────────────────

  toggleRoute(node: FlatRouteNode): void {
    if (!node.id) return;

    if (this.selectedRouteIds.has(node.id)) {
      this.deselectRoute(node);
      return;
    }

    // Rota salva sem coordenadas ainda — lazy load
    if (node.isSaved && !node.coordinates && node.savedId) {
      this.loadReplayAndSelect(node);
      return;
    }

    if (node.coordinates) {
      this.selectRoute(node, node.coordinates, node.elevations);
    }
  }

  private selectRoute(
    node: FlatRouteNode,
    coords: [number, number][],
    elevations?: number[],
  ): void {
    this.selectedRouteIds.add(node.id!);

    const polyline = L.polyline(coords, {
      color: node.color ?? '#1976d2',
      weight: 4,
      opacity: 0.85,
    }).addTo(this.map);
    polyline.bindPopup(`<b>${node.name}</b>`);
    this.layers.set(node.id!, polyline);
    this.map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    this.openStats(node, coords, elevations);
  }

  private deselectRoute(node: FlatRouteNode): void {
    this.selectedRouteIds.delete(node.id!);
    const layer = this.layers.get(node.id!);
    if (layer) {
      this.map.removeLayer(layer);
      this.layers.delete(node.id!);
    }

    if (this.gpxStats?.activeId === node.id) {
      this.gpxStats = null;
      this.clearCursorMarker();
    }
  }

  // ── Lazy load de coordenadas para rotas salvas ───────────────────────

  private loadReplayAndSelect(node: FlatRouteNode): void {
    this.routeService.getReplay(node.savedId!).subscribe({
      next: (replay) => {
        const coords = replay.points.map(
          (p) => [p.latitude, p.longitude] as [number, number],
        );
        const elevations = replay.points.map((p) => p.altitudeInMeters);

        // Atualiza o nó na lista para cachear as coordenadas
        const saved = this.savedRoutes.find((r) => r.id === node.id);
        if (saved) {
          saved.coordinates = coords;
          saved.elevations = elevations;
        }

        this.selectRoute(
          { ...node, coordinates: coords, elevations },
          coords,
          elevations,
        );
        this.refreshTree();
      },
      error: () =>
        this.snackBar.open('Erro ao carregar rota.', 'OK', { duration: 3000 }),
    });
  }

  // ── Stats para o ElevationPanelComponent ─────────────────────────────

  private openStats(
    node: FlatRouteNode,
    coords: [number, number][],
    elevations?: number[],
  ): void {
    const distanceKm = this.elevationService.calculateDistanceKm(coords);

    if (
      elevations &&
      elevations.length === coords.length &&
      elevations.length > 0
    ) {
      const gain = this.elevationService.calculateElevationGain(elevations);
      const profile = this.elevationService.buildProfile(coords, elevations);
      this.gpxStats = {
        activeId: node.id!,
        name: node.name,
        points: coords.length,
        distanceKm,
        elevationGainM: gain,
        loadingElevation: false,
        elevationProfile: profile,
      };
    } else {
      this.gpxStats = {
        activeId: node.id!,
        name: node.name,
        points: coords.length,
        distanceKm,
        elevationGainM: null,
        loadingElevation: true,
        elevationProfile: null,
      };
      this.fetchElevation(node.id!, coords);
    }
  }

  private async fetchElevation(
    routeId: string,
    coords: [number, number][],
  ): Promise<void> {
    try {
      const sample = this.elevationService.sample(coords, 100);
      const elevations = await this.elevationService.fetchElevations(coords);

      if (!elevations || this.gpxStats?.activeId !== routeId) return;

      const gain = this.elevationService.calculateElevationGain(elevations);
      const profile = this.elevationService.buildProfile(sample, elevations);
      this.gpxStats = {
        ...this.gpxStats,
        elevationGainM: gain,
        loadingElevation: false,
        elevationProfile: profile,
      };
    } catch {
      if (this.gpxStats?.activeId === routeId) {
        this.gpxStats = { ...this.gpxStats!, loadingElevation: false };
      }
      this.snackBar.open('Não foi possível obter dados de elevação.', 'OK', {
        duration: 3000,
      });
    }
  }

  isSelected(node: FlatRouteNode): boolean {
    return !!node.id && this.selectedRouteIds.has(node.id);
  }

  clearAll(): void {
    this.layers.forEach((layer) => this.map.removeLayer(layer));
    this.layers.clear();
    this.selectedRouteIds.clear();
    this.gpxStats = null;
    this.clearCursorMarker();
  }

  // ── Cursor no mapa — vem do ElevationPanelComponent via Output ────────

  onCursorMove(coord: [number, number] | null): void {
    if (!coord) {
      this.clearCursorMarker();
      return;
    }

    const color = this.gpxStats
      ? (this.localRoutes.find((r) => r.id === this.gpxStats?.activeId)
          ?.color ??
        this.savedRoutes.find((r) => r.id === this.gpxStats?.activeId)?.color ??
        '#e53935')
      : '#e53935';

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

  private clearCursorMarker(): void {
    if (this.cursorMarker) {
      this.map.removeLayer(this.cursorMarker);
      this.cursorMarker = null;
    }
  }

  // ── GPX — carregar arquivo ───────────────────────────────────────────

  openGpxPicker(): void {
    this.gpxInput.nativeElement.click();
  }

  onGpxFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    Array.from(input.files).forEach((file) => this.processGpxFile(file));
    input.value = '';
  }

  private processGpxFile(file: File): void {
    const reader = new FileReader();
    this.fileName = file.name;

    reader.onload = (e) => {
      const { coords, elevations } = this.gpxParser.parse(
        e.target?.result as string,
      );

      if (coords.length < 2) {
        this.snackBar.open(
          `"${file.name}": GPX inválido ou sem pontos.`,
          'OK',
          { duration: 3000 },
        );
        return;
      }

      const id = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const color = this.pickColor();

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

      this.selectedRouteIds.add(id);
      const polyline = L.polyline(coords, {
        color,
        weight: 4,
        opacity: 0.9,
        dashArray: '6, 4',
      }).addTo(this.map);
      polyline.bindPopup(`<b>📁 ${node.name}</b>`);
      this.layers.set(id, polyline);
      this.map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

      this.openStats(
        { ...node, expandable: false, level: 1 } as FlatRouteNode,
        coords,
        elevations,
      );
    };

    reader.readAsText(file);
  }

  // ── GPX — salvar no backend ───────────────────────────────────────────

  saveRoute(node: FlatRouteNode, event: MouseEvent): void {
    event.stopPropagation();
    if (!node.id || !node.coordinates || node.isSaved) return;

    const coords = node.coordinates;
    const distanceInKm = this.elevationService.calculateDistanceKm(coords);
    const elevationInMeters = node.elevations
      ? this.elevationService.calculateElevationGain(node.elevations)
      : 0;

    // Monta os stats para exibir no dialog.
    // Reutiliza gpxStats se for desta rota; caso contrário constrói um snapshot mínimo.
    const stats: import('./map.component').GpxStats =
      this.gpxStats?.activeId === node.id
        ? this.gpxStats!
        : {
            activeId: node.id,
            name: node.name,
            points: coords.length,
            distanceKm: distanceInKm,
            elevationGainM: node.elevations
              ? this.elevationService.calculateElevationGain(node.elevations)
              : null,
            loadingElevation: false,
            elevationProfile: null,
          };

    const dialogRef = this.dialog.open<
      SaveRouteDialogComponent,
      SaveRouteDialogData,
      SaveRouteDialogResult
    >(SaveRouteDialogComponent, {
      data: { stats, defaultName: node.name },
      width: '480px',
      autoFocus: 'dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return; // usuário cancelou

      this.savingRouteId = node.id!;
      const now = new Date().toISOString();

      const request: CreateRouteRequest = {
        name: result.name,
        distanceInKm,
        elevationInMeters,
        startTime: now,
        endTime: now,
        startCity: '',
        country: result.country,
        isPublic: result.isPublic,
        routeDificulty: result.routeDifficulty,
        trackPoints: coords.map((c, i) => ({
          latitude: c[0],
          longitude: c[1],
          altitudeInMeters: node.elevations?.[i] ?? 0,
          recordedAt: now,
        })),
      };

      this.routeService.save(request).subscribe({
        next: (saved) => {
          this.localRoutes = this.localRoutes.filter((r) => r.id !== node.id);
          const savedNode: RouteNode = {
            id: `saved-${saved.id}`,
            name: result.name, // usa o nome editado pelo usuário
            coordinates: node.coordinates,
            elevations: node.elevations,
            color: node.color,
            isSaved: true,
            savedId: saved.id,
          };
          this.savedRoutes.push(savedNode);

          const layer = this.layers.get(node.id!);
          if (layer) {
            this.layers.delete(node.id!);
            this.layers.set(`saved-${saved.id}`, layer);
            layer.bindPopup(`<b>${result.name}</b>`); // atualiza popup com novo nome
          }
          this.selectedRouteIds.delete(node.id!);
          this.selectedRouteIds.add(`saved-${saved.id}`);

          this.refreshTree();
          this.savingRouteId = null;
          this.snackBar.open(`"${result.name}" salva com sucesso!`, '✓', {
            duration: 3000,
          });
        },
        error: () => {
          this.savingRouteId = null;
          this.snackBar.open('Erro ao salvar rota.', 'OK', { duration: 3000 });
        },
      });
    });
  }

  saveActiveRoute(): void {
    if (!this.gpxStats?.activeId) return;
    const node = this.localRoutes.find((r) => r.id === this.gpxStats!.activeId);
    if (!node || node.isSaved || !node.coordinates) return;

    // Constrói um FlatRouteNode mínimo para repassar ao saveRoute()
    const flat: FlatRouteNode = {
      expandable: false,
      level: 1,
      id: node.id,
      name: node.name,
      coordinates: node.coordinates,
      elevations: node.elevations,
      color: node.color,
      isSaved: node.isSaved,
      savedId: node.savedId,
    };

    // Cria um MouseEvent sintético só para satisfazer a assinatura
    this.saveRoute(flat, new MouseEvent('click'));
  }

  deleteRoute(node: FlatRouteNode, event: MouseEvent): void {
    event.stopPropagation();
    if (!node.id) return;

    const doDelete = () => {
      const layer = this.layers.get(node.id!);
      if (layer) {
        this.map.removeLayer(layer);
        this.layers.delete(node.id!);
      }
      this.selectedRouteIds.delete(node.id!);
      if (this.gpxStats?.activeId === node.id) {
        this.gpxStats = null;
        this.clearCursorMarker();
      }
      if (node.isSaved) {
        this.savedRoutes = this.savedRoutes.filter((r) => r.id !== node.id);
      } else {
        this.localRoutes = this.localRoutes.filter((r) => r.id !== node.id);
      }
      this.refreshTree();
    };

    if (node.savedId != null) {
      this.routeService.deleteRoute(node.savedId).subscribe({
        next: () => doDelete(),
        error: () =>
          this.snackBar.open('Erro ao excluir rota.', 'OK', { duration: 3000 }),
      });
    } else {
      doDelete();
    }
  }

  // ── Carregar rotas salvas ────────────────────────────────────────────

  private loadSavedRoutes(): void {
    this.routeService.listMine().subscribe({
      next: (page) => {
        page.content.forEach((r) => {
          this.savedRoutes.push({
            id: `saved-${r.id}`,
            name: r.name || r.startCity || `Rota ${r.id}`,
            color: this.pickColor(),
            isSaved: true,
            savedId: r.id,
            coordinates: undefined,
          });
        });
        this.refreshTree();
      },
      error: () => {},
    });
  }

  get hasGpx(): boolean {
    return this.localRoutes.length > 0;
  }
}
