import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';

import { ClienteService } from '../../core/services/cliente.service';
import { ClienteRead } from '../../models/api.models';
import { ClienteDialogComponent, ClienteDialogData } from './cliente-dialog';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Component({
  selector: 'app-cliente-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.scss',
})
export class ClienteListComponent implements AfterViewInit {
  private readonly svc = inject(ClienteService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = ['documento', 'nombre', 'apellido', 'email', 'telefono', 'activo', 'acciones'];

  readonly dataSource = new MatTableDataSource<ClienteRead>([]);

  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    this.reload();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  reload(): void {
    this.loading = true;
    this.svc.list().subscribe({
      next: (response: any) => {
        this.dataSource.data = response.data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  nuevo(): void {
    this.open({ mode: 'create' });
  }

  editar(row: ClienteRead): void {
    this.open({
      mode: 'edit',
      row,
    });
  }

  private open(data: ClienteDialogData): void {
    this.dialog
      .open(ClienteDialogComponent, {
        width: '480px',
        data,
      })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: ClienteRead): void {
    if (!confirm(`¿Eliminar cliente ${row.nombre}?`)) {
      return;
    }

    this.svc.delete(row.id_cliente).subscribe({
      next: () => {
        this.snack.open('Cliente eliminado', 'OK', {
          duration: 3000,
        });

        this.reload();
      },

      error: (err: HttpErrorResponse) => {
        this.snack.open(this.msg(err), 'Cerrar', {
          duration: 6000,
        });
      },
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