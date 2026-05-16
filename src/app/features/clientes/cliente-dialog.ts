import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ClienteService } from '../../core/services/cliente.service';
import { ClienteRead, ClienteUpdate } from '../../models/api.models';
import { AuditContextService } from '../../core/audit-context.service';

export interface ClienteDialogData {
  mode: 'create' | 'edit';
  row?: ClienteRead;
}

@Component({
  selector: 'app-cliente-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  templateUrl: './cliente-dialog.html',
})
export class ClienteDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ClienteService = inject(ClienteService);
  private readonly dialogRef = inject(MatDialogRef<ClienteDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);
  private readonly audit = inject(AuditContextService);

  readonly data = inject<ClienteDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    documento: ['', Validators.required],
    nombre: ['', Validators.required],
    apellido : ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    activo: [true],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        documento: r.documento,
        nombre: r.nombre,
        apellido: r.apellido,
        email: r.email,
        telefono: r.telefono,
        activo: r.activo,
      });
    }
    if (this.data.mode === 'create') {
      this.form.controls.nombre.setValidators([Validators.required, Validators.minLength(2)]);
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
      this.ClienteService
        .create({
          documento: v.documento,
          nombre: v.nombre,
          apellido: v.apellido,
          email: v.email,
          telefono: v.telefono,
          activo: v.activo,
          id_usuario_creacion: this.audit.usuarioId()!,
        })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
      return;
    }
    const id = this.data.row!.id_cliente;
    const body: ClienteUpdate = {
      documento: v.documento,
      nombre: v.nombre,
      apellido: v.apellido,
      email: v.email,
      telefono: v.telefono,
      activo: v.activo,
      id_usuario_edita: this.audit.usuarioId()!,
    };
    this.ClienteService.update(id, body).subscribe({
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