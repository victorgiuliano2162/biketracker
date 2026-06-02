import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as L from 'leaflet';
import { RouteResponse } from '../../models/route.model';
import { RouteService } from '../../services/route/route.service';
import { formatDuration } from '../../utils/geo.utils';

declare const leafletImage: any;

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  EASY: { label: 'Fácil', color: '#4caf50' },
  MODERATE: { label: 'Moderado', color: '#ff9800' },
  HARD: { label: 'Difícil', color: '#f44336' },
  EXPERT: { label: 'Expert', color: '#9c27b0' },
};

type PreviewState = 'loading' | 'ready' | 'rendering' | 'error';

@Component({
  selector: 'app-route-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './route-card.component.html',
  styleUrl: './route-card.component.css',
})
export class RouteCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) route!: RouteResponse;

  private routeService = inject(RouteService);
  private cdr = inject(ChangeDetectorRef);
  private intersectionObserver?: IntersectionObserver;
  private mapInstance?: L.Map;
  // Container fora da tela onde o Leaflet renderiza antes de exportar
  private offscreenContainer?: HTMLDivElement;

  state: PreviewState = 'loading';
  previewUrl: string | null = null;

  get difficultyLabel(): string {
    return (
      DIFFICULTY_LABELS[this.route.routeDifficulty]?.label ??
      this.route.routeDifficulty
    );
  }

  get difficultyColor(): string {
    return DIFFICULTY_LABELS[this.route.routeDifficulty]?.color ?? '#9e9e9e';
  }

  get duration(): string {
    return formatDuration(this.route.activityTimeInSeconds);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.intersectionObserver?.disconnect();
          this.checkAndLoadPreview();
        }
      },
      { threshold: 0.1 },
    );
    this.intersectionObserver.observe(
      document.querySelector(`app-route-card`) ?? document.body,
    );
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    this.mapInstance?.remove();
    this.offscreenContainer?.remove();
  }

  private checkAndLoadPreview(): void {
    this.routeService.checkPreview(this.route.id).subscribe({
      next: (url) => {
        if (url) {
          this.previewUrl = url;
          this.state = 'ready';
          this.cdr.markForCheck();
        } else {
          this.state = 'rendering';
          this.cdr.markForCheck();
          this.generatePreview();
        }
      },
      error: () => {
        this.state = 'error';
        this.cdr.markForCheck();
      },
    });
  }

  private generatePreview(): void {
    this.routeService.getRouteReplay(this.route.id).subscribe({
      next: (replay) => {
        if (!replay.points?.length) {
          this.state = 'error';
          this.cdr.markForCheck();
          return;
        }
        this.renderLeafletAndExport(replay.points);
      },
      error: () => {
        this.state = 'error';
        this.cdr.markForCheck();
      },
    });
  }

  private renderLeafletAndExport(
    points: { latitude: number; longitude: number }[],
  ): void {
    // Container posicionado fora da área visível — o Leaflet carrega tiles normalmente
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: 400px;
      height: 300px;
      z-index: -1;
    `;
    document.body.appendChild(container);
    this.offscreenContainer = container;

    const latlngs = points.map(
      (p) => [p.latitude, p.longitude] as [number, number],
    );

    const map = L.map(container, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      map,
    );

    const polyline = L.polyline(latlngs, { color: '#2e7d32', weight: 3 }).addTo(
      map,
    );
    map.fitBounds(polyline.getBounds(), { padding: [12, 12] });

    this.mapInstance = map;

    map.once('tilesloaded', () => {
      // Pequeno delay para garantir que o canvas foi pintado
      setTimeout(() => {
        leafletImage(map, (err: any, canvas: HTMLCanvasElement) => {
          map.remove();
          container.remove();
          this.mapInstance = undefined;
          this.offscreenContainer = undefined;

          if (err) {
            console.warn('leafletImage error:', err);
            this.state = 'error';
            this.cdr.markForCheck();
            return;
          }

          this.previewUrl = canvas.toDataURL('image/png');
          this.state = 'ready';
          this.cdr.markForCheck();

          // Envia para o backend salvar no MinIO (fire and forget)
          canvas.toBlob(
            (blob) => {
              if (!blob) return;
              blob.arrayBuffer().then((buffer) => {
                this.routeService
                  .uploadPreview(this.route.id, buffer)
                  .subscribe({
                    next: (url) => console.log('Preview salvo no MinIO:', url),
                    error: (e) => console.warn('Falha ao salvar preview:', e),
                  });
              });
            },
            'image/png',
            0.9,
          );
        });
      }, 200);
    });
  }
}
