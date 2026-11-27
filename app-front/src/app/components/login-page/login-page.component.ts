import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth/auth.service';
import { AuthShellComponent } from '../../shared/ui/auth-shell/auth-shell.component';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    AuthShellComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  email = '';
  password = '';
  hidePassword = true;
  errorMessage = '';

  isValid(): boolean {
    return this.email.trim() !== '' && this.password.trim() !== '';
  }

  onLogin(): void {
    if (!this.email || !this.password) return;

    this.errorMessage = '';

    this.authService
      .login({ email: this.email, password: this.password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          setTimeout(() => this.router.navigate(['/home']), 150);
        },
        error: (err) => {
          this.errorMessage =
            err.status === 401
              ? 'E-mail ou senha incorretos.'
              : 'Erro ao realizar login. Tente novamente.';
          this.notification.error(this.errorMessage);
          this.password = '';
        },
      });
  }

  onRegister(): void {
    this.router.navigate(['/subscribe']);
  }
}
