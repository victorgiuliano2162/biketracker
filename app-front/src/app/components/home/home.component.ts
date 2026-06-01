import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { HomeDataService, HomeStats } from '../../services/home-data/home-data.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LocationService } from '../../services/location/location.service';
import { RouteService } from '../../services/route/route.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { RouteCardComponent } from '../route-card/route-card.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { computeBoundingBox } from '../../utils/geo.utils';
import { RouteResponse } from '../../models/route.model';
import { RouterModule } from '@angular/router';

const PAGE_SIZE = 9;
@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouteCardComponent,
    RouterModule
    ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  private routeService = inject(RouteService);
  private locationService = inject(LocationService);
  private snackBar = inject(MatSnackBar);
 
  routes: RouteResponse[] = [];
  loading = false;
  totalElements = 0;
  currentPage = 0;
  radiusKm = 25;
  userLocation: { lat: number; lng: number } | null = null;
 
  readonly PAGE_SIZE = PAGE_SIZE;
 
  ngOnInit(): void {
    this.tryAutoLocation();
  }
 
  /** Tenta obter localização silenciosamente ao carregar a página */
  private tryAutoLocation(): void {
    this.locationService.getUserLocation()
      .then((loc) => {
        this.userLocation = loc;
        this.loadRoutes();
      })
      .catch(() => {
        // Sem localização — carrega todas as rotas públicas
        this.loadRoutes();
      });
  }
 
  requestLocation(): void {
    this.locationService.getUserLocation()
      .then((loc) => {
        this.userLocation = loc;
        this.currentPage = 0;
        this.loadRoutes();
      })
      .catch(() => {
        this.snackBar.open('Não foi possível obter sua localização.', 'Fechar', { duration: 3000 });
      });
  }
 
  clearLocation(): void {
    this.userLocation = null;
    this.currentPage = 0;
    this.loadRoutes();
  }
 
  onRadiusChange(): void {
    this.currentPage = 0;
    this.loadRoutes();
  }
 
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.loadRoutes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
 
  private loadRoutes(): void {
    this.loading = true;
 
    const obs$ = this.userLocation
      ? this.routeService.getPublicRoutesInRegion(
          computeBoundingBox(this.userLocation.lat, this.userLocation.lng, this.radiusKm),
          this.currentPage,
          PAGE_SIZE
        )
      : this.routeService.getPublicRoutes(this.currentPage, PAGE_SIZE);
 
    obs$.subscribe({
      next: (page) => {
        this.routes = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar rotas. Tente novamente.', 'Fechar', { duration: 4000 });
        this.loading = false;
      },
    });
  }
  

}
