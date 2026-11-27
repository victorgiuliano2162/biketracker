import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GpxStats } from '../map/map.component';
import { COUNTRIES } from '../../shared/utils/route-constants';
import { PhotoUploaderComponent } from '../../shared/ui/photo-uploader/photo-uploader.component';

export { COUNTRIES } from '../../shared/utils/route-constants';
export type { RejectedImage } from '../../shared/ui/photo-uploader/photo-uploader.component';

export interface SaveRouteDialogData {
  stats: GpxStats;
  defaultName: string;
}

export interface SaveRouteDialogResult {
  name: string;
  description?: string;
  country: string;
  isPublic: boolean;
  routeDifficulty: string;
  images: File[];
}

@Component({
  selector: 'app-save-route-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    PhotoUploaderComponent,
  ],
  templateUrl: './save-route-dialog.component.html',
  styleUrl: './save-route-dialog.component.css',
})
export class SaveRouteDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(
    MatDialogRef<SaveRouteDialogComponent, SaveRouteDialogResult>,
  );
  readonly data = inject<SaveRouteDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  readonly countries = COUNTRIES;
  readonly selectedFiles = signal<File[]>([]);
  readonly isValidating = signal(false);

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [
        this.data.defaultName,
        [Validators.required, Validators.maxLength(80)],
      ],
      description: ['', [Validators.maxLength(1000)]],
      country: ['BR', Validators.required],
      isPublic: [false],
      difficulty: ['MODERADA', Validators.required],
    });
  }

  get elevationLabel(): string {
    const gain = this.data.stats.elevationGainM;
    return gain === null ? '—' : `${Math.round(gain)} m`;
  }

  get distanceLabel(): string {
    return `${this.data.stats.distanceKm.toFixed(2)} km`;
  }

  onFilesChange(files: File[]): void {
    this.selectedFiles.set(files);
  }

  onValidatingChange(validating: boolean): void {
    this.isValidating.set(validating);
  }

  confirm(): void {
    if (this.form.invalid || this.isValidating()) return;
    const { name, description, country, isPublic, difficulty } = this.form.value;
    this.dialogRef.close({
      name,
      description: (description ?? '').trim() || undefined,
      country,
      isPublic,
      routeDifficulty: difficulty,
      images: this.selectedFiles(),
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
