import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { AuthService } from '../../services/auth';
import { PostDto } from '../dto/PostDto';
import { PostService } from '../../services/post-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  // Usa signals invece di variabili normali per zoneless change detection
  posts = signal<PostDto[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

constructor(
  private postService: PostService,
  private authService: AuthService
)
{ 
  console.log('🏗️ HomeComponent constructor chiamato');
}

  ngOnInit(): void {
    console.log('🚀 ngOnInit chiamato - inizio caricamento post');
    this.loadPosts();
  }

  logout(): void {
  this.authService.logout();
}


  loadPosts(): void {
    console.log('📡 loadPosts() chiamato');
    this.loading.set(true);
    this.error.set('');
    
    console.log('🌐 Tentativo di chiamata API verso:', 'http://localhost:8080/api/post');
    
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        console.log('✅ Dati ricevuti dal server:', data);
        console.log('📊 Numero di post ricevuti:', data.length);
        this.posts.set(data);
        this.loading.set(false);
        console.log('✔️ Loading impostato a false, posts:', this.posts());
      },
      error: (err) => {
        console.error('❌ ERRORE dettagliato:', err);
        console.error('📍 Status:', err.status);
        console.error('📝 Message:', err.message);
        console.error('🔗 URL:', err.url);
        this.error.set('Impossibile caricare i post: ' + (err.message || 'Errore sconosciuto'));
        this.loading.set(false);
        console.log('❌ Loading impostato a false dopo errore');
      },
      complete: () => {
        console.log('✔️ Observable completato');
      }
    });
    
    console.log('⏳ Subscribe chiamato, in attesa risposta...');
  }

  // Metodo per formattare la data
  formatDate(dataOra: string): string {
    try {
      const date = new Date(dataOra);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Errore formattazione data:', e);
      return dataOra;
    }
  }

  
}


