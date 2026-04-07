import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading/loading.service';

@Component({
  selector: 'app-spinneroverlay',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './spinneroverlay.component.html',
  styleUrl: './spinneroverlay.component.css',
})
export class SpinneroverlayComponent {
  constructor(public loadingService: LoadingService) {}
}
