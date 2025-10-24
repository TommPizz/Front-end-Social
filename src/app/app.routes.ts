import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from '../home/home';
import { AuthGuard } from './guards/guards-guard';
import { Preview } from './preview/preview';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'preview',
    component: Preview,
  },

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'preview'
  }
];

    

