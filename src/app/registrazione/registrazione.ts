import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  erroriBackend: any = {}; 
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      codiceFiscale: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    this.erroriBackend = {};
    this.errorMessage = null;

    const request: RegistrazioneRequest = this.form.value;

    this.authService.register(request).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        console.log('Errore completo:', err);
        console.log('err.error:', err.error);
        
        if (err?.error?.errori) {
          this.erroriBackend = err.error.errori;
          console.log('Errori backend assegnati:', this.erroriBackend);
          this.cdr.detectChanges(); 
        } else if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Errore durante la registrazione';
        }
      }
    });
  }

  getErrore(campo: string): string | null {
    // 1️ Errori backend
    if (this.erroriBackend && this.erroriBackend[campo]) {
      return this.erroriBackend[campo];
    }
    
    // 2 Errori form Angular
    const control = this.form.get(campo);
    if (control && control.invalid && control.touched) {
      if (control.errors?.['required']) {
        return 'Questo campo è obbligatorio';
      }
      if (control.errors?.['minlength']) {
        const min = control.errors['minlength'].requiredLength;
        return `Minimo ${min} caratteri`;
      }
      if (control.errors?.['maxlength']) {
        const max = control.errors['maxlength'].requiredLength;
        return `Massimo ${max} caratteri`;
      }
    }
    
    return null;
  }
}
