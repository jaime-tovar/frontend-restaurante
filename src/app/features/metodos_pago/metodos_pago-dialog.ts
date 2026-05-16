import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MetodoPagoService } from '../../core/services/metodos_pago.service';
import { MetodoPagoRead, MetodoPagoUpdate } from '../../models/api.models';
import { AuditContextService } from '../../core/audit-context.service';

export interface MetodoPagoDialogData {
  mode: 'create' | 'edit';
  row?: MetodoPagoRead;
}

@Component({
  selector: 'app-metodo-pago-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  templateUrl: './metodos_pago-dialog.html',
})
export class MetodoPagoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly MetodoPagoService = inject(MetodoPagoService);
  private readonly dialogRef = inject(MatDialogRef<MetodoPagoDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);
  private readonly audit = inject(AuditContextService);

  readonly data = inject<MetodoPagoDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    activo: [true],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        nombre: r.nombre,
        activo: r.activo,
      });
    }
    if (this.data.mode === 'create') {
      this.form.controls.nombre.setValidators([Validators.required, Validators.minLength(4)]);
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
      this.MetodoPagoService
        .create({
          nombre: v.nombre,
          activo: v.activo,
          id_usuario_creacion: this.audit.usuarioId()!,
        })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
      return;
    }
    const id = this.data.row!.id_metodo_pago;
    const body: MetodoPagoUpdate = {
      nombre: v.nombre,
      activo: v.activo,
      id_usuario_edita: this.audit.usuarioId()!,
    };
    this.MetodoPagoService.update(id, body).subscribe({
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