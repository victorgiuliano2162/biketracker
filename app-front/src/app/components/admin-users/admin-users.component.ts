import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService, AdminUserResponse } from '../../services/admin/admin.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit {
  users: AdminUserResponse[] = [];
  loading = true;
  error = false;
  displayedColumns = ['name', 'email', 'role', 'status', 'actions'];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get currentUserId(): string | null {
    return this.authService.getCurrentUserId();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = false;
    this.adminService.listUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  toggleActive(user: AdminUserResponse): void {
    this.adminService.toggleActive(user.id).subscribe({
      next: (updated) => {
        this.users = this.users.map((u) => (u.id === updated.id ? updated : u));
        const label = updated.active ? 'ativada' : 'desativada';
        this.snackBar.open(`Conta de ${updated.name} ${label}.`, '✓', { duration: 3000 });
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erro ao alterar status da conta.';
        this.snackBar.open(msg, 'OK', { duration: 3500 });
      },
    });
  }

  deleteUser(user: AdminUserResponse): void {
    if (!confirm(`Excluir permanentemente a conta de "${user.name}" (${user.email})?`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== user.id);
        this.snackBar.open('Usuário excluído com sucesso.', '✓', { duration: 3000 });
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erro ao excluir usuário.';
        this.snackBar.open(msg, 'OK', { duration: 3500 });
      },
    });
  }
}
