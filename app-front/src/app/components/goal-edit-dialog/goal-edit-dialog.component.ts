import { Component, Inject, OnInit } from '@angular/core';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import { GoalResponse, GoalRequest } from '../../services/goal/goal.service';

@Component({
  selector: 'app-goal-edit-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TextFieldModule,
  ],
  templateUrl: './goal-edit-dialog.component.html',
  styleUrl: './goal-edit-dialog.component.css',
})
export class GoalEditDialogComponent implements OnInit {
  form!: FormGroup;
  today = new Date();

  units = [
    { value: 'km', label: 'Quilômetros (km)' },
    { value: 'rides', label: 'Pedaladas (rides)' },
    { value: 'horas', label: 'Horas (h)' },
    { value: 'metros', label: 'Metros de elevação (m)' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GoalEditDialogComponent, GoalRequest>,
    @Inject(MAT_DIALOG_DATA) public data: GoalResponse,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.name, [Validators.required, Validators.maxLength(100)]],
      description: [this.data.description, Validators.required],
      targetValue: [
        this.data.targetValue,
        [Validators.required, Validators.min(0.1)],
      ],
      unit: [this.data.unit, Validators.required],
      deadLine: [
        this.data.deadLine ? new Date(this.data.deadLine) : null,
        Validators.required,
      ],
    });
  }

  confirm(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const deadLine =
      v.deadLine instanceof Date ? this.fmt(v.deadLine) : v.deadLine;
    this.dialogRef.close({ ...v, deadLine });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private fmt(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
