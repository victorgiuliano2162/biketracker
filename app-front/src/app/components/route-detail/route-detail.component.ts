import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouteMapComponent } from '../route-map/route-map.component';
import { RouteService, TrackPoint } from '../../services/route/route.service';
import { ActivityImageService } from '../../services/image/actitivy-image.service';
import { ImageLightboxComponent } from '../image-lightbox/image-lightbox.component';
import { RouteResponse } from '../../models/route.model';
import { RouteDetailData } from '../../resolvers/route-detail.resolver';
import { AuthService } from '../../services/auth/auth.service';
import { EditRouteDialogComponent } from '../edit-route-dialog/edit-route-dialog.component';
import {
  CommentResponse,
  CommentService,
} from '../../services/comment/comment.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ElevationChartComponent } from '../../shared/ui/elevation-chart/elevation-chart.component';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { buildGpxXml, downloadGpxFile } from '../../shared/utils/gpx-builder.util';
import { haversineKm } from '../../utils/geo.utils';
import { RouteCommentsComponent } from './route-comments/route-comments.component';
import { RouteGalleryComponent } from './route-gallery/route-gallery.component';

export interface ChartPoint {
  dist: number;
  alt: number;
}

@Component({
  selector: 'app-route-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    RouteMapComponent,
    ElevationChartComponent,
    FormatDatePipe,
    RouteCommentsComponent,
    RouteGalleryComponent,
  ],
  templateUrl: './route-detail.component.html',
  styleUrl: './route-detail.component.css',
})
export class RouteDetailComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly routeService = inject(RouteService);
  private readonly imageService = inject(ActivityImageService);
  private readonly commentService = inject(CommentService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  route: RouteResponse | null = null;
  points: TrackPoint[] = [];
  imageUrls: string[] = [];
  comments: CommentResponse[] = [];
  newComment = '';
  postingComment = false;
  chartData: ChartPoint[] = [];
  chartDistances: number[] = [];
  chartElevations: number[] = [];
  avgElev: number | null = null;
  hoverIndex: number | null = null;

  loading = true;
  error = false;

  readonly canDeleteCommentBound = (comment: CommentResponse) =>
    this.canDeleteComment(comment);

  get isOwner(): boolean {
    const currentUserId = this.authService.getCurrentUserId();
    return Boolean(
      this.route?.ownerId && currentUserId && this.route.ownerId === currentUserId,
    );
  }

  ngOnInit(): void {
    const data = this.activatedRoute.snapshot.data['data'] as RouteDetailData;

    this.route = data.route;
    this.points = data.points;
    this.chartData = this.buildChartData(data.points);
    this.chartDistances = this.chartData.map((p) => p.dist);
    this.chartElevations = this.chartData.map((p) => p.alt);
    this.avgElev = this.calcAvgElev(data.points);
    this.loading = false;

    this.imageService
      .getPresignedUrls(data.route.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (urls) => (this.imageUrls = urls),
        error: () => {},
      });

    this.commentService
      .list(data.route.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => (this.comments = list),
        error: () => {},
      });
  }

  togglePrivacy(): void {
    if (!this.route || !this.isOwner) return;
    this.routeService
      .toggleVisibility(this.route.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => (this.route = updated),
        error: () => this.notification.error('Erro ao alterar visibilidade.'),
      });
  }

  editRoute(): void {
    if (!this.route || !this.isOwner) return;
    const ref = this.dialog.open(EditRouteDialogComponent, {
      data: this.route,
      width: '520px',
      maxWidth: '95vw',
      autoFocus: 'dialog',
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result || !this.route) return;
        this.routeService
          .updateRoute(this.route.id, result)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (updated) => {
              this.route = updated;
              this.notification.success('Rota atualizada com sucesso!');
            },
            error: () => this.notification.error('Erro ao atualizar rota.'),
          });
      });
  }

  deleteRoute(): void {
    if (!this.route || !this.isOwner) return;
    const route = this.route;
    this.notification
      .confirm({
        title: 'Excluir rota',
        message: `Excluir a rota "${route.name}"?`,
        confirmLabel: 'Excluir',
        destructive: true,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.routeService
          .deleteRoute(route.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.router.navigate(['/routes']),
            error: () => this.notification.error('Erro ao excluir a rota.'),
          });
      });
  }

  downloadGpx(): void {
    if (!this.route || !this.points.length) return;
    downloadGpxFile(this.route, this.points);
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

  canDeleteComment(comment: CommentResponse): boolean {
    const currentUserId = this.authService.getCurrentUserId();
    return Boolean(
      this.isOwner || (currentUserId && comment.authorId === currentUserId),
    );
  }

  submitComment(): void {
    const content = this.newComment.trim();
    if (!this.route || !content || this.postingComment) return;
    this.postingComment = true;
    this.commentService
      .create(this.route.id, content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.comments = [created, ...this.comments];
          this.newComment = '';
          this.postingComment = false;
        },
        error: () => {
          this.postingComment = false;
          this.notification.error('Erro ao publicar comentário.');
        },
      });
  }

  deleteComment(comment: CommentResponse): void {
    if (!this.route || !this.canDeleteComment(comment)) return;
    const routeId = this.route.id;
    this.notification
      .confirm({
        title: 'Excluir comentário',
        message: 'Excluir este comentário?',
        confirmLabel: 'Excluir',
        destructive: true,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.commentService
          .delete(routeId, comment.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.comments = this.comments.filter((c) => c.id !== comment.id);
              this.notification.success('Comentário excluído.', 2500);
            },
            error: () => this.notification.error('Erro ao excluir comentário.'),
          });
      });
  }

  goBack(): void {
    this.router.navigate(['/routes']);
  }

  buildGpx(route: RouteResponse, points: TrackPoint[]): string {
    return buildGpxXml(route, points);
  }

  private buildChartData(pts: TrackPoint[]): ChartPoint[] {
    let acc = 0;
    return pts.map((p, i) => {
      if (i > 0) {
        acc += haversineKm(
          pts[i - 1].latitude,
          pts[i - 1].longitude,
          p.latitude,
          p.longitude,
        );
      }
      return { dist: parseFloat(acc.toFixed(2)), alt: p.altitudeInMeters };
    });
  }

  private calcAvgElev(pts: TrackPoint[]): number | null {
    if (!pts.length) return null;
    return Math.round(
      pts.reduce((a, p) => a + p.altitudeInMeters, 0) / pts.length,
    );
  }
}
