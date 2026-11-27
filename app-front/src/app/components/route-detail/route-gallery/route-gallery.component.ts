import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-route-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (imageUrls().length > 0) {
      <section class="section-card">
        <div class="section-header">
          <h2 class="section-title">
            <mat-icon>photo_library</mat-icon>
            <span>Fotos da Trilha</span>
          </h2>
        </div>
        <div class="photo-grid">
          @for (url of imageUrls(); track url; let i = $index) {
            <div class="photo-item" (click)="openImage.emit(i)">
              <img [src]="url" alt="Foto da rota" class="photo-img" loading="lazy" />
              <div class="photo-overlay">
                <mat-icon>zoom_in</mat-icon>
              </div>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .section-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-hairline);
      border-radius: var(--radius-card);
      padding: 20px 24px;
      box-shadow: var(--shadow-card);
    }
    .section-header {
      margin-bottom: 16px;
    }
    .section-title {
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .section-title mat-icon {
      color: var(--accent-primary);
    }
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
    }
    .photo-item {
      position: relative;
      aspect-ratio: 4 / 3;
      border-radius: var(--radius-control);
      overflow: hidden;
      cursor: pointer;
      border: 1px solid var(--border-hairline);
    }
    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 220ms var(--ease-spring);
    }
    .photo-overlay {
      position: absolute;
      inset: 0;
      background: rgba(24, 24, 27, 0.35);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 180ms ease;
    }
    .photo-item:hover .photo-img {
      transform: scale(1.04);
    }
    .photo-item:hover .photo-overlay {
      opacity: 1;
    }
  `,
})
export class RouteGalleryComponent {
  readonly imageUrls = input.required<string[]>();
  readonly openImage = output<number>();
}
