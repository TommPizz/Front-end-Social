import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostDto } from '../app/dto/PostDto';
import { AuthService } from '../app/services/auth';
import { PostService } from '../app/services/post-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  posts: PostDto[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    console.log('🏠 HomeComponent inizializzato');
    this.loadAllPosts();
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToCreatePost(): void {
    this.router.navigate(['/crea-post']);
  }

  loadAllPosts(): void {
    console.log('🔄 Caricamento posts...');
    this.isLoading = true;
    this.errorMessage = '';

    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        console.log('✅ Posts ricevuti:', posts);
        
        // 🔥 SOLUZIONE: USA setTimeout per forzare il ciclo di change detection
        setTimeout(() => {
          this.posts = posts;
          this.isLoading = false;
          console.log('✅ Posts assegnati dopo timeout:', this.posts.length);
        }, 0);
      },
      error: (error) => {
        console.error('❌ Errore caricamento posts:', error);
        this.errorMessage = 'Errore nel caricamento dei post. Riprova più tardi.';
        this.isLoading = false;
      }
    });
  }
}