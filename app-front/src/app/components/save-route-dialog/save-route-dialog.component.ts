import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GpxStats } from '../map/map.component';

export interface SaveRouteDialogData {
  stats: GpxStats;
  defaultName: string;
}

export interface SaveRouteDialogResult {
  name: string;
  country: string;
  isPublic: boolean;
  routeDifficulty: string;
  /** Optional images selected by the user — may be empty. */
  images: File[];
}

export const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'NL', name: 'Países Baixos', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'CH', name: 'Suíça', flag: '🇨🇭' },
  { code: 'AT', name: 'Áustria', flag: '🇦🇹' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { code: 'ZA', name: 'África do Sul', flag: '🇿🇦' },
  { code: 'OTHER', name: 'Outro', flag: '🌍' },
];

interface ImagePreview {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-save-route-dialog',
  imports: [
    CommonModule,
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
  ],
  templateUrl: './save-route-dialog.component.html',
  styleUrl: './save-route-dialog.component.css',
})
export class SaveRouteDialogComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  countries = COUNTRIES;
  previews: ImagePreview[] = [];
  isDraggingOver = false;

  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly MAX_SIZE_MB = 10;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SaveRouteDialogComponent, SaveRouteDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: SaveRouteDialogData,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.defaultName, [Validators.required, Validators.maxLength(80)]],
      country: ['BR', Validators.required],
      isPublic: [false],
      dificulty: ['MODERADA', Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
  }

  // ---------------------------------------------------------------------------
  // Computed labels
  // ---------------------------------------------------------------------------

  get elevationLabel(): string {
    const gain = this.data.stats.elevationGainM;
    return gain === null ? '—' : `${Math.round(gain)} m`;
  }

  get distanceLabel(): string {
    return `${this.data.stats.distanceKm.toFixed(2)} km`;
  }

  // ---------------------------------------------------------------------------
  // Drag-and-drop handlers
  // ---------------------------------------------------------------------------

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver = true;
  }

  onDragLeave(): void {
    this.isDraggingOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingOver = false;
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.addFiles(files);
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.addFiles(files);
    input.value = ''; // reset so the same file can be re-added after removal
  }

  removeImage(index: number): void {
    URL.revokeObjectURL(this.previews[index].previewUrl);
    this.previews.splice(index, 1);
  }

  // ---------------------------------------------------------------------------
  // Dialog actions
  // ---------------------------------------------------------------------------

  confirm(): void {
    if (this.form.invalid) return;
    const { name, country, isPublic, dificulty } = this.form.value;
    this.dialogRef.close({
      name,
      country,
      isPublic,
      routeDifficulty: dificulty,
      images: this.previews.map((p) => p.file),
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private addFiles(files: File[]): void {
    const valid = files.filter((f) => this.validate(f));
    const newPreviews: ImagePreview[] = valid.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    this.previews = [...this.previews, ...newPreviews];
  }

  private validate(file: File): boolean {
    if (!this.ALLOWED_TYPES.includes(file.type)) return false;
    if (file.size > this.MAX_SIZE_MB * 1024 * 1024) return false;
    return true;
  }
}