import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HomeDataService, HomeStats } from '../../services/home-data/home-data.service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    NgxChartsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

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
