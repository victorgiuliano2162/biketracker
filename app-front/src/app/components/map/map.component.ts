import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocationService } from '../../services/location/location.service';
import {
  RouteService,
  CreateRouteRequest,
} from '../../services/route/route.service';
import { GpxParserService } from '../../services/gpx/gpx-parser.service';
import { ElevationService } from '../../services/gpx/elevation.service';
import { ElevationPanelComponent } from './elevation-panel/elevation-panel.component';
import {
  SaveRouteDialogComponent,
  SaveRouteDialogData,
  SaveRouteDialogResult,
} from '../save-route-dialog/save-route-dialog.component';
import { ActivityImageService } from '../../services/image/actitivy-image.service';
import { NotificationService } from '../../shared/services/notification.service';
import { GPX_COLORS } from '../../shared/utils/route-constants';
import { LeafletMapService } from './leaflet-map.service';
import { MapSidebarComponent } from './map-sidebar/map-sidebar.component';
import { FlatRouteNode, GpxStats, RouteNode } from './map.models';

export type { GpxStats, RouteNode, FlatRouteNode } from './map.models';

@Component({
  selector: 'app-map',
  standalone: true,
  providers: [LeafletMapService],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    ElevationPanelComponent,
    MapSidebarComponent,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gpxInput') gpxInput!: ElementRef<HTMLInputElement>;

  private readonly locationService = inject(LocationService);
  private readonly routeService = inject(RouteService);
  private readonly gpxParser = inject(GpxParserService);
  private readonly elevationService = inject(ElevationService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly activityImageService = inject(ActivityImageService);
  private readonly mapService = inject(LeafletMapService);
  private readonly destroyRef = inject(DestroyRef);

  localRoutes: RouteNode[] = [];
  savedRoutes: RouteNode[] = [];
  regionRoutes: RouteNode[] = [];
  treeData: RouteNode[] = [];

  fileName = '';
  selectedRouteIds = new Set<string>();
  sidebarOpen = false;
  locating = false;
  savingRouteId: string | null = null;
  gpxStats: GpxStats | null = null;

  ngOnInit(): void {
    this.refreshTree();
    this.loadSavedRoutes();
    this.centerOnUser();
  }

  ngAfterViewInit(): void {
    this.mapService.init('leaflet-map');
    this.locationService
      .getUserLocation()
      .then((coords) => this.mapService.flyTo(coords.lat, coords.lng, 15, 1.5))
      .catch(() => {});
  }

  ngOnDestroy(): void {
    this.mapService.destroy();
  }

  get hasGpx(): boolean {
    return this.localRoutes.length > 0;
  }

  get isTreeEmpty(): boolean {
    return (
      this.localRoutes.length === 0 &&
      this.savedRoutes.length === 0 &&
      this.regionRoutes.length === 0
    );
  }

  getActiveColor(): string {
    return (
      this.localRoutes.find((r) => r.id === this.gpxStats?.activeId)?.color ??
      this.savedRoutes.find((r) => r.id === this.gpxStats?.activeId)?.color ??
      '#e53935'
    );
  }

  centerOnUser(): void {
    this.locating = true;
    this.locationService
      .getUserLocation()
      .then((coords) => {
        this.mapService.flyTo(coords.lat, coords.lng, 16, 1.2);
        this.mapService.setUserMarker(coords.lat, coords.lng);
      })
      .catch(() =>
        this.notification.error('Não foi possível obter sua localização.'),
      )
      .finally(() => (this.locating = false));
  }

  toggleRoute(node: FlatRouteNode): void {
    if (!node.id) return;

    if (this.selectedRouteIds.has(node.id)) {
      this.deselectRoute(node);
      return;
    }

    if (node.isSaved && !node.coordinates && node.savedId) {
      this.loadReplayAndSelect(node);
      return;
    }

    if (node.coordinates) {
      this.selectRoute(node, node.coordinates, node.elevations);
    }
  }

  clearAll(): void {
    this.mapService.clearAllLayers();
    this.selectedRouteIds = new Set();
    this.gpxStats = null;
  }

  onCursorMove(coord: [number, number] | null): void {
    this.mapService.setCursorMarker(coord, this.getActiveColor());
  }

  openGpxPicker(): void {
    this.gpxInput.nativeElement.click();
  }

  onGpxFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    Array.from(input.files).forEach((file) => this.processGpxFile(file));
    input.value = '';
  }

  saveRoute(node: FlatRouteNode): void {
    if (!node.id || !node.coordinates || node.isSaved) return;

    const coords = node.coordinates;
    const distanceInKm = this.elevationService.calculateDistanceKm(coords);
    const elevationInMeters = node.elevations
      ? this.elevationService.calculateElevationGain(node.elevations)
      : 0;

    const stats: GpxStats =
      this.gpxStats?.activeId === node.id
        ? this.gpxStats!
        : {
            activeId: node.id,
            name: node.name,
            points: coords.length,
            distanceKm: distanceInKm,
            elevationGainM: node.elevations ? elevationInMeters : null,
            loadingElevation: false,
            elevationProfile: null,
          };

    const dialogRef = this.dialog.open<
      SaveRouteDialogComponent,
      SaveRouteDialogData,
      SaveRouteDialogResult
    >(SaveRouteDialogComponent, {
      data: { stats, defaultName: node.name },
      width: '580px',
      maxWidth: '95vw',
      autoFocus: 'dialog',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) return;
        this.persistRoute(node, coords, distanceInKm, elevationInMeters, result);
      });
  }

  saveActiveRoute(): void {
    if (!this.gpxStats?.activeId) return;
    const node = this.localRoutes.find((r) => r.id === this.gpxStats!.activeId);
    if (!node || node.isSaved || !node.coordinates) return;

    this.saveRoute({
      expandable: false,
      level: 1,
      id: node.id,
      name: node.name,
      coordinates: node.coordinates,
      elevations: node.elevations,
      color: node.color,
      isSaved: node.isSaved,
      savedId: node.savedId,
    });
  }

  deleteRoute(node: FlatRouteNode): void {
    if (!node.id) return;

    const doDelete = () => {
      this.mapService.removeRouteLayer(node.id!);
      const nextSelected = new Set(this.selectedRouteIds);
      nextSelected.delete(node.id!);
      this.selectedRouteIds = nextSelected;

      if (this.gpxStats?.activeId === node.id) {
        this.gpxStats = null;
        this.mapService.clearCursorMarker();
      }
      if (node.isSaved) {
        this.savedRoutes = this.savedRoutes.filter((r) => r.id !== node.id);
      } else {
        this.localRoutes = this.localRoutes.filter((r) => r.id !== node.id);
      }
      this.refreshTree();
    };

    if (node.savedId != null) {
      this.routeService
        .deleteRoute(node.savedId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => doDelete(),
          error: () => this.notification.error('Erro ao excluir rota.'),
        });
    } else {
      doDelete();
    }
  }

  private persistRoute(
    node: FlatRouteNode,
    coords: [number, number][],
    distanceInKm: number,
    elevationInMeters: number,
    result: SaveRouteDialogResult,
  ): void {
    this.savingRouteId = node.id!;
    const now = new Date().toISOString();

    const request: CreateRouteRequest = {
      name: result.name,
      description: result.description,
      distanceInKm,
      elevationInMeters,
      startTime: now,
      endTime: now,
      startCity: '',
      country: result.country,
      isPublic: result.isPublic,
      difficulty: result.routeDifficulty,
      trackPoints: coords.map((c, i) => ({
        latitude: c[0],
        longitude: c[1],
        altitudeInMeters: node.elevations?.[i] ?? 0,
        recordedAt: now,
      })),
    };

    this.routeService
      .save(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.localRoutes = this.localRoutes.filter((r) => r.id !== node.id);
          const newId = `saved-${saved.id}`;
          this.savedRoutes.push({
            id: newId,
            name: result.name,
            coordinates: node.coordinates,
            elevations: node.elevations,
            color: node.color,
            isSaved: true,
            savedId: saved.id,
          });

          this.mapService.renameLayer(node.id!, newId, `<b>${result.name}</b>`);
          const nextSelected = new Set(this.selectedRouteIds);
          nextSelected.delete(node.id!);
          nextSelected.add(newId);
          this.selectedRouteIds = nextSelected;

          this.refreshTree();
          this.savingRouteId = null;
          this.notification.success(`"${result.name}" salva com sucesso!`);

          if (result.images.length > 0) {
            this.activityImageService
              .uploadImages(saved.id, result.images)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                error: () =>
                  this.notification.error(
                    'Rota salva, mas houve um erro ao enviar as fotos.',
                    4000,
                  ),
              });
          }
        },
        error: () => {
          this.savingRouteId = null;
          this.notification.error('Erro ao salvar rota.');
        },
      });
  }

  private selectRoute(
    node: FlatRouteNode,
    coords: [number, number][],
    elevations?: number[],
  ): void {
    const nextSelected = new Set(this.selectedRouteIds);
    nextSelected.add(node.id!);
    this.selectedRouteIds = nextSelected;

    this.mapService.addRouteLayer(node.id!, coords, {
      color: node.color ?? '#1976d2',
      popupHtml: `<b>${node.name}</b>`,
    });

    this.openStats(node, coords, elevations);
  }

  private deselectRoute(node: FlatRouteNode): void {
    const nextSelected = new Set(this.selectedRouteIds);
    nextSelected.delete(node.id!);
    this.selectedRouteIds = nextSelected;
    this.mapService.removeRouteLayer(node.id!);

    if (this.gpxStats?.activeId === node.id) {
      this.gpxStats = null;
      this.mapService.clearCursorMarker();
    }
  }

  private loadReplayAndSelect(node: FlatRouteNode): void {
    this.routeService
      .getReplay(node.savedId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (replay) => {
          const coords = replay.points.map(
            (p) => [p.latitude, p.longitude] as [number, number],
          );
          const elevations = replay.points.map((p) => p.altitudeInMeters);

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
        error: () => this.notification.error('Erro ao carregar rota.'),
      });
  }

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
      this.notification.error('Não foi possível obter dados de elevação.');
    }
  }

  private processGpxFile(file: File): void {
    const reader = new FileReader();
    this.fileName = file.name;

    reader.onload = (e) => {
      const { coords, elevations } = this.gpxParser.parse(
        e.target?.result as string,
      );

      if (coords.length < 2) {
        this.notification.error(`"${file.name}": GPX inválido ou sem pontos.`);
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

      const nextSelected = new Set(this.selectedRouteIds);
      nextSelected.add(id);
      this.selectedRouteIds = nextSelected;

      this.mapService.addRouteLayer(id, coords, {
        color,
        popupHtml: `<b>📁 ${node.name}</b>`,
        dashed: true,
      });

      this.openStats(
        { ...node, expandable: false, level: 1 } as FlatRouteNode,
        coords,
        elevations,
      );
    };

    reader.readAsText(file);
  }

  private loadSavedRoutes(): void {
    this.routeService
      .listMine()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

  private refreshTree(): void {
    this.treeData = [
      { name: 'Carregadas', children: [...this.localRoutes] },
      { name: 'Salvas', children: [...this.savedRoutes] },
      { name: 'Na região', children: [...this.regionRoutes] },
    ];
  }

  private pickColor(): string {
    const usedColors = new Set([
      ...this.localRoutes.map((r) => r.color),
      ...this.savedRoutes.map((r) => r.color),
      ...this.regionRoutes.map((r) => r.color),
    ]);

    const free = GPX_COLORS.find((c) => !usedColors.has(c));
    if (!free) {
      const hue = Math.round((usedColors.size * 137.5) % 360);
      return `hsl(${hue}, 70%, 45%)`;
    }
    return free;
  }
}
