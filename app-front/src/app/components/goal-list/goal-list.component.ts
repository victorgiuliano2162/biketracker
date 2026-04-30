import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GoalService, GoalResponse } from '../../services/goal/goal.service';
import { GoalEditDialogComponent } from '../goal-edit-dialog/goal-edit-dialog.component';

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
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './goal-list.component.html',
  styleUrl: './goal-list.component.css',
})
export class GoalListComponent implements OnInit {
  goals: GoalResponse[] = [];
  loading = true;
  deletingId: number | null = null;
  displayedColumns = ['name', 'progress', 'deadLine', 'actions'];

  constructor(
    private goalService: GoalService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.goalService.findAll().subscribe({
      next: (data) => {
        this.goals = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar metas.', 'OK', { duration: 3000 });
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

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.goalService.update(goal.id, result).subscribe({
        next: (updated) => {
          const idx = this.goals.findIndex((g) => g.id === goal.id);
          if (idx !== -1) this.goals[idx] = updated;
          this.goals = [...this.goals]; // trigger change detection
          this.snackBar.open('Meta atualizada!', '✓', { duration: 2500 });
        },
        error: () =>
          this.snackBar.open('Erro ao atualizar meta.', 'OK', {
            duration: 3000,
          }),
      });
    });
  }

  delete(goal: GoalResponse): void {
    this.deletingId = goal.id;
    this.goalService.delete(goal.id).subscribe({
      next: () => {
        this.goals = this.goals.filter((g) => g.id !== goal.id);
        this.deletingId = null;
        this.snackBar.open('Meta excluída.', '✓', { duration: 2500 });
      },
      error: () => {
        this.deletingId = null;
        this.snackBar.open('Erro ao excluir meta.', 'OK', { duration: 3000 });
      },
    });
  }
}
