import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  readonly isLoading = signal(false);
 
  private activeRequests = 0;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly MIN_DISPLAY_MS = 500;
 
  show(): void {
    this.activeRequests++;
 
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
 
    this.isLoading.set(true);
  }
 
  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
 
    if (this.activeRequests === 0) {
      // Garante o tempo mínimo de exibição de 500ms
      this.hideTimeout = setTimeout(() => {
        this.isLoading.set(false);
        this.hideTimeout = null;
      }, this.MIN_DISPLAY_MS);
    }
  }
}