import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  ViewChild,
  input,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface WeeklyBarPoint {
  name: string;
  value: number;
}

@Component({
  selector: 'app-weekly-distance-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-box" [style.height.px]="height()">
      <canvas #chartCanvas role="img" aria-label="Gráfico de distância semanal"></canvas>
    </div>
  `,
  styles: `
    .chart-box {
      position: relative;
      width: 100%;
    }
  `,
})
export class WeeklyDistanceChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  readonly data = input.required<WeeklyBarPoint[]>();
  readonly height = input(240);

  @ViewChild('chartCanvas') chartCanvasRef?: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnChanges(): void {
    if (this.viewReady) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  private render(): void {
    const canvas = this.chartCanvasRef?.nativeElement;
    const points = this.data();
    if (!canvas || !points.length) {
      this.chart?.destroy();
      this.chart = null;
      return;
    }

    this.chart?.destroy();
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: points.map((p) => p.name),
        datasets: [
          {
            data: points.map((p) => p.value),
            backgroundColor: '#1B6B53',
            borderRadius: 6,
            maxBarThickness: 36,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => `${Number(item.raw).toFixed(1)} km`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'km', font: { size: 11 } },
            ticks: { font: { size: 11 } },
          },
        },
      },
    });
  }
}
