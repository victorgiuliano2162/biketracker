import { Component, OnInit } from '@angular/core';
import { HomeDataService, HomeStats } from '../../services/home-data/home-data.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
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
    NgxChartsModule,
  ],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css'
})
export class StatusComponent implements OnInit {

  stats: HomeStats | null = null;

  chartData: { name: string; value: number }[] = [];

  constructor(private homeDataService: HomeDataService) {}

  ngOnInit(): void {
    this.homeDataService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.stats.activeGoals.sort((a,b) => b.progressPercent - a.progressPercent);
        this.chartData = data.weeklyChart.map(d => ({
          name: d.date,
          value: d.distanceKm
        }));
      },
      error: (err) => console.error('Erro ao carregar stats:', err)
    });
  }

   formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}
