import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  input,
  output,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-elevation-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-box" [style.height.px]="height()">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: `
    .chart-box {
      position: relative;
      width: 100%;
    }
  `,
})
export class ElevationChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly distances = input.required<number[]>();
  readonly elevations = input.required<number[]>();
  readonly color = input('#185FA5');
  readonly fillColor = input<string | null>(null);
  readonly height = input(180);
  readonly showAxisTitles = input(true);

  readonly hoverIndex = output<number | null>();

  @ViewChild('chartCanvas') chartCanvasRef?: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.viewReady) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private render(): void {
    const canvas = this.chartCanvasRef?.nativeElement;
    const distances = this.distances();
    const elevations = this.elevations();
    if (!canvas || !distances.length || !elevations.length) {
      this.destroyChart();
      return;
    }

    this.destroyChart();
    const borderColor = this.color();
    const bgColor = this.fillColor() ?? `${borderColor}20`;
    const showTitles = this.showAxisTitles();

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: distances.map((d) => d.toFixed(1)),
        datasets: [
          {
            data: elevations,
            borderColor,
            backgroundColor: bgColor,
            borderWidth: 1.75,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: borderColor,
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `${items[0].label} km`,
              label: (item) => `Altitude: ${Math.round(Number(item.raw))} m`,
            },
          },
        },
        onHover: (_, elements) => {
          this.hoverIndex.emit(elements.length ? elements[0].index : null);
        },
        scales: {
          x: {
            ticks: { font: { size: 11 }, maxTicksLimit: 7, autoSkip: true },
            grid: { color: 'rgba(136,135,128,0.1)' },
            border: { display: false },
            title: {
              display: showTitles,
              text: 'distância (km)',
              font: { size: 11 },
            },
          },
          y: {
            ticks: { font: { size: 11 }, maxTicksLimit: 5 },
            grid: { color: 'rgba(136,135,128,0.1)' },
            border: { display: false },
            title: {
              display: showTitles,
              text: 'altitude (m)',
              font: { size: 11 },
            },
          },
        },
      },
    });
  }

  private destroyChart(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}
