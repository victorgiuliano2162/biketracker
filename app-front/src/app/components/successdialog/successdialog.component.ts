import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MatDialogActions, MatDialogContent } from '@angular/material/dialog';

@Component({
  selector: 'app-successdialog',
  imports: [MatIconModule, MatButtonModule, MatIconModule, MatDialogActions, MatDialogContent],
  templateUrl: './successdialog.component.html',
  styleUrl: './successdialog.component.css'
})
export class SuccessdialogComponent {
   constructor(private dialogRef: MatDialogRef<SuccessdialogComponent>) {}
 
  close(): void {
    this.dialogRef.close();
  }
}
