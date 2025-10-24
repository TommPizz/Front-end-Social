import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from '../home/home';
import { AuthGuard } from './guards/guards-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent, 
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

    

