import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { PostDto } from '../dto/PostDto';
import { PostService } from '../../services/post-service';
import { LikeService } from '../../services/like-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  // Signals per Zoneless change detection
  posts = signal<PostDto[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  mieiLikeIds = signal<Set<number>>(new Set());
  likingInProgress = signal<Set<number>>(new Set());

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private likeService: LikeService
  ) { 
    console.log('🏗️ HomeComponent constructor chiamato');
  }

  ngOnInit(): void {
    console.log('🚀 ngOnInit chiamato - inizio caricamento post e like');
    this.loadPosts();
    this.loadMieiLike();
  }

  logout(): void {
    this.authService.logout();
  }

  // --- Caricamento Post ---
  loadPosts(): void {
    this.loading.set(true);
    this.error.set('');

    this.postService.getAllPosts().subscribe({
      next: (data) => {
        this.posts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Impossibile caricare i post: ' + (err.message || 'Errore sconosciuto'));
        this.loading.set(false);
      }
    });
  }

  // --- Caricamento dei like dell'utente ---
  loadMieiLike(): void {
    console.log('⭐ Caricamento dei miei like...');
    this.likeService.getMieiLike().subscribe({
      next: (response: any) => {
        let lista = Array.isArray(response)
          ? response
          : Array.isArray(response.content)
            ? response.content
            : [];

        // Converto eventuali stringhe in numeri
        const likeIds = new Set<number>(lista.map((like: any) => Number(like.idPost)));
        this.mieiLikeIds.set(likeIds);
        console.log("✔️ Set dei like aggiornato:", Array.from(likeIds));
      },
      error: (err: any) => {
        console.error("❌ Errore nel caricamento dei like:", err);
      }
    });
  }

  // --- Toggle Like ---
  toggleLike(post: PostDto): void {
    const postId = post.id;

    if (this.isLikingInProgress(postId)) return;

    this.likingInProgress.update(set => new Set(set).add(postId));

    const alreadyLiked = this.hasLiked(postId);

    const action$: Observable<any> = alreadyLiked
      ? this.likeService.rimuoviLike(postId)
      : this.likeService.creaLike(postId);

    action$.subscribe({
      next: () => {
        // Aggiorna il numero di like sul post
        this.posts.update(posts =>
          posts.map(p =>
            p.id === postId
              ? { ...p, numeroLike: (p.numeroLike ?? 0) + (alreadyLiked ? -1 : 1) }
              : p
          )
        );

        // Aggiorna i miei like
        this.mieiLikeIds.update(set => {
          const ns = new Set(set);
          if (alreadyLiked) ns.delete(postId);
          else ns.add(postId);
          return ns;
        });
      },
      error: (err: any) => {
        console.error("❌ Errore toggle like:", err);
      },
      complete: () => {
        this.likingInProgress.update(set => {
          const ns = new Set(set);
          ns.delete(postId);
          return ns;
        });
      }
    });
  }

  // --- Funzioni Helper per template ---
  hasLiked(postId: number): boolean {
    return this.mieiLikeIds().has(postId);
  }

  isLikingInProgress(postId: number): boolean {
    return this.likingInProgress().has(postId);
  }

  // --- Formattazione data ---
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

trackByPostId(index: number, post: PostDto) {
  return post.id;
}

trackByCommentId(index: number, commento: any) {
  return commento.idCommento;
}

}
