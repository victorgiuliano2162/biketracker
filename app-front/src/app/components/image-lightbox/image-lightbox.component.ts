import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface LightboxData {
  urls: string[];
  index: number;
}

@Component({
  selector: 'app-image-lightbox',
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: './image-lightbox.component.html',
  styles: './image-lightbox.component.css',
})
export class ImageLightboxComponent {
  current: number;

  constructor(
    public dialogRef: MatDialogRef<ImageLightboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LightboxData,
  ) {
    this.current = data.index;
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft') this.prev();
    else if (e.key === 'ArrowRight') this.next();
    else if (e.key === 'Escape') this.close();
  }

  prev(): void {
    if (this.current > 0) this.current--;
  }
  next(): void {
    if (this.current < this.data.urls.length - 1) this.current++;
  }
  close(): void {
    this.dialogRef.close();
  }
}
