import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  email: string = '';
  password: string = '';
  hidePassword: boolean = true;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if (!this.email || !this.password) return;

    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => { 
        console.log('Login token:', this.authService.getAccessToken());
        this.router.navigate(['/home'])
      },
      error: (err) => {
        this.errorMessage = err.status === 401
          ? 'E-mail ou senha incorretos.'
          : 'Erro ao realizar login. Tente novamente.';
      }
    });
  }

  onRegister(): void {
    this.router.navigate(['/subscribe']);
  }
}