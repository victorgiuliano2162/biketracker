import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommentResponse } from '../../../services/comment/comment.service';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-route-comments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    FormatDatePipe,
  ],
  template: `
    <section class="section-card comments-section">
      <div class="section-header">
        <h2 class="section-title">
          <mat-icon>chat_bubble_outline</mat-icon>
          <span>Comentários ({{ comments().length }})</span>
        </h2>
      </div>

      <form class="comment-form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="comment-field" subscriptSizing="dynamic">
          <textarea
            matInput
            [ngModel]="draft()"
            (ngModelChange)="draftChange.emit($event)"
            name="newComment"
            rows="2"
            maxlength="1000"
            placeholder="Escreva um comentário sobre esta rota..."
          ></textarea>
        </mat-form-field>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          class="comment-submit-btn"
          [disabled]="!draft().trim() || posting()"
        >
          {{ posting() ? 'Publicando...' : 'Publicar' }}
        </button>
      </form>

      @if (comments().length === 0) {
        <p class="comments-empty">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
      } @else {
        <div class="comments-list">
          @for (comment of comments(); track comment.id) {
            <article class="comment-item">
              <div class="comment-header">
                <div>
                  <strong class="comment-author">{{ comment.authorName }}</strong>
                  <span class="comment-date font-mono-tabular">
                    · {{ comment.createdAt | formatDate: 'long' }}
                  </span>
                </div>
                @if (canDelete()(comment)) {
                  <button
                    mat-icon-button
                    type="button"
                    (click)="deleteComment.emit(comment)"
                    matTooltip="Excluir comentário"
                    aria-label="Excluir comentário"
                  >
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                }
              </div>
              <p class="comment-content">{{ comment.content }}</p>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .section-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-hairline);
      border-radius: var(--radius-card);
      padding: 20px 24px;
      box-shadow: var(--shadow-card);
    }
    .section-header {
      margin-bottom: 16px;
    }
    .section-title {
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .section-title mat-icon {
      color: var(--accent-primary);
    }
    .comment-form {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .comment-field {
      flex: 1;
    }
    .comment-submit-btn {
      margin-top: 4px;
      white-space: nowrap;
    }
    .comments-empty {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .comment-item {
      padding: 12px 14px;
      border-radius: var(--radius-control);
      background-color: var(--bg-canvas);
      border: 1px solid var(--border-hairline);
    }
    .comment-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 6px;
    }
    .comment-author {
      font-size: 0.875rem;
      color: var(--text-primary);
    }
    .comment-date {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .comment-content {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--text-secondary);
      white-space: pre-line;
    }
    @media (max-width: 600px) {
      .comment-form {
        flex-direction: column;
      }
      .comment-submit-btn {
        width: 100%;
      }
    }
  `,
})
export class RouteCommentsComponent {
  readonly comments = input.required<CommentResponse[]>();
  readonly draft = input('');
  readonly posting = input(false);
  readonly canDelete = input<(c: CommentResponse) => boolean>(() => false);

  readonly draftChange = output<string>();
  readonly submitComment = output<void>();
  readonly deleteComment = output<CommentResponse>();

  onSubmit(): void {
    this.submitComment.emit();
  }
}
