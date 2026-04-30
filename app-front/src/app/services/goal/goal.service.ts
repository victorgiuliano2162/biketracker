import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GoalRequest {
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  deadLine: string; // yyyy-MM-dd
}

export interface GoalResponse {
  id: number;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  progressPercent: number;
  unit: string;
  createdAt: string;
  deadLine: string;
}

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly base = '/api/goal';

  constructor(private http: HttpClient) {}

  create(goals: GoalRequest[]): Observable<GoalResponse[]> {
    return this.http.post<GoalResponse[]>(this.base, goals);
  }

  findAll(): Observable<GoalResponse[]> {
    return this.http.get<GoalResponse[]>(this.base);
  }

  update(id: number, goal: Partial<GoalRequest>): Observable<GoalResponse> {
    return this.http.put<GoalResponse>(`${this.base}/${id}`, goal);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}