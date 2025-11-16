import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { PostDto } from '../dto/PostDto';
import { PostService } from '../../services/post-service';
import { LikeService } from '../../services/like-service';
import { Observable } from 'rxjs';
import { CommentoService } from '../../services/commento-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  // Signals esistenti
  posts = signal<PostDto[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  mieiLikeIds = signal<Set<number>>(new Set());
  likingInProgress = signal<Set<number>>(new Set());

  // Signals per i commenti
  nuoviCommenti = signal<Map<number, string>>(new Map());
  commentoInCaricamento = signal<Set<number>>(new Set());
  mostraCommenti = signal<Set<number>>(new Set());
  commentoInModifica = signal<number | null>(null);
  testoModifica = signal<string>('');
  mostraModaleEliminazione = signal<boolean>(false);
  commentoDaEliminare = signal<{postId: number, commentoId: number} | null>(null);

  constructor(
    private router: Router,
    private postService: PostService,
    public authService: AuthService,  
    private likeService: LikeService,
    private commentoService: CommentoService
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

  navigateToCreatePost(): void {
  this.router.navigate(['/crea-post']); 
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
        this.posts.update(posts =>
          posts.map(p =>
            p.id === postId
              ? { ...p, numeroLike: (p.numeroLike ?? 0) + (alreadyLiked ? -1 : 1) }
              : p
          )
        );

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

  // --- GESTIONE COMMENTI ---

  // Toggle visualizzazione commenti
  toggleCommenti(postId: number): void {
    this.mostraCommenti.update(set => {
      const ns = new Set(set);
      if (ns.has(postId)) {
        ns.delete(postId);
      } else {
        ns.add(postId);
      }
      return ns;
    });
  }

  // Verifica se i commenti sono visibili
  sonoCommentiVisibili(postId: number): boolean {
    return this.mostraCommenti().has(postId);
  }

  // Aggiungi commento
  aggiungiCommento(postId: number): void {
    const testo = this.nuoviCommenti().get(postId)?.trim();
    
    if (!testo || testo.length === 0) {
      console.warn('Testo commento vuoto');
      return;
    }

    if (testo.length > 500) {
      alert('Il commento non può superare i 500 caratteri');
      return;
    }

    this.commentoInCaricamento.update(set => new Set(set).add(postId));

    const form = {
      idPost: postId,
      testo: testo
    };

    this.commentoService.creaCommento(form).subscribe({
      next: (nuovoCommento) => {
        console.log('✅ Commento creato:', nuovoCommento);
        
        // Aggiorna il post con il nuovo commento
        this.posts.update(posts =>
          posts.map(p => {
            if (p.id === postId) {
              const commentiEsistenti = p.commenti || [];
              return {
                ...p,
                commenti: [...commentiEsistenti, nuovoCommento]
              };
            }
            return p;
          })
        );

        // Pulisci il campo di input
        this.nuoviCommenti.update(map => {
          const nm = new Map(map);
          nm.delete(postId);
          return nm;
        });
      },
      error: (err) => {
        console.error('❌ Errore creazione commento:', err);
        alert('Errore durante la creazione del commento');
      },
      complete: () => {
        this.commentoInCaricamento.update(set => {
          const ns = new Set(set);
          ns.delete(postId);
          return ns;
        });
      }
    });
  }

  // Aggiorna testo commento nel signal
  aggiornaTestoCommento(postId: number, testo: string): void {
    this.nuoviCommenti.update(map => {
      const nm = new Map(map);
      nm.set(postId, testo);
      return nm;
    });
  }

  // Ottieni testo commento dal signal
  getTestoCommento(postId: number): string {
    return this.nuoviCommenti().get(postId) || '';
  }

  // Verifica se il commento è in caricamento
  isCommentoInCaricamento(postId: number): boolean {
    return this.commentoInCaricamento().has(postId);
  }

  // Avvia modifica commento
  iniziaModificaCommento(commentoId: number, testoAttuale: string): void {
    this.commentoInModifica.set(commentoId);
    this.testoModifica.set(testoAttuale);
  }

  // Annulla modifica
  annullaModifica(): void {
    this.commentoInModifica.set(null);
    this.testoModifica.set('');
  }

  // Salva modifica commento
  salvaModificaCommento(postId: number, commentoId: number): void {
    const nuovoTesto = this.testoModifica().trim();
    
    if (!nuovoTesto || nuovoTesto.length === 0) {
      alert('Il testo del commento non può essere vuoto');
      return;
    }

    if (nuovoTesto.length > 500) {
      alert('Il commento non può superare i 500 caratteri');
      return;
    }

    const form = {
      idPost: postId,
      testo: nuovoTesto
    };

    this.commentoService.aggiornaCommento(commentoId, form).subscribe({
      next: (commentoAggiornato) => {
        console.log('✅ Commento aggiornato:', commentoAggiornato);
        
        // Aggiorna il post con il commento modificato
        this.posts.update(posts =>
          posts.map(p => {
            if (p.id === postId && p.commenti) {
              return {
                ...p,
                commenti: p.commenti.map(c =>
                  c.idCommento === commentoId ? commentoAggiornato : c
                )
              };
            }
            return p;
          })
        );

        this.annullaModifica();
      },
      error: (err) => {
        console.error('❌ Errore modifica commento:', err);
        alert('Errore durante la modifica del commento');
      }
    });
  }

  // Elimina commento - apre il modale di conferma
  eliminaCommento(postId: number, commentoId: number): void {
    this.apriModaleEliminazione(postId, commentoId);
  }

  // Verifica se l'utente può modificare/eliminare il commento
  possoModificareCommento(commento: any): boolean {
    const currentUsername = this.authService.getCurrentUsername();
    
    // Debug (rimuovi dopo aver verificato che funziona)
    console.log('🔍 Current username:', currentUsername);
    console.log('🔍 Comment author:', commento.utente);
    
    // L'utente può modificare se è il proprietario del commento
    return currentUsername === commento.utente?.username;
  }

  // --- Funzioni Helper esistenti ---
  hasLiked(postId: number): boolean {
    return this.mieiLikeIds().has(postId);
  }

  isLikingInProgress(postId: number): boolean {
    return this.likingInProgress().has(postId);
  }

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

  // Apri modale eliminazione
  apriModaleEliminazione(postId: number, commentoId: number): void {
    this.commentoDaEliminare.set({ postId, commentoId });
    this.mostraModaleEliminazione.set(true);
  }

  // Conferma eliminazione dal modale
  confermaEliminazioneCommento(): void {
    const dati = this.commentoDaEliminare();
    if (!dati) return;

    const { postId, commentoId } = dati;

    this.commentoService.eliminaCommento(commentoId).subscribe({
      next: () => {
        console.log('✅ Commento eliminato');
        
        // Rimuovi il commento dal post
        this.posts.update(posts =>
          posts.map(p => {
            if (p.id === postId && p.commenti) {
              return {
                ...p,
                commenti: p.commenti.filter(c => c.idCommento !== commentoId)
              };
            }
            return p;
          })
        );

        // Chiudi il modale
        this.chiudiModaleEliminazione();
      },
      error: (err) => {
        console.error('❌ Errore eliminazione commento:', err);
        alert('Errore durante l\'eliminazione del commento');
        this.chiudiModaleEliminazione();
      }
    });
  }

  // Annulla eliminazione
  chiudiModaleEliminazione(): void {
    this.mostraModaleEliminazione.set(false);
    this.commentoDaEliminare.set(null);
  }
}