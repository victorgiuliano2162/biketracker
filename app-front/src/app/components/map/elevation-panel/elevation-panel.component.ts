import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GpxStats } from '../map.component';
import { ElevationChartComponent } from '../../../shared/ui/elevation-chart/elevation-chart.component';

@Component({
  selector: 'app-elevation-panel',
  standalone: true,
  imports: [
    DecimalPipe,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ElevationChartComponent,
  ],
  templateUrl: './elevation-panel.component.html',
  styleUrl: './elevation-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElevationPanelComponent {
  @Input() stats!: GpxStats;
  @Input() color = '#e53935';

  /** Emite a coord do ponto sob o cursor, ou null quando sai do gráfico. */
  @Output() cursorMove = new EventEmitter<[number, number] | null>();

  expanded = false;

  toggleExpand(): void {
    this.expanded = !this.expanded;
    if (!this.expanded) {
      this.cursorMove.emit(null);
    }
  }

  onChartHover(index: number | null): void {
    if (index === null || !this.stats?.elevationProfile) {
      this.cursorMove.emit(null);
      return;
    }
    const coord = this.stats.elevationProfile.coords[index];
    this.cursorMove.emit(coord ?? null);
  }
}
