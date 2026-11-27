import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NsfwValidationService } from '../../../services/nsfw/nsfw-validation.service';
import { NotificationService } from '../../services/notification.service';

export interface ImagePreview {
  file: File;
  previewUrl: string;
  validating: boolean;
}

export interface RejectedImage {
  fileName: string;
  reason: string;
}

@Component({
  selector: 'app-photo-uploader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './photo-uploader.component.html',
  styleUrl: './photo-uploader.component.css',
})
export class PhotoUploaderComponent implements OnDestroy {
  private readonly nsfwService = inject(NsfwValidationService);
  private readonly notification = inject(NotificationService);

  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  private readonly MAX_SIZE_MB = 10;

  readonly previews = signal<ImagePreview[]>([]);
  readonly rejectedImages = signal<RejectedImage[]>([]);
  readonly isDraggingOver = signal(false);

  readonly filesChange = output<File[]>();
  readonly validatingChange = output<boolean>();

  ngOnDestroy(): void {
    this.previews().forEach((p) => URL.revokeObjectURL(p.previewUrl));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver.set(true);
  }

  onDragLeave(): void {
    this.isDraggingOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.addFiles(files);
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.addFiles(files);
    input.value = '';
  }

  removeImage(index: number): void {
    const current = [...this.previews()];
    const [removed] = current.splice(index, 1);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    this.previews.set(current);
    this.emitState();
  }

  dismissRejected(index: number): void {
    const current = [...this.rejectedImages()];
    current.splice(index, 1);
    this.rejectedImages.set(current);
  }

  private addFiles(files: File[]): void {
    const valid = files.filter((f) => this.validate(f));
    if (!valid.length) return;

    const newPreviews: ImagePreview[] = valid.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      validating: true,
    }));

    this.previews.update((list) => [...list, ...newPreviews]);
    this.emitState();

    newPreviews.forEach((preview) => this.runNsfwCheck(preview));
  }

  private async runNsfwCheck(preview: ImagePreview): Promise<void> {
    try {
      const result = await this.nsfwService.classify(preview.file);
      if (result.blocked) {
        URL.revokeObjectURL(preview.previewUrl);
        this.previews.update((list) => list.filter((p) => p !== preview));
        this.rejectedImages.update((list) => [
          ...list,
          { fileName: preview.file.name, reason: result.reason ?? 'Conteúdo impróprio' },
        ]);
      } else {
        this.previews.update((list) =>
          list.map((p) => (p === preview ? { ...p, validating: false } : p)),
        );
      }
    } catch {
      this.previews.update((list) =>
        list.map((p) => (p === preview ? { ...p, validating: false } : p)),
      );
    } finally {
      this.emitState();
    }
  }

  private emitState(): void {
    const list = this.previews();
    this.validatingChange.emit(list.some((p) => p.validating));
    this.filesChange.emit(list.map((p) => p.file));
  }

  private validate(file: File): boolean {
    if (!this.ALLOWED_TYPES.includes(file.type)) return false;
    if (file.size > this.MAX_SIZE_MB * 1024 * 1024) {
      this.notification.info(
        `O arquivo ${file.name} excede o limite de ${this.MAX_SIZE_MB} MB.`,
        'Fechar',
      );
      return false;
    }
    return true;
  }
}
