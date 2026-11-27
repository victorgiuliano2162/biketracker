import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  input,
  output,
} from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
} from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlatRouteNode, RouteNode } from '../map.models';

@Component({
  selector: 'app-map-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <aside class="sidebar" [class.open]="open()">
      <div class="sidebar-header">
        <div class="sidebar-header-left">
          <mat-icon class="sidebar-header-icon">layers</mat-icon>
          <span class="sidebar-title">Camadas GPX</span>
        </div>
        <button
          mat-icon-button
          matTooltip="Limpar seleção"
          (click)="clearAll.emit()"
          class="sidebar-clear-btn"
          aria-label="Limpar seleção"
        >
          <mat-icon>layers_clear</mat-icon>
        </button>
      </div>

      <div class="sidebar-body">
        <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="route-tree">
          <mat-tree-node *matTreeNodeDef="let node; when: hasChild" matTreeNodePadding>
            <div class="group-row">
              <button mat-icon-button matTreeNodeToggle class="group-toggle" aria-label="Expandir grupo">
                <mat-icon>{{ treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right' }}</mat-icon>
              </button>
              <span class="group-label">{{ node.name }}</span>
              <span class="group-count font-mono-tabular">{{ node.children?.length ?? 0 }}</span>
            </div>
          </mat-tree-node>

          <mat-tree-node *matTreeNodeDef="let node; when: isLeaf" matTreeNodePadding>
            <div class="route-row" [class.route-row--active]="isSelected(node)">
              <span class="route-color-bar" [style.background]="node.color"></span>

              <mat-checkbox
                class="route-checkbox"
                [checked]="isSelected(node)"
                (change)="toggleRoute.emit(node)"
              ></mat-checkbox>

              <span class="route-label" [title]="node.name">{{ node.name }}</span>

              <div class="route-actions">
                @if (!node.isSaved && node.coordinates) {
                  <button
                    mat-icon-button
                    class="action-btn action-btn--save"
                    matTooltip="Salvar rota"
                    [disabled]="savingRouteId() === node.id"
                    (click)="onSave(node, $event)"
                  >
                    @if (savingRouteId() === node.id) {
                      <mat-spinner diameter="16" />
                    } @else {
                      <mat-icon>cloud_upload</mat-icon>
                    }
                  </button>
                }

                @if (node.isSaved) {
                  <mat-icon class="saved-badge" matTooltip="Rota salva">cloud_done</mat-icon>
                }

                <button
                  mat-icon-button
                  class="action-btn action-btn--delete"
                  matTooltip="Excluir rota"
                  (click)="onDelete(node, $event)"
                >
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            </div>
          </mat-tree-node>
        </mat-tree>

        @if (isEmpty()) {
          <div class="sidebar-empty">
            <div class="empty-icon">
              <mat-icon>map</mat-icon>
            </div>
            <span>Nenhuma rota carregada</span>
          </div>
        }
      </div>
    </aside>
  `,
  styles: `
    .sidebar {
      position: absolute;
      top: 16px;
      left: 16px;
      bottom: 16px;
      width: 310px;
      max-width: calc(100vw - 32px);
      background: var(--bg-hud);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border-hairline);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-whisper);
      display: flex;
      flex-direction: column;
      z-index: 900;
      transform: translateX(calc(-100% - 24px));
      transition: transform 240ms var(--ease-spring);
      overflow: hidden;
    }
    .sidebar.open {
      transform: translateX(0);
    }
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-hairline);
    }
    .sidebar-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sidebar-header-icon {
      color: var(--accent-primary);
    }
    .sidebar-title {
      font-weight: 700;
      font-size: 0.9375rem;
      color: var(--text-primary);
    }
    .sidebar-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    .route-tree {
      background: transparent;
    }
    .group-row {
      display: flex;
      align-items: center;
      gap: 4px;
      width: 100%;
    }
    .group-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-secondary);
      flex: 1;
    }
    .group-count {
      font-size: 0.75rem;
      color: var(--text-muted);
      padding-right: 6px;
    }
    .route-row {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      padding: 4px 6px;
      border-radius: 8px;
    }
    .route-row--active {
      background-color: var(--accent-tint);
    }
    .route-color-bar {
      width: 4px;
      height: 22px;
      border-radius: 999px;
      flex-shrink: 0;
    }
    .route-label {
      flex: 1;
      min-width: 0;
      font-size: 0.8125rem;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .route-actions {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .saved-badge {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--accent-primary);
      margin-right: 4px;
    }
    .sidebar-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 36px 16px;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
  `,
})
export class MapSidebarComponent implements OnChanges {
  readonly open = input(false);
  readonly treeData = input.required<RouteNode[]>();
  readonly selectedIds = input.required<ReadonlySet<string>>();
  readonly savingRouteId = input<string | null>(null);
  readonly isEmpty = input(true);

  readonly toggleRoute = output<FlatRouteNode>();
  readonly saveRoute = output<FlatRouteNode>();
  readonly deleteRoute = output<FlatRouteNode>();
  readonly clearAll = output<void>();

  private readonly transformer = (node: RouteNode, level: number): FlatRouteNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level,
    id: node.id,
    coordinates: node.coordinates,
    elevations: node.elevations,
    color: node.color,
    isSaved: node.isSaved,
    savedId: node.savedId,
  });

  readonly treeControl = new FlatTreeControl<FlatRouteNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  private readonly treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  readonly dataSource = new MatTreeFlatDataSource(
    this.treeControl,
    this.treeFlattener,
  );

  readonly hasChild = (_: number, node: FlatRouteNode) => node.expandable;
  readonly isLeaf = (_: number, node: FlatRouteNode) => !node.expandable;

  ngOnChanges(): void {
    this.dataSource.data = this.treeData();
    this.treeControl.expandAll();
  }

  isSelected(node: FlatRouteNode): boolean {
    return !!node.id && this.selectedIds().has(node.id);
  }

  onSave(node: FlatRouteNode, event: MouseEvent): void {
    event.stopPropagation();
    this.saveRoute.emit(node);
  }

  onDelete(node: FlatRouteNode, event: MouseEvent): void {
    event.stopPropagation();
    this.deleteRoute.emit(node);
  }
}
