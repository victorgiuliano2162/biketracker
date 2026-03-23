import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-top-bar',
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {
  // Controla a exibição do botão de inscrição vs avatar do usuário.
  // Passe [isLoggedIn]="true" no componente pai quando o usuário estiver autenticado.
  @Input() isLoggedIn = false;
 
  onAtividade(tipo: string): void {
    console.log('Atividade selecionada:', tipo);
    // Implemente a navegação ou ação desejada
  }
 
  onMapa(tipo: string): void {
    console.log('Mapa selecionado:', tipo);
    // Implemente a navegação ou ação desejada
  }
 
  onPerfil(): void {
    console.log('Navegar para perfil');
  }
 
  onLogout(): void {
    console.log('Logout');
    // Implemente a lógica de logout aqui
  }

}
