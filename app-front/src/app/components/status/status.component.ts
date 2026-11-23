import { Component, OnInit } from '@angular/core';
import { HomeDataService, HomeStats } from '../../services/home-data/home-data.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    MatButtonModule,
    NgxChartsModule,
  ],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css'
})
export class StatusComponent implements OnInit {

  stats: HomeStats | null = null;
  loading = true;
  error = false;

  chartData: { name: string; value: number }[] = [];

  constructor(private homeDataService: HomeDataService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = false;
    this.homeDataService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.stats.activeGoals.sort((a, b) => b.progressPercent - a.progressPercent);
        this.chartData = data.weeklyChart.map(d => ({
          name: d.date,
          value: d.distanceKm
        }));
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
}
