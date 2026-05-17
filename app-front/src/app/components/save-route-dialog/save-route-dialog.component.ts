import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
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
}

const dificulties = [
  {label: "Fácil", value: "FACIL"},
  {label: "Moderado", value: "MODERADA"},
  {label: "Difícil", value: "DIFICIL"},
]

 
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
  ],
  templateUrl: './save-route-dialog.component.html',
  styleUrl: './save-route-dialog.component.css'
})
export class SaveRouteDialogComponent implements OnInit {
  form!: FormGroup;
  countries = COUNTRIES;
 
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
      dificulty: [Validators.required]
    });
  }
 
  get elevationLabel(): string {
    const gain = this.data.stats.elevationGainM;
    if (gain === null) return '—';
    return `${Math.round(gain)} m`;
  }
 
  get distanceLabel(): string {
    return `${this.data.stats.distanceKm.toFixed(2)} km`;
  }
 
  confirm(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value as SaveRouteDialogResult);
  }
 
  cancel(): void {
    this.dialogRef.close();
  }
}
