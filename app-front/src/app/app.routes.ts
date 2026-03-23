import { Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { CreateUserComponent } from './components/create-user/create-user.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginPageComponent,
    },
    {
        path: 'subscribe',
        component: CreateUserComponent
    },
];
