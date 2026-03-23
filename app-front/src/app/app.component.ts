import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./components/footer/footer.component";
import { TopBarComponent } from "./components/top-bar/top-bar.component";

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet, FooterComponent, TopBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'app-front';
}
