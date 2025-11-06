import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { RegistrazioneRequest } from '../dto/RegistrazioneRequest';

@Component({
  selector: 'app-registrazione',
  standalone: true, 
  templateUrl: './registrazione.html',
  styleUrls: ['./registrazione.css'],
  imports: [CommonModule, ReactiveFormsModule], 
})
export class Registrazione implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

ngOnInit(): void {
  this.form = this.fb.group({
    nome: ['', Validators.required],
    cognome: ['', Validators.required],
    username: ['', [Validators.required]], 
    password: ['', Validators.required],
    codiceFiscale: ['', Validators.required]
  });
}


  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;

    const request: RegistrazioneRequest = this.form.value;

    this.authService.register(request).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Errore durante la registrazione';
      }
    });
  }
}
