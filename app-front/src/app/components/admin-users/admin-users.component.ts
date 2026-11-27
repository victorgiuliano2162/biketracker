import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService, AdminUserResponse } from '../../services/admin/admin.service';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

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
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  users: AdminUserResponse[] = [];
  loading = true;
  error = false;
  displayedColumns = ['name', 'email', 'role', 'status', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
  }

  get currentUserId(): string | null {
    return this.authService.getCurrentUserId();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = false;
    this.adminService
      .listUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
    this.adminService
      .toggleActive(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.users = this.users.map((u) => (u.id === updated.id ? updated : u));
          const label = updated.active ? 'ativada' : 'desativada';
          this.notification.success(`Conta de ${updated.name} ${label}.`);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Erro ao alterar status da conta.';
          this.notification.error(msg);
        },
      });
  }

  deleteUser(user: AdminUserResponse): void {
    this.notification
      .confirm({
        title: 'Excluir usuário',
        message: `Excluir permanentemente a conta de "${user.name}" (${user.email})?`,
        confirmLabel: 'Excluir',
        destructive: true,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.adminService
          .deleteUser(user.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.users = this.users.filter((u) => u.id !== user.id);
              this.notification.success('Usuário excluído com sucesso.');
            },
            error: (err) => {
              const msg = err?.error?.message || 'Erro ao excluir usuário.';
              this.notification.error(msg);
            },
          });
      });
  }
}
