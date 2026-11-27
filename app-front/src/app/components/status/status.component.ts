import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HomeDataService, HomeStats } from '../../services/home-data/home-data.service';
import {
  WeeklyBarPoint,
  WeeklyDistanceChartComponent,
} from '../../shared/ui/weekly-distance-chart/weekly-distance-chart.component';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [
    DecimalPipe,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    MatButtonModule,
    WeeklyDistanceChartComponent,
  ],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css',
})
export class StatusComponent implements OnInit {
  private readonly homeDataService = inject(HomeDataService);
  private readonly destroyRef = inject(DestroyRef);

  stats: HomeStats | null = null;
  loading = true;
  error = false;
  chartData: WeeklyBarPoint[] = [];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = false;
    this.homeDataService
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.stats.activeGoals.sort((a, b) => b.progressPercent - a.progressPercent);
          this.chartData = data.weeklyChart.map((d) => ({
            name: d.date,
            value: d.distanceKm,
          }));
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        },
      });
  }
}
