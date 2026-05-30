import { Routes } from '@angular/router';
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
      import('./components/create-user/create-user.component').then((m) => m.CreateUserComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'map',
    loadComponent: () =>
      import('./components/map/map.component').then((m) => m.MapComponent),
    canActivate: [authGuard],
  },
  {
    path: 'routes',
    loadComponent: () =>
      import('./components/my-routes/my-routes.component').then((m) => m.MyRoutesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'routes/:id',
    loadComponent: () =>
      import('./components/route-detail/route-detail.component').then((m) => m.RouteDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'goals',
    loadComponent: () =>
      import('./components/goal-list/goal-list.component').then((m) => m.GoalListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'goal',
    loadComponent: () =>
      import('./components/goal/goal.component').then((m) => m.GoalComponent),
    canActivate: [authGuard],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];