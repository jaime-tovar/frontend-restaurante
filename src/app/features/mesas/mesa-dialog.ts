import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

import { MesaService } from '../../core/services/mesa.service';
import { MesaRead, MesaUpdate } from '../../models/api.models';
import { AuditContextService } from '../../core/audit-context.service';

export interface MesaDialogData {
  mode: 'create' | 'edit';
  row?: MesaRead;
}

@Component({
  selector: 'app-mesa-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: './mesa-dialog.html',
})
export class MesaDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly MesaService = inject(MesaService);

  private readonly dialogRef =
    inject(MatDialogRef<MesaDialogComponent, boolean>);

  private readonly snack = inject(MatSnackBar);
  private readonly audit = inject(AuditContextService);

  readonly data = inject<MesaDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    numero_mesa: [0, [Validators.required, Validators.min(1)]],
    capacidad: [0, [Validators.required, Validators.min(1)]],
    estado: ['disponible', Validators.required],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;

      this.form.patchValue({
        numero_mesa: r.numero_mesa,
        capacidad: r.capacidad,
        estado: r.estado,
      });
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
      this.MesaService
        .create({
          numero_mesa: v.numero_mesa,
          capacidad: v.capacidad,
          estado: v.estado,
          id_usuario_creacion: this.audit.usuarioId()!,
        })
        .subscribe({
          next: () => this.dialogRef.close(true),

          error: (err: HttpErrorResponse) =>
            this.snack.open(this.msg(err), 'Cerrar', {
              duration: 6000,
            }),
        });

      return;
    }

    const id = this.data.row!.id_mesa;

    const body: MesaUpdate = {
      numero_mesa: v.numero_mesa,
      capacidad: v.capacidad,
      estado: v.estado,
      id_usuario_edita: this.audit.usuarioId()!,
    };

    this.MesaService.update(id, body).subscribe({
      next: () => this.dialogRef.close(true),

      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', {
          duration: 6000,
        }),
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;

    if (typeof d === 'string') {
      return d;
    }

    if (Array.isArray(d)) {
      return d
        .map((x) => x.msg ?? JSON.stringify(x))
        .join('; ');
    }

    return err.message;
  }
}