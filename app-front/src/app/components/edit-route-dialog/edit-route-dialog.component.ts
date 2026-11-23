import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { RouteResponse } from '../../models/route.model';
import { UpdateRouteRequest } from '../../services/route/route.service';
import { COUNTRIES } from '../save-route-dialog/save-route-dialog.component';

@Component({
  selector: 'app-edit-route-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './edit-route-dialog.component.html',
  styleUrl: './edit-route-dialog.component.css',
})
export class EditRouteDialogComponent {
  form: FormGroup;
  countries = COUNTRIES;
  difficulties = [
    { value: 'FACIL', label: 'Fácil' },
    { value: 'MODERADA', label: 'Moderada' },
    { value: 'DIFICIL', label: 'Difícil' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditRouteDialogComponent, UpdateRouteRequest>,
    @Inject(MAT_DIALOG_DATA) public route: RouteResponse,
  ) {
    this.form = this.fb.group({
      name: [route.name ?? '', [Validators.required, Validators.maxLength(150)]],
      description: [route.description ?? '', [Validators.maxLength(1000)]],
      difficulty: [route.routeDifficulty || 'MODERADA', Validators.required],
      startCity: [route.startCity ?? ''],
      country: [route.country || 'BR'],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.dialogRef.close({
      name: v.name.trim(),
      description: (v.description ?? '').trim(),
      difficulty: v.difficulty,
      startCity: (v.startCity ?? '').trim(),
      country: v.country,
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
