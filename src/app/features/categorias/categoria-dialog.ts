import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CategoriaService } from '../../core/services/categoria.service';
import { CategoriaRead, CategoriaUpdate } from '../../models/api.models';
import { AuditContextService } from '../../core/audit-context.service';

export interface CategoriaDialogData {
  mode: 'create' | 'edit';
  row?: CategoriaRead;
}

@Component({
  selector: 'app-categoria-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  templateUrl: './categoria-dialog.html',
})
export class CategoriaDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly CategoriaService = inject(CategoriaService);
  private readonly dialogRef = inject(MatDialogRef<CategoriaDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);
  private readonly audit = inject(AuditContextService);

  readonly data = inject<CategoriaDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    descripcion: ['', Validators.required],
    activo: [true],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        descripcion: r.descripcion,
        activo: r.activo,
      });
    }
    if (this.data.mode === 'create') {
      this.form.controls.descripcion.setValidators([Validators.required, Validators.minLength(4)]);
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (this.data.mode === 'create') {
      this.CategoriaService
        .create({
          descripcion: v.descripcion,
          activo: v.activo,
          id_usuario_creacion: this.audit.usuarioId()!,
        })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
      return;
    }
    const id = this.data.row!.id_categoria;
    const body: CategoriaUpdate = {
      descripcion: v.descripcion,
      activo: v.activo,
      id_usuario_edita: this.audit.usuarioId()!,
    };
    this.CategoriaService.update(id, body).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}