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

import { PlatoService } from '../../core/services/plato.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { CategoriaRead, CategoriaSimpleRead, PlatoRead, PlatoUpdate } from '../../models/api.models';
import { AuditContextService } from '../../core/audit-context.service';

export interface PlatoDialogData {
  mode: 'create' | 'edit';
  row?: PlatoRead;
}

@Component({
  selector: 'app-plato-dialog',
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
  templateUrl: './plato-dialog.html',
})
export class PlatoDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly PlatoService = inject(PlatoService);
  private readonly CategoriaService = inject(CategoriaService);

  private readonly dialogRef =
    inject(MatDialogRef<PlatoDialogComponent, boolean>);

  private readonly snack = inject(MatSnackBar);
  private readonly audit = inject(AuditContextService);

  readonly data = inject<PlatoDialogData>(MAT_DIALOG_DATA);

  readonly categorias$ = this.CategoriaService
  .listActivas()
  .pipe(
    map((r: any) => {
      const categorias = r.data as CategoriaSimpleRead[];

      // Si estoy editando y la categoría actual no viene
      // porque está inactiva, agregarla manualmente
      if (
        this.data.mode === 'edit' &&
        this.data.row?.categoria
      ) {
        const existe = categorias.some(
          c =>
            c.id_categoria ===
            this.data.row!.categoria.id_categoria
        );

        if (!existe) {
          categorias.push(this.data.row.categoria);
        }
      }

      return categorias;
    })
  );

  readonly form = this.fb.nonNullable.group({
    id_categoria: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    activo: [true, Validators.required],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;

      this.form.patchValue({
        id_categoria: r.id_categoria,
        nombre: r.nombre,
        descripcion: r.descripcion,
        precio: r.precio,
        activo: r.activo,
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
      this.PlatoService
        .create({
          id_categoria: v.id_categoria,
          nombre: v.nombre,
          descripcion: v.descripcion,
          precio: v.precio,
          activo: v.activo,
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

    const id = this.data.row!.id_plato;

    const body: PlatoUpdate = {
      id_categoria: v.id_categoria,
      nombre: v.nombre,
      descripcion: v.descripcion,
      precio: v.precio,
      activo: v.activo,
      id_usuario_edita: this.audit.usuarioId()!,
    };

    this.PlatoService.update(id, body).subscribe({
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