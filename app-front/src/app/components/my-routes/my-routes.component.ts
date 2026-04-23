import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { RouteResponse, RouteService, TrackPoint } from '../../services/route/route.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart, registerables } from 'chart.js';

interface ChartPoint { dist: number; alt: number; }

Chart.register(...registerables);


@Component({
  selector: 'app-my-routes',
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './my-routes.component.html',
  styleUrl: './my-routes.component.css'
})
export class MyRoutesComponent {
routes: RouteResponse[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;
  expandedRouteId: string | null = null;
  //replayCache = new Map<string, { dist: number; alt: number }[]>();

  


  replayLoading = false;

  replayCache = new Map<string, TrackPoint[]>();
  chartDataCache = new Map<string, ChartPoint[]>();
  avgElevCache = new Map<string, number>();

  private chartInstances = new Map<string, Chart>();
  private pendingChart: string | null = null;

  @ViewChildren('chartCanvas') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  constructor(private routeService: RouteService) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  ngAfterViewChecked(): void {
    if (this.pendingChart) {
      const id = this.pendingChart;
      const canvasRef = this.chartCanvases.find(c => c.nativeElement.id === `chart-${id}`);
      if (canvasRef) {
        this.pendingChart = null;
        this.renderChart(id, canvasRef.nativeElement);
      }
    }
  }

  loadRoutes(): void {
    this.loading = true;
    this.routeService.listMine(this.pageIndex, this.pageSize).subscribe({
      next: page => {
        this.routes = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.expandedRouteId = null;
    this.loadRoutes();
  }

  toggleRoute(routeId: string): void {
    if (this.expandedRouteId === routeId) {
      this.expandedRouteId = null;
      return;
    }
    this.expandedRouteId = routeId;

    if (this.replayCache.has(routeId)) {
      this.pendingChart = routeId;
      return;
    }

    this.replayLoading = true;
    this.routeService.getReplay(routeId).subscribe({
      next: replay => {
        this.replayCache.set(routeId, replay.points);

        const chartData = this.buildChartData(replay.points);
        this.chartDataCache.set(routeId, chartData);
        this.avgElevCache.set(routeId, this.calcAvgElev(replay.points));

        this.replayLoading = false;
        this.pendingChart = routeId;
      },
      error: () => (this.replayLoading = false),
    });
  }

  private buildChartData(points: TrackPoint[]): ChartPoint[] {
    let acc = 0;
    return points.map((p, i) => {
      if (i > 0) acc += this.haversineKm(points[i - 1], p);
      return { dist: parseFloat(acc.toFixed(2)), alt: p.altitudeInMeters };
    });
  }

  private calcAvgElev(points: TrackPoint[]): number {
    const sum = points.reduce((a, p) => a + p.altitudeInMeters, 0);
    return Math.round(sum / points.length);
  }

  private haversineKm(p1: TrackPoint, p2: TrackPoint): number {
    const R = 6371;
    const dLat = (p2.latitude - p1.latitude) * Math.PI / 180;
    const dLon = (p2.longitude - p1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(p1.latitude * Math.PI / 180) *
      Math.cos(p2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private renderChart(routeId: string, canvas: HTMLCanvasElement): void {
    const existing = this.chartInstances.get(routeId);
    if (existing) existing.destroy();

    const data = this.chartDataCache.get(routeId) ?? [];

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map(p => p.dist.toFixed(1)),
        datasets: [{
          data: data.map(p => p.alt),
          borderColor: '#185FA5',
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#185FA5',
          fill: true,
          backgroundColor: 'rgba(55,138,221,0.10)',
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: items => `${items[0].label} km`,
              label: item => `Altitude: ${item.raw} m`,
            },
          },
        },
        scales: {
          x: {
            ticks: { font: { size: 11 }, maxTicksLimit: 6, autoSkip: true },
            grid: { color: 'rgba(136,135,128,0.1)' },
            border: { display: false },
            title: { display: true, text: 'distância (km)', font: { size: 11 } },
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

    this.chartInstances.set(routeId, chart);
  }

  downloadGpx(route: RouteResponse, event: MouseEvent): void {
  event.stopPropagation();
  const points = this.replayCache.get(route.id);
  if (!points) return;
  const gpx = this.buildGpx(route, points);
  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${route.name.replace(/\s+/g, '_')}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

  private buildGpx(route: RouteResponse, points: TrackPoint[]): string {
    const trkpts = points.map(p =>
      `    <trkpt lat="${p.latitude}" lon="${p.longitude}">
      <ele>${p.altitudeInMeters}</ele>
      <time>${p.recordedAt}</time>
    </trkpt>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BikeTrakker"
  xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${route.name}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }

  avgSpeed(route: RouteResponse): string {
    return (route.distanceInKm / (route.activityTimeInSeconds / 3600)).toFixed(1);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(d: string): string {
    return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
