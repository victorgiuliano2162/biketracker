import {
  Component,
  Input,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  DestroyRef,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouteResponse } from '../../models/route.model';
import { RouteService } from '../../services/route/route.service';
import { DIFFICULTY_LABELS } from '../../shared/utils/route-constants';

type PreviewState = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-route-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './route-card.component.html',
  styleUrl: './route-card.component.css',
})
export class RouteCardComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) route!: RouteResponse;
  @ViewChild('previewTarget') previewTargetRef?: ElementRef<HTMLDivElement>;

  private routeService = inject(RouteService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private intersectionObserver?: IntersectionObserver;

  state: PreviewState = 'loading';
  previewUrl: string | null = null;

  get difficultyLabel(): string {
    return (
      DIFFICULTY_LABELS[this.route.routeDifficulty]?.label ??
      this.route.routeDifficulty
    );
  }

  get difficultyColor(): string {
    return DIFFICULTY_LABELS[this.route.routeDifficulty]?.color ?? '#9e9e9e';
  }

  ngAfterViewInit(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.intersectionObserver?.disconnect();
          this.checkAndLoadPreview();
        }
      },
      { threshold: 0.1 },
    );

    this.intersectionObserver.observe(
      this.previewTargetRef?.nativeElement ?? document.body,
    );
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  private checkAndLoadPreview(): void {
    this.routeService
      .checkPreview(this.route.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (url) => {
          if (url) {
            this.previewUrl = url;
            this.state = 'ready';
          } else {
            this.state = 'error';
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.state = 'error';
          this.cdr.markForCheck();
        },
      });
  }
}
