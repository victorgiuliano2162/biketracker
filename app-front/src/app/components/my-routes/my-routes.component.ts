import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouteService } from '../../services/route/route.service';
import { RouteResponse } from '../../models/route.model';
import { NotificationService } from '../../shared/services/notification.service';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-my-routes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    FormatDatePipe,
  ],
  templateUrl: './my-routes.component.html',
  styleUrl: './my-routes.component.css',
})
export class MyRoutesComponent implements OnInit {
  private readonly routeService = inject(RouteService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  routes: RouteResponse[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.loading = true;
    this.routeService
      .listMine(this.pageIndex, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.routes = page.content ?? [];
          this.totalElements =
            page.page?.totalElements ?? page.totalElements ?? this.routes.length;
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

  openDetail(routeId: string): void {
    this.router.navigate(['/routes', routeId]);
  }

  deleteRoute(route: RouteResponse, event: MouseEvent): void {
    event.stopPropagation();
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
            next: () => {
              this.routes = this.routes.filter((r) => r.id !== route.id);
              this.totalElements--;
            },
            error: () =>
              this.notification.error('Erro ao excluir a rota. Tente novamente.'),
          });
      });
  }

  togglePrivacy(route: RouteResponse, event: MouseEvent): void {
    event.stopPropagation();
    this.routeService
      .toggleVisibility(route.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          const i = this.routes.findIndex((r) => r.id === updated.id);
          if (i !== -1) this.routes[i] = updated;
        },
        error: () => this.notification.error('Erro ao alterar visibilidade.'),
      });
  }
}
