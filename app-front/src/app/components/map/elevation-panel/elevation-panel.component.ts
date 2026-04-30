import {
  Component, Input, Output, EventEmitter,
  OnChanges, OnDestroy, SimpleChanges,
  ElementRef, ViewChild, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart, registerables } from 'chart.js';
import { GpxStats } from '../map.component';

Chart.register(...registerables);

@Component({
  selector: 'app-elevation-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './elevation-panel.component.html',
  styleUrl: './elevation-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElevationPanelComponent implements OnChanges, OnDestroy {

  @Input() stats!: GpxStats;
  @Input() color: string = '#e53935';

  /** Emite a coord do ponto sob o cursor, ou null quando sai do gráfico. */
  @Output() cursorMove = new EventEmitter<[number, number] | null>();

  @ViewChild('chartCanvas') chartCanvasRef!: ElementRef<HTMLCanvasElement>;

  expanded = false;
  private chartInstance: Chart | null = null;

  // ── Lifecycle ────────────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    // Quando os stats mudam (nova rota ou elevação chegou), re-renderiza
    if (changes['stats'] && this.expanded) {
      setTimeout(() => this.renderChart(), 50);
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  // ── Toggle expand ────────────────────────────────────────────────────

  toggleExpand(): void {
    this.expanded = !this.expanded;

    if (this.expanded) {
      setTimeout(() => this.renderChart(), 50);
    } else {
      this.destroyChart();
      this.cursorMove.emit(null);
    }
  }

  // ── Chart ────────────────────────────────────────────────────────────

  private renderChart(): void {
    const canvas = this.chartCanvasRef?.nativeElement;
    if (!canvas || !this.stats?.elevationProfile) return;

    this.destroyChart();

    const { distances, elevations, coords } = this.stats.elevationProfile;
    const ctx = canvas.getContext('2d')!;

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: distances.map(d => `${d.toFixed(1)} km`),
        datasets: [{
          label: 'Elevação (m)',
          data: elevations,
          borderColor: this.color,
          backgroundColor: this.color + '20',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: items => `Dist: ${items[0].label}`,
              label: item  => `Elevação: ${Number(item.raw).toFixed(0)} m`,
            },
          },
        },
        onHover: (_, elements) => {
          if (!elements.length) {
            this.cursorMove.emit(null);
            return;
          }
          const coord = coords[elements[0].index];
          if (coord) this.cursorMove.emit(coord);
        },
        scales: {
          x: {
            ticks: { maxTicksLimit: 8, font: { size: 11 } },
            grid: { display: false },
          },
          y: {
            ticks: { font: { size: 11 } },
            title: { display: true, text: 'Elevação (m)', font: { size: 11 } },
          },
        },
      },
    });
  }

  private destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
}