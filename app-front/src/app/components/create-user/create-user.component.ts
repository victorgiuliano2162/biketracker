import { UserService } from '../../services/user/user.service';
import { Component } from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter, MatOption } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { User } from './../../classes/user.model';
import { MatDialog } from '@angular/material/dialog';
import { SuccessdialogComponent } from '../successdialog/successdialog.component';
import { MatSelectModule } from '@angular/material/select';


function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm
    ? { passwordMismatch: true }
    : null;
}

function pastDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const selected = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // permite o dia atual
  return selected > today ? { futureDate: true } : null;
}

const tipoSanguineo = [
  { label: 'O+', value: 'O+' },
  { label: 'A+', value: 'A+' },
  { label: 'B+', value: 'B+' },
  { label: 'O-', value: 'O-' },
  { label: 'A-', value: 'A+' },
  { label: 'AB+', value: 'AB+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB-', value: 'AB-' },
];

@Component({
  selector: 'app-create-user',
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatOption,
    MatSelectModule
],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css',
})
export class CreateUserComponent {
  hidePassword = true;
  hideConfirm = true;
  
  tiposSanguineos = Object.values(tipoSanguineo);

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
        age: [
          null,
          [Validators.required, Validators.min(5), Validators.max(120)],
        ],
        weight: [null, [Validators.required, Validators.min(1)]],
        bornAt: [null, [Validators.required, pastDateValidator]],
        tipoSanguineo: ['', Validators.required],
      },
      { validators: passwordMatchValidator },
    );
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;

    const formValue = this.registerForm.value;

    const user = new User({
      name: formValue.name,
      email: formValue.email,
      password: formValue.password,
      age: formValue.age,
      weight: formValue.weight,
      bornAt: formValue.bornAt,
      createdAt: new Date(),
      tipoSanguineo: formValue.tipoSanguineo,
    });

    console.log(user);
    this.userService.create(user).subscribe({
      next: (createdUser) => {
        const dialogRef = this.dialog.open(SuccessdialogComponent, {
          width: '360px',
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        console.error('Erro ao criar usuário:', err);
      },
    });
  }
}
