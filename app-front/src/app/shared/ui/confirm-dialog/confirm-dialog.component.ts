import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-wrap">
      <div class="confirm-header">
        @if (data.destructive) {
          <span class="confirm-icon confirm-icon--danger">
            <mat-icon>warning_amber</mat-icon>
          </span>
        }
        <h2 mat-dialog-title class="confirm-title">{{ data.title }}</h2>
      </div>

      <mat-dialog-content class="confirm-message">
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="confirm-actions">
        <button mat-stroked-button type="button" (click)="close(false)">
          {{ data.cancelLabel ?? 'Cancelar' }}
        </button>
        <button
          mat-flat-button
          type="button"
          [color]="data.destructive ? 'warn' : 'primary'"
          (click)="close(true)"
        >
          {{ data.confirmLabel ?? 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .confirm-wrap {
      padding: 4px;
    }
    .confirm-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px 0;
    }
    .confirm-icon--danger {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-error-bg);
      color: var(--color-error);
    }
    .confirm-title {
      margin: 0;
      padding: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .confirm-message p {
      margin: 8px 0 0;
      color: var(--text-secondary);
      line-height: 1.55;
    }
    .confirm-actions {
      gap: 8px;
      padding: 12px 20px 16px;
    }
  `,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);

  close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
