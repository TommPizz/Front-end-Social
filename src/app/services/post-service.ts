import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostDto } from '../dto/PostDto';
import { PostFormDto } from '../dto/PostFormDto';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  // USA /api/post (SINGOLARE) come nel backend
  private apiUrl = 'http://localhost:8080/api/post';

  constructor(private http: HttpClient) {
    console.log('🔧 PostService inizializzato con URL:', this.apiUrl);
  }

  /**
   * Crea un nuovo post (con auth)
   */
  createPost(postForm: PostFormDto): Observable<PostDto> {
    console.log('📝 Creazione post con dati:', postForm);
    const headers = this.getAuthHeaders();
    return this.http.post<PostDto>(this.apiUrl, postForm, { headers });
  }

  /**
   * Recupera tutti i post (SENZA auth per testare)
   */
  getAllPosts(): Observable<PostDto[]> {

    
    // Se funziona, poi prova CON headers:
    const headers = this.getAuthHeaders();
    return this.http.get<PostDto[]>(this.apiUrl, { headers });
  }

  /**
   * Ottiene gli headers con il token JWT
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('🔐 Token in localStorage:', token ? 'PRESENTE' : 'ASSENTE');
    
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    } else {
      console.warn('⚠️ Nessun token trovato in localStorage');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
  }
}