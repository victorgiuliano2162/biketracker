import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GoalService, GoalResponse } from '../../services/goal/goal.service';
import { GoalEditDialogComponent } from '../goal-edit-dialog/goal-edit-dialog.component';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './goal-list.component.html',
  styleUrl: './goal-list.component.css',
})
export class GoalListComponent implements OnInit {
  private readonly goalService = inject(GoalService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  goals: GoalResponse[] = [];
  loading = true;
  deletingId: number | null = null;
  displayedColumns = ['name', 'progress', 'deadLine', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.goalService
      .findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.goals = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.notification.error('Erro ao carregar metas.');
        },
      });
  }

  isExpired(deadLine: string): boolean {
    return !!deadLine && new Date(deadLine) < new Date();
  }

  edit(goal: GoalResponse): void {
    const ref = this.dialog.open(GoalEditDialogComponent, {
      data: goal,
      width: '480px',
      autoFocus: 'dialog',
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) return;
        this.goalService
          .update(goal.id, result)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (updated) => {
              const idx = this.goals.findIndex((g) => g.id === goal.id);
              if (idx !== -1) this.goals[idx] = updated;
              this.goals = [...this.goals];
              this.notification.success('Meta atualizada!', 2500);
            },
            error: () => this.notification.error('Erro ao atualizar meta.'),
          });
      });
  }

  delete(goal: GoalResponse): void {
    this.notification
      .confirm({
        title: 'Excluir meta',
        message: `Excluir a meta "${goal.name}"?`,
        confirmLabel: 'Excluir',
        destructive: true,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.deletingId = goal.id;
        this.goalService
          .delete(goal.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.goals = this.goals.filter((g) => g.id !== goal.id);
              this.deletingId = null;
              this.notification.success('Meta excluída.', 2500);
            },
            error: () => {
              this.deletingId = null;
              this.notification.error('Erro ao excluir meta.');
            },
          });
      });
  }
}
