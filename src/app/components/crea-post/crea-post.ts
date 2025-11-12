import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostDto } from '../dto/PostDto';

import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post-service';

@Component({
  selector: 'app-create-post',
  standalone: true, // <-- Componente standalone
  imports: [CommonModule, ReactiveFormsModule], // <-- Importa ReactiveFormsModule qui
  templateUrl: './crea-post.html',
  styleUrls: ['./crea-post.css']
})
export class CreatePostComponent {
  postForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  characterCount = 0;
  maxCharacters = 1000;

  @Output() postCreated = new EventEmitter<PostDto>();

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      contenuto: ['', [
        Validators.required,
        Validators.maxLength(this.maxCharacters)
      ]]
    });

    this.postForm.get('contenuto')?.valueChanges.subscribe(value => {
      this.characterCount = value ? value.length : 0;
    });
  }

  get contenuto() {
    return this.postForm.get('contenuto');
  }

  get isOverLimit(): boolean {
    return this.characterCount > this.maxCharacters;
  }

  get remainingCharacters(): number {
    return this.maxCharacters - this.characterCount;
  }

  get characterCountColor(): string {
    if (this.isOverLimit) {
      return 'text-danger';
    } else if (this.remainingCharacters <= 100) {
      return 'text-warning';
    } else {
      return 'text-muted';
    }
  }

  onSubmit(): void {
    if (this.postForm.invalid || this.isOverLimit) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.postService.createPost(this.postForm.value).subscribe({
      next: (response: PostDto) => {
        this.successMessage = 'Post creato con successo!';
        this.postCreated.emit(response);
        this.postForm.reset();
        this.characterCount = 0;
        this.isSubmitting = false;
        
        // 🔥 MODIFICA: Torna alla home SUBITO senza aspettare
        console.log('✅ Post creato, ritorno alla home...');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Errore durante la creazione del post. Riprova più tardi.';
        console.error('Errore creazione post:', error);
      }
    });
  }

  onCancel(): void {
    this.postForm.reset();
    this.characterCount = 0;
    this.errorMessage = '';
    this.successMessage = '';
    this.router.navigate(['/home']);
  }

  onBack(): void {
    this.router.navigate(['/home']);
  }
}