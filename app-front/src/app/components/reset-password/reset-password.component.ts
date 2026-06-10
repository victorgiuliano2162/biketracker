import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {

   private fb = inject(FormBuilder);
  private authService = inject(AuthService);
 
    private route = inject(ActivatedRoute);
    private router = inject(Router);

   form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordsMatch });

  token = '';
  loading = false;
  success = false;
  errorMessage = '';

  constructor(
    
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.errorMessage = 'Link inválido. Solicite um novo link de recuperação.';
    }
  }

  passwordsMatch(control: AbstractControl) {
    const pw = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return pw === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.token, this.form.value.newPassword!).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message ?? '';
        if (msg.includes('expirado')) {
          this.errorMessage = 'Este link expirou. Solicite um novo.';
        } else if (msg.includes('utilizado')) {
          this.errorMessage = 'Este link já foi usado. Solicite um novo.';
        } else {
          this.errorMessage = 'Link inválido. Solicite um novo link de recuperação.';
        }
      }
    });
  }
}
