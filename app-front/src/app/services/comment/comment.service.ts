import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CommentResponse {
  id: number;
  routeId: string;
  authorId: string;
  authorName: string;
  content: string;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(private http: HttpClient) {}

  list(routeId: string): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(`/api/routes/${routeId}/comments`);
  }

  create(routeId: string, content: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`/api/routes/${routeId}/comments`, {
      content,
    });
  }

  delete(routeId: string, commentId: number): Observable<void> {
    return this.http.delete<void>(`/api/routes/${routeId}/comments/${commentId}`);
  }
}
