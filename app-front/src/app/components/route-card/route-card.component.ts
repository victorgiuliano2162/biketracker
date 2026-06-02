import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouteResponse } from '../../models/route.model';
import { RouteService } from '../../services/route/route.service';
import { formatDuration } from '../../utils/geo.utils';

import * as L from 'leaflet';
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
  @ViewChild('leafletContainer')
  leafletContainerRef?: ElementRef<HTMLDivElement>;

  private routeService = inject(RouteService);
  private intersectionObserver?: IntersectionObserver;
  private mapInstance?: any;

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
    // Adia todo o trabalho pesado até o card entrar na viewport
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.intersectionObserver?.disconnect();
          this.checkAndLoadPreview();
        }
      },
      { threshold: 0.1 },
    );

    // Observa o host element do componente
    this.intersectionObserver.observe(
      this.leafletContainerRef?.nativeElement ?? document.body,
    );
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    this.mapInstance?.remove();
  }

  // ── Passo 1: verifica se já existe preview no MinIO ───────────────────────

  private checkAndLoadPreview(): void {
    this.routeService.checkPreview(this.route.id).subscribe({
      next: (url) => {
        if (url) {
          // Já existe — exibe direto
          this.previewUrl = url;
          this.state = 'ready';
        } else {
          // Não existe — precisa gerar via Leaflet
          this.state = 'rendering';
          this.generatePreview();
        }
      },
      error: () => {
        this.state = 'error';
      },
    });
  }

  // ── Passo 2: busca replay, renderiza Leaflet, exporta PNG ─────────────────

  private generatePreview(): void {
    this.routeService.getRouteReplay(this.route.id).subscribe({
      next: (replay) => {
        if (!replay.points?.length) {
          this.state = 'error';
          return;
        }

        // Aguarda o ViewChild do container Leaflet estar disponível no DOM
        // (só existe quando state === 'rendering')
        setTimeout(() => this.renderLeafletAndExport(replay.points), 50);
      },
      error: () => {
        this.state = 'error';
      },
    });
  }

  private renderLeafletAndExport(
    points: { latitude: number; longitude: number }[],
  ): void {
    const container = this.leafletContainerRef?.nativeElement;
    if (!container) {
      this.state = 'error';
      return;
    }

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

    // Aguarda todos os tiles carregarem antes de exportar
    const doExport = () => {
      leafletImage(map, (err: any, canvas: HTMLCanvasElement) => {
        map.remove();
        this.mapInstance = undefined;

        if (err) {
          this.state = 'error';
          return;
        }

        this.previewUrl = canvas.toDataURL('image/png');
        this.state = 'ready';

        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            blob.arrayBuffer().then((buffer) => {
              this.routeService.uploadPreview(this.route.id, buffer).subscribe({
                error: (e) =>
                  console.warn('Falha ao salvar preview no MinIO:', e),
              });
            });
          },
          'image/png',
          0.9,
        );
      });
    };
    map.on('tilesloaded', () =>
      console.log('tilesloaded disparou para', this.route.id),
    );
    map.on('load', () => console.log('load disparou para', this.route.id));
    // tilesloaded dispara quando todos os tiles visíveis foram carregados
    map.once('tilesloaded', doExport);
  }
}
