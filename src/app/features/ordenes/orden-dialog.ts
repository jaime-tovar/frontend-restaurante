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
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { map } from 'rxjs/operators';

import { OrdenService } from '../../core/services/orden.service';
import { MesaService } from '../../core/services/mesa.service';
import { MesaSimpleRead, OrdenRead, OrdenUpdate } from '../../models/api.models';
import { AuditContextService } from '../../core/audit-context.service';

export interface OrdenDialogData {
  mode: 'create' | 'edit';
  row?: OrdenRead;
}

@Component({
  selector: 'app-orden-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './orden-dialog.html',
})
export class OrdenDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly OrdenService = inject(OrdenService);
  private readonly MesaService = inject(MesaService);

  private readonly dialogRef =
    inject(MatDialogRef<OrdenDialogComponent, boolean>);

  private readonly snack = inject(MatSnackBar);
  private readonly audit = inject(AuditContextService);

  readonly data = inject<OrdenDialogData>(MAT_DIALOG_DATA);

  readonly mesas$ = this.MesaService
  .list()
  .pipe(
    map((r: any) => {
      const mesas = r.data as MesaSimpleRead[];

      // Si estoy editando y la mesa actual no viene
      // porque está inactiva, agregarla manualmente
      if (
        this.data.mode === 'edit' &&
        this.data.row?.id_mesa
      ) {
        const existe = mesas.some(
          m =>
            m.id_mesa ===
            this.data.row!.mesa.id_mesa
        );

        if (!existe) {
          mesas.push(this.data.row.mesa);
        }
      }

      return mesas;
    })
  );

  readonly form = this.fb.nonNullable.group({
    id_mesa: ['', Validators.required],
    estado: ['', Validators.required]
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;

      this.form.patchValue({
        id_mesa: r.id_mesa,
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
      this.OrdenService
        .create({
          id_mesa: v.id_mesa,
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

    const id = this.data.row!.id_orden;

    const body: OrdenUpdate = {
      id_mesa: v.id_mesa,
      estado: v.estado,
      id_usuario_edita: this.audit.usuarioId()!,
    };

    this.OrdenService.update(id, body).subscribe({
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