import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  blackListedRoutes = ['map', 'login'];
  constructor(private router: Router) {}
  
  showFooter(): boolean {
    return !this.blackListedRoutes.includes(this.router.url)
  }

}
