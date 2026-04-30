import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TextFieldModule } from '@angular/cdk/text-field';
import { GoalService, GoalRequest } from '../../services/goal/goal.service';

@Component({
  selector: 'app-goal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    TextFieldModule,
  ],
  templateUrl: '../goal/goal.component.html',
  styleUrl: '../goal/goal.component.css',
})
export class GoalComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  today = new Date();

  units = [
    { value: 'km',     label: 'Quilômetros (km)' },
    { value: 'rides',  label: 'Pedaladas (rides)' },
    { value: 'horas',  label: 'Horas (h)' },
    { value: 'metros', label: 'Metros de elevação (m)' },
  ];

  constructor(
    private fb: FormBuilder,
    private goalService: GoalService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({ goals: this.fb.array([this.buildGoalGroup()]) });
  }

  get goalForms(): FormArray {
    return this.form.get('goals') as FormArray;
  }

  asGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  private buildGoalGroup(): FormGroup {
    return this.fb.group({
      name:        ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.required],
      targetValue: [null, [Validators.required, Validators.min(0.1)]],
      unit:        ['km', Validators.required],
      deadLine:    [null, Validators.required],
    });
  }

  addGoal(): void {
    this.goalForms.push(this.buildGoalGroup());
  }

  removeGoal(index: number): void {
    this.goalForms.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload: GoalRequest[] = this.goalForms.value.map((g: any) => ({
      ...g,
      deadLine: this.formatDate(g.deadLine),
    }));

    this.goalService.create(payload).subscribe({
      next: () => {
        this.snackBar.open(
          `${payload.length} meta(s) criada(s) com sucesso!`, '✓',
          { duration: 3000 },
        );
        this.router.navigate(['/goals']);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erro ao salvar metas.', 'OK', { duration: 3000 });
      },
    });
  }

  private formatDate(date: Date | string): string {
    if (typeof date === 'string') return date;
    const d = date as Date;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}