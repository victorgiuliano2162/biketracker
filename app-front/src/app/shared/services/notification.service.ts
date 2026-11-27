import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map } from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../ui/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  success(message: string, duration = 3000): void {
    this.snackBar.open(message, '✓', { duration });
  }

  error(message: string, duration = 3500): void {
    this.snackBar.open(message, 'OK', { duration });
  }

  info(message: string, action = 'OK', duration = 3000): void {
    this.snackBar.open(message, action, { duration });
  }

  confirm(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
        ConfirmDialogComponent,
        {
          data,
          width: '420px',
          maxWidth: '94vw',
          autoFocus: 'dialog',
        },
      )
      .afterClosed()
      .pipe(map((confirmed) => Boolean(confirmed)));
  }
}
