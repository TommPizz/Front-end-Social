import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostDto } from '../components/dto/PostDto';


@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8080/api/post';

  constructor(private http: HttpClient) {}

  // Ottiene tutti i post
  getAllPosts(): Observable<PostDto[]> {
    return this.http.get<PostDto[]>(this.apiUrl);
  }

  // Ottiene post per ID
  getPostById(id: number): Observable<PostDto> {
    return this.http.get<PostDto>(`${this.apiUrl}/${id}`);
  }

  // Ottiene tutti i post di un utente
  getAllPostsByUtente(idUtente: number): Observable<PostDto[]> {
    return this.http.get<PostDto[]>(`${this.apiUrl}/all/${idUtente}`);
  }

  // Ottiene i post in tendenza
  getTendenze(limit: number = 10): Observable<PostDto[]> {
    return this.http.get<PostDto[]>(`${this.apiUrl}/tendenze?limit=${limit}`);
  }

  // Crea un nuovo post
  createPost(contenuto: string): Observable<PostDto> {
    return this.http.post<PostDto>(this.apiUrl, { contenuto });
  }

  // Aggiorna un post
  updatePost(id: number, contenuto: string): Observable<PostDto> {
    return this.http.put<PostDto>(this.apiUrl, { id, contenuto });
  }

  // Elimina un post
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/elimina/${id}`);
  }
}