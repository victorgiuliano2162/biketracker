import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export type AuthBadgeVariant = 'hard' | 'moderate' | 'expert';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, MatIconModule],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.css',
})
export class AuthShellComponent {
  readonly coordsLabel = input("CARTOGRAFIA GPX V4.2 · S 23°14' W 46°58'");
  readonly badgeLabel = input('HARD');
  readonly badgeVariant = input<AuthBadgeVariant>('hard');
  readonly segmentTitle = input('Serra do Japi — Loop Norte');
  readonly segmentMeta = input('Jundiaí, BR · Marina Costa');
  readonly distance = input('48,4');
  readonly elevation = input('+865');
  readonly showBackLink = input(false);
  readonly showTopoSvg = input(false);
  readonly useBikeIcon = input(true);
}
