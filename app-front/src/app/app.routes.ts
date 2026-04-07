import { Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { authGuard, publicGuard } from './guards/Auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login-page/login-page.component').then((m) => m.LoginPageComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'subscribe',
    loadComponent: () =>
      import('./components/create-user/create-user.component').then(
        (m) => m.CreateUserComponent,
      ),
    canActivate: [publicGuard],
  },

  // redireciona para login se não autenticado
  {
    path: 'home',
    loadComponent: () =>
        import('./components/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
