import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  constructor() {}

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submitted = false;
  loading = false;
  errorMessage = '';


  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.form.value.email!).subscribe({
      next: () => {
        this.submitted = true;
        this.loading = false;
      },
      error: () => {
        // Mostra sucesso mesmo em erro (não revela se e-mail existe)
        this.submitted = true;
        this.loading = false;
      }
    });
  }
}
