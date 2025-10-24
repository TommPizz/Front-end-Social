import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../app/services/auth';


@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {

  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    // La navigazione alla login è già gestita dentro authService.logout()
  }
}
