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

import { MetodoPagoService } from '../../core/services/metodos_pago.service';
import { MetodoPagoRead } from '../../models/api.models';
import {
  MetodoPagoDialogComponent,
  MetodoPagoDialogData,
} from './metodos_pago-dialog';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Component({
  selector: 'app-metodo-pago-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './metodos_pago-list.html',
  styleUrl: './metodos_pago-list.scss',
})
export class MetodoPagoListComponent implements AfterViewInit {
  private readonly svc = inject(MetodoPagoService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = ['nombre', 'activo', 'acciones'];

  readonly dataSource = new MatTableDataSource<MetodoPagoRead>([]);

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

  editar(row: MetodoPagoRead): void {
    this.open({
      mode: 'edit',
      row,
    });
  }

  private open(data: MetodoPagoDialogData): void {
    this.dialog
      .open(MetodoPagoDialogComponent, {
        width: '480px',
        data,
      })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: MetodoPagoRead): void {
    if (!confirm(`¿Eliminar método de pago ${row.nombre}?`)) {
      return;
    }

    this.svc.delete(row.id_metodo_pago).subscribe({
      next: () => {
        this.snack.open('Método de pago eliminado', 'OK', {
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