import { Component } from '@angular/core';
import { 
  AbstractControl, 
  ReactiveFormsModule, 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ValidationErrors
 } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { User } from './../../classes/user.model';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm  = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm
    ? { passwordMismatch: true }
    : null;
}

function pastDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const selected = new Date(value);
  const today    = new Date();
  today.setHours(23, 59, 59, 999); // permite o dia atual
  return selected > today ? { futureDate: true } : null;
}

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
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})



export class CreateUserComponent {

  hidePassword = true;
  hideConfirm  = true;
 
  registerForm: FormGroup;
 
  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group(
     {
        name:            ['', [Validators.required, Validators.minLength(3)]],
        email:           ['', [Validators.required, Validators.email]],
        password:        ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
        confirmPassword: ['', Validators.required],
        age:             [null, [Validators.required, Validators.min(5), Validators.max(120)]],
        weight:          [null, [Validators.required, Validators.min(1)]],
        bornAt:          [null, [Validators.required, pastDateValidator]],
      },
      { validators: passwordMatchValidator }
    );
  }
 
  onRegister(): void {
    if (this.registerForm.invalid) return;
 
    const formValue = this.registerForm.value;
 
    const user = new User({
      name:      formValue.name,
      email:     formValue.email,
      password:  formValue.password,
      age:       formValue.age,
      weight:    formValue.weight,
      bornAt:    formValue.bornAt,
      createdAt: new Date(),
    });
 
    console.log('Usuário a cadastrar:', user);
    // Envie `user` para o seu serviço de autenticação/API aqui
  }
}
