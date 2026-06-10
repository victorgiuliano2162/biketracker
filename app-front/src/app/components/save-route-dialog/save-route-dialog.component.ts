import { NsfwValidationService } from './../../services/nsfw/nsfw-validation.service';
import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GpxStats } from '../map/map.component';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface SaveRouteDialogData {
  stats: GpxStats;
  defaultName: string;
}

export interface SaveRouteDialogResult {
  name: string;
  country: string;
  isPublic: boolean;
  routeDifficulty: string;
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
  /** true enquanto o modelo NSFW ainda está analisando esta imagem */
  validating: boolean;
}

export interface RejectedImage {
  fileName: string;
  reason: string;
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
    MatProgressSpinnerModule,
  ],
  templateUrl: './save-route-dialog.component.html',
  styleUrl: './save-route-dialog.component.css',
})
export class SaveRouteDialogComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  countries = COUNTRIES;
  previews: ImagePreview[] = [];
  isDraggingOver = false;

  private _snackBar = inject(MatSnackBar);

  /** Fotos rejeitadas pela validação NSFW — exibidas como avisos no template */
  rejectedImages: RejectedImage[] = [];

  /** Indica se há alguma imagem ainda sendo validada */
  get isValidating(): boolean {
    return this.previews.some((p) => p.validating);
  }

  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  private readonly MAX_SIZE_MB = 10;

  constructor(
    private fb: FormBuilder,
    private nsfwService: NsfwValidationService,
    public dialogRef: MatDialogRef<
      SaveRouteDialogComponent,
      SaveRouteDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: SaveRouteDialogData,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [
        this.data.defaultName,
        [Validators.required, Validators.maxLength(80)],
      ],
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
    input.value = '';
  }

  removeImage(index: number): void {
    URL.revokeObjectURL(this.previews[index].previewUrl);
    this.previews.splice(index, 1);
  }

  dismissRejected(index: number): void {
    this.rejectedImages.splice(index, 1);
  }

  // ---------------------------------------------------------------------------
  // Dialog actions
  // ---------------------------------------------------------------------------

  confirm(): void {
    if (this.form.invalid || this.isValidating) return;
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

    // Adiciona imediatamente ao grid com estado "validando"
    const newPreviews: ImagePreview[] = valid.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      validating: true,
    }));

    this.previews = [...this.previews, ...newPreviews];

    // Roda a validação NSFW para cada imagem de forma independente
    newPreviews.forEach((preview) => this.runNsfwCheck(preview));
  }

  private async runNsfwCheck(preview: ImagePreview): Promise<void> {
    try {
      console.log('[NSFW] Iniciando classificação:', preview.file.name);
      const result = await this.nsfwService.classify(preview.file);
      console.log('[NSFW] Resultado:', result);

      if (result.blocked) {
        const idx = this.previews.indexOf(preview);
        if (idx !== -1) {
          URL.revokeObjectURL(preview.previewUrl);
          this.previews.splice(idx, 1);
        }
        this.rejectedImages = [
          ...this.rejectedImages,
          { fileName: preview.file.name, reason: result.reason! },
        ];
      } else {
        preview.validating = false;
      }
    } catch (err) {
      console.error('[NSFW] Erro no runNsfwCheck:', err);
      preview.validating = false;
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }
  private validate(file: File): boolean {
    if (!this.ALLOWED_TYPES.includes(file.type)) return false;
    if (file.size > this.MAX_SIZE_MB * 1024 * 1024) {
      let error_message = "O arquivo " + file.name + " excede o limite de " + this.MAX_SIZE_MB + " MB.";
      this.openSnackBar(error_message, 'Fechar');
      
      return false;
    }
    return true;
  }
}
