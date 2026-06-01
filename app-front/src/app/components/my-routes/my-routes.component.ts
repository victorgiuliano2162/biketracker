import { Component, OnInit } from '@angular/core';
import { RouteService } from '../../services/route/route.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart, registerables } from 'chart.js';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouteResponse } from '../../models/route.model';



Chart.register(...registerables);

@Component({
  selector: 'app-my-routes',
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
  ],
  templateUrl: './my-routes.component.html',
  styleUrl: './my-routes.component.css',
})
export class MyRoutesComponent implements OnInit {
  routes: RouteResponse[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;

  constructor(
    private routeService: RouteService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.loading = true;
    this.routeService.listMine(this.pageIndex, this.pageSize).subscribe({
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

  openDetail(routeId: string): void {
    this.router.navigate(['/routes', routeId]);
  }

  deleteRoute(route: RouteResponse, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm(`Excluir a rota "${route.name}"?`)) return;
    this.routeService.deleteRoute(route.id).subscribe({
      next: () => {
        this.routes = this.routes.filter((r) => r.id !== route.id);
        this.totalElements--;
      },
      error: () => alert('Erro ao excluir a rota. Tente novamente.'),
    });
  }

  togglePrivacy(route: RouteResponse, event: MouseEvent): void {
    event.stopPropagation();
    this.routeService.toggleVisibility(route.id).subscribe({
      next: (updated) => {
        const i = this.routes.findIndex((r) => r.id === updated.id);
        if (i !== -1) this.routes[i] = updated;
      },
      error: () => alert('Erro ao alterar visibilidade.'),
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
