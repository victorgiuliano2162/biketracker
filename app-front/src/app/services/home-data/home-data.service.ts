import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface RideSummary {
  id: number;
  distanceInKm: number;
  elevationInMeters: number;
  activityTimeInSeconds: number;
  startTime: string;
}
 
export interface DailyDistance {
  date: string;
  distanceKm: number;
}
 
export interface GoalSummary {
  id: number;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  progressPercent: number;
  unit: string;
  deadLine: string;
}
 
export interface HomeStats {
  totalDistanceKm: number;
  totalElevationMeters: number;
  totalActivitySeconds: number;
  totalRides: number;
  recentRides: RideSummary[];
  weeklyChart: DailyDistance[];
  activeGoals: GoalSummary[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeDataService {

  private readonly apiUrl = '/api/home';

  constructor(private http: HttpClient) { }

    getStats(): Observable<HomeStats> {
    return this.http.get<HomeStats>(`${this.apiUrl}/stats`);
  }

}
