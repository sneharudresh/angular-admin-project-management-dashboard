// features/projects/new-project-dialog/new-project-dialog.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-new-project-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
MatDividerModule  ],
  templateUrl: './new-project-dialog.html',
  styleUrl: './new-project-dialog.scss',
})
export class NewProjectDialog {
 projectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewProjectDialog>
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      assignedTo: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      status: ['pending', [Validators.required]],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;
      // Set initial progress based on status
      let progress = 0;
      if (formValue.status === 'active') {
        progress = 10;
      } else if (formValue.status === 'completed') {
        progress = 100;
      }

      this.dialogRef.close({
        ...formValue,
        progress: progress,
        startDate: new Date().toISOString().split('T')[0]
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
