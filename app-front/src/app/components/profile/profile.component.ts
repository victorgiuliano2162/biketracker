import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UpdateUserPayload, UserService } from '../../services/user/user.service';
import { TipoSanguineoType, User } from '../../models/user.model';

function pastDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const selected = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selected > today ? { futureDate: true } : null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = true;
  saving = false;
  loadError = false;

  readonly tiposSanguineos: { label: string; value: TipoSanguineoType }[] = [
    { label: 'O+', value: 'O_POSITIVO' },
    { label: 'O-', value: 'O_NEGATIVO' },
    { label: 'A+', value: 'A_POSITIVO' },
    { label: 'A-', value: 'A_NEGATIVO' },
    { label: 'B+', value: 'B_POSITIVO' },
    { label: 'B-', value: 'B_NEGATIVO' },
    { label: 'AB+', value: 'AB_POSITIVO' },
    { label: 'AB-', value: 'AB_NEGATIVO' },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      age: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
      weight: [null, [Validators.required, Validators.min(1), Validators.max(500)]],
      bornAt: [null, [Validators.required, pastDateValidator]],
      tipoSanguineo: [null],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.loadError = false;
    this.userService.getMe().subscribe({
      next: (user) => {
        this.patchUser(user);
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      },
    });
  }

  onSave(): void {
    if (this.profileForm.invalid || this.saving) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const v = this.profileForm.value;
    const payload: UpdateUserPayload = {
      name: v.name.trim(),
      email: v.email.trim(),
      age: Number(v.age),
      weight: Number(v.weight),
      bornAt: this.toLocalDateTimeIso(v.bornAt),
      tipoSanguineo: v.tipoSanguineo || null,
    };

    this.saving = true;
    this.userService.updateMe(payload).subscribe({
      next: (updated) => {
        this.patchUser(updated);
        this.saving = false;
        this.snackBar.open('Perfil atualizado com sucesso!', '✓', { duration: 3000 });
      },
      error: (err) => {
        this.saving = false;
        const msg =
          err?.status === 409
            ? 'Este e-mail já está em uso por outra conta.'
            : err?.error?.message || 'Erro ao atualizar perfil. Tente novamente.';
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  private patchUser(user: User): void {
    this.profileForm.patchValue({
      name: user.name ?? '',
      email: user.email ?? '',
      age: user.age ?? null,
      weight: user.weight ?? null,
      bornAt: user.bornAt ? new Date(user.bornAt) : null,
      tipoSanguineo: user.tipoSanguineo || null,
    });
    this.profileForm.markAsPristine();
  }

  private toLocalDateTimeIso(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}T00:00:00`;
  }
}
