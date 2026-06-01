import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouteMapComponent } from '../route-map/route-map.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  RouteService,
  TrackPoint,
} from '../../services/route/route.service';
import { Chart, registerables } from 'chart.js';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityImageService } from '../../services/image/actitivy-image.service';
import { forkJoin } from 'rxjs';
import {
  ImageLightboxComponent,
  LightboxData,
} from '../image-lightbox/image-lightbox.component';
import { RouteResponse } from '../../models/route.model';
import { RouteDetailData } from '../../resolvers/route-detail.resolver';

// route-detail.component.ts
export interface ChartPoint {
  dist: number;
  alt: number;
}

@Component({
  selector: 'app-route-detail',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    RouteMapComponent,
  ],
  templateUrl: './route-detail.component.html',
  styleUrl: './route-detail.component.css',
})
export class RouteDetailComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  route: RouteResponse | null = null;
  points: TrackPoint[] = [];
  imageUrls: string[] = [];
  chartData: ChartPoint[] = [];
  avgElev: number | null = null;
  hoverIndex: number | null = null;

  loading = true;
  error = false;

  private chart: Chart | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private routeService: RouteService,
    private imageService: ActivityImageService,
    private dialog: MatDialog,
  ) {}

 ngOnInit(): void {
    // O resolver já garantiu que os dados existem antes de chegar aqui.
    const data = this.activatedRoute.snapshot.data['data'] as RouteDetailData;
 
    this.route  = data.route;
    this.points = data.points;
    this.chartData = this.buildChartData(data.points);
    this.avgElev   = this.calcAvgElev(data.points);
    this.loading   = false;
 
    // Imagens continuam sendo carregadas de forma assíncrona (não bloqueiam a navegação)
    this.imageService.getPresignedUrls(data.route.id).subscribe({
      next: (urls) => (this.imageUrls = urls),
      error: () => {},
    });
 
    setTimeout(() => this.renderChart(), 0);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  
  //Replaced by resolver data loading
  /*
  private loadAll(id: string): void {
    this.loading = true;
    forkJoin({
      route: this.routeService.getById(id),
      replay: this.routeService.getReplay(id),
      images: this.imageService.getPresignedUrls(id),
    }).subscribe({
      next: ({ route, replay, images }) => {
        this.route = route;
        this.points = replay.points;
        this.imageUrls = images;
        this.chartData = this.buildChartData(replay.points);
        this.avgElev = this.calcAvgElev(replay.points);
        this.loading = false;
        setTimeout(() => this.renderChart(), 0);
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }
  */

  // ── Actions ────────────────────────────────────────────────────────────────

  togglePrivacy(): void {
    if (!this.route) return;
    this.routeService.toggleVisibility(this.route.id).subscribe({
      next: (updated) => (this.route = updated),
      error: () => alert('Erro ao alterar visibilidade.'),
    });
  }

  deleteRoute(): void {
    if (!this.route) return;
    if (!confirm(`Excluir a rota "${this.route.name}"?`)) return;
    this.routeService.deleteRoute(this.route.id).subscribe({
      next: () => this.router.navigate(['/routes']),
      error: () => alert('Erro ao excluir a rota.'),
    });
  }

  downloadGpx(): void {
    if (!this.route || !this.points.length) return;
    const gpx = this.buildGpx(this.route, this.points);
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.route.name.replace(/\s+/g, '_')}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  openImage(index: number): void {
    this.dialog.open(ImageLightboxComponent, {
      data: { urls: this.imageUrls, index },
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'lightbox-panel',
    });
  }

  onMapHover(index: number | null): void {
    this.hoverIndex = index;
  }

  goBack(): void {
    this.router.navigate(['/routes']);
  }

  // ── Formatters ─────────────────────────────────────────────────────────────

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private buildChartData(pts: TrackPoint[]): ChartPoint[] {
    let acc = 0;
    return pts.map((p, i) => {
      if (i > 0) acc += this.haversineKm(pts[i - 1], p);
      return { dist: parseFloat(acc.toFixed(2)), alt: p.altitudeInMeters };
    });
  }

  private calcAvgElev(pts: TrackPoint[]): number {
    return Math.round(
      pts.reduce((a, p) => a + p.altitudeInMeters, 0) / pts.length,
    );
  }

  private haversineKm(p1: TrackPoint, p2: TrackPoint): number {
    const R = 6371;
    const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
    const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((p1.latitude * Math.PI) / 180) *
        Math.cos((p2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private renderChart(): void {
    if (!this.chartCanvas) return;
    this.chart?.destroy();
    const data = this.chartData;
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: data.map((p) => p.dist.toFixed(1)),
        datasets: [
          {
            data: data.map((p) => p.alt),
            borderColor: '#185FA5',
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#185FA5',
            fill: true,
            backgroundColor: 'rgba(55,138,221,0.10)',
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `${items[0].label} km`,
              label: (item) => `Altitude: ${item.raw} m`,
            },
          },
        },
        scales: {
          x: {
            ticks: { font: { size: 11 }, maxTicksLimit: 6, autoSkip: true },
            grid: { color: 'rgba(136,135,128,0.1)' },
            border: { display: false },
            title: {
              display: true,
              text: 'distância (km)',
              font: { size: 11 },
            },
          },
          y: {
            ticks: { font: { size: 11 }, maxTicksLimit: 5 },
            grid: { color: 'rgba(136,135,128,0.1)' },
            border: { display: false },
            title: { display: true, text: 'altitude (m)', font: { size: 11 } },
          },
        },
      },
    });
  }

  private buildGpx(route: RouteResponse, points: TrackPoint[]): string {
    const trkpts = points
      .map(
        (p) =>
          `    <trkpt lat="${p.latitude}" lon="${p.longitude}">\n      <ele>${p.altitudeInMeters}</ele>\n      <time>${p.recordedAt}</time>\n    </trkpt>`,
      )
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Trakker"\n  xmlns="http://www.topografix.com/GPX/1/1">\n  <trk>\n    <name>${route.name}</name>\n    <trkseg>\n${trkpts}\n    </trkseg>\n  </trk>\n</gpx>`;
  }
}
