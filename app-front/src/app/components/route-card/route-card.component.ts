import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouteResponse } from '../../models/route.model';
import { RouteService } from '../../services/route/route.service';
import { formatDuration } from '../../utils/geo.utils';
import { RouterModule } from '@angular/router';

 
const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  EASY:     { label: 'Fácil',    color: '#4caf50' },
  MODERATE: { label: 'Moderado', color: '#ff9800' },
  HARD:     { label: 'Difícil',  color: '#f44336' },
  EXPERT:   { label: 'Expert',   color: '#9c27b0' },
};


@Component({
  selector: 'app-route-card',
  imports: [
    CommonModule, 
    MatCardModule, 
    MatChipsModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './route-card.component.html',
  styleUrl: './route-card.component.css'
})
export class RouteCardComponent {

  @Input({ required: true }) route!: RouteResponse;
 
  private routeService = inject(RouteService);
 
  imgError = false;
 
  get previewUrl(): string {
    return this.routeService.getPreviewSvgUrl(this.route.id);
  }
 
  get difficultyLabel(): string {
    return DIFFICULTY_LABELS[this.route.routeDifficulty]?.label ?? this.route.routeDifficulty;
  }
 
  get difficultyColor(): string {
    return DIFFICULTY_LABELS[this.route.routeDifficulty]?.color ?? '#9e9e9e';
  }
 
  get duration(): string {
    return formatDuration(this.route.activityTimeInSeconds);
  }

}
