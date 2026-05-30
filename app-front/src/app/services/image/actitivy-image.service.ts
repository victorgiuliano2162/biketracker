import { Injectable } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ActivityImageService {
  private readonly MAX_WIDTH = 1920;
  private readonly QUALITY = 0.82;

  constructor(private http: HttpClient) {}

  /**
   * Compresses and uploads a list of images for a given route ID.
   * Compression preserves aspect ratio, capping width at 1920px with 82% JPEG quality.
   */
  uploadImages(routeId: string, files: File[]): Observable<string[]> {
    return from(this.compressAll(files)).pipe(
      switchMap((compressed) => {
        const formData = new FormData();
        compressed.forEach((file) => formData.append('files', file));
        return this.http.post<string[]>(
          `/api/activities/${routeId}/images`,
          formData,
        );
      }),
    );
  }

  getPresignedUrls(routeId: string): Observable<string[]> {
    return this.http.get<string[]>(`/api/activities/${routeId}/images`);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private compressAll(files: File[]): Promise<File[]> {
    return Promise.all(files.map((f) => this.compress(f)));
  }

  private compress(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const { width, height } = this.dimensions(
          img.naturalWidth,
          img.naturalHeight,
        );

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // fallback: return original if canvas unavailable
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Keep original filename but ensure .jpg extension for compressed output
            const name = file.name.replace(/\.[^.]+$/, '.jpg');
            resolve(new File([blob], name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          this.QUALITY,
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to load image: ${file.name}`));
      };

      img.src = url;
    });
  }

  /** Returns dimensions preserving aspect ratio, capping width at MAX_WIDTH. */
  private dimensions(
    naturalWidth: number,
    naturalHeight: number,
  ): { width: number; height: number } {
    if (naturalWidth <= this.MAX_WIDTH) {
      return { width: naturalWidth, height: naturalHeight };
    }
    const ratio = naturalHeight / naturalWidth;
    return {
      width: this.MAX_WIDTH,
      height: Math.round(this.MAX_WIDTH * ratio),
    };
  }
}
