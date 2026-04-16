import { Component } from '@angular/core';
import { RouteResponse, RouteService, TrackPoint } from '../../services/route/route.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

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
  replayCache = new Map<string, { dist: number; alt: number }[]>();

  constructor(private routeService: RouteService) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  toggleRoute(routeId: string): void {
  if (this.expandedRouteId === routeId) {
    this.expandedRouteId = null;
    return;
  }
  this.expandedRouteId = routeId;
  if (this.replayCache.has(routeId)) return; // já carregado

  this.routeService.getReplay(routeId).subscribe(replay => {
    this.replayCache.set(routeId, this.buildChartData(replay.points));
    
  });
}

  loadRoutes(): void {
    this.loading = true;
    this.routeService
      .listMine(this.pageIndex, this.pageSize)
      .subscribe({
        next: (page) => {
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
    this.loadRoutes();
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }

  avgSpeed(route: RouteResponse): string {
    const hours = route.activityTimeInSeconds / 3600;
    return (route.distanceInKm / hours).toFixed(1);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private haversineKm(p1: TrackPoint, p2: TrackPoint): number {
  const R = 6371;
  const dLat = (p2.latitude - p1.latitude) * Math.PI / 180;
  const dLon = (p2.longitude - p1.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(p1.latitude * Math.PI/180) *
            Math.cos(p2.latitude * Math.PI/180) *
            Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

buildChartData(points: TrackPoint[]): { dist: number; alt: number }[] {
  let acc = 0;
  return points.map((p, i) => {
    if (i > 0) acc += this.haversineKm(points[i - 1], p);
    return { dist: parseFloat(acc.toFixed(2)), alt: p.altitudeInMeters };
  });
}
}
