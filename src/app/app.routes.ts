import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from '../home/home';
import { AuthGuard } from './guards/guards-guard';
import { Preview } from './preview/preview';
import { CreatePostComponent } from './crea-post/crea-post';
import { Registrazione } from './registrazione/registrazione';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },

  { path: 'registrazione', component: Registrazione },


  {
    path: 'preview',
    component: Preview,
  },

  { path: 'crea-post', 
    component: CreatePostComponent },

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

    

