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
import { Router } from '@angular/router';

import { OrdenService } from '../../core/services/orden.service';
import { OrdenRead } from '../../models/api.models';
import {
  OrdenDialogComponent,
  OrdenDialogData,
} from './orden-dialog';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Component({
  selector: 'app-orden-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './orden-list.html',
  styleUrl: './orden-list.scss',
})
export class OrdenListComponent implements AfterViewInit {
  private readonly svc = inject(OrdenService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly displayedColumns = ['numero_mesa', 'estado', 'acciones'];

  readonly dataSource = new MatTableDataSource<OrdenRead>([]);

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

  editar(row: OrdenRead): void {
    this.open({
      mode: 'edit',
      row,
    });
  }

  verDetalle(row: OrdenRead): void {
    this.router.navigate(['/ordenes', row.id_orden]);
  }

  private open(data: OrdenDialogData): void {
    this.dialog
      .open(OrdenDialogComponent, {
        width: '480px',
        data,
      })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: OrdenRead): void {
    if (!confirm(`¿Eliminar orden ${row.id_orden}?`)) {
      return;
    }

    this.svc.delete(row.id_orden).subscribe({
      next: () => {
        this.snack.open('Orden eliminada', 'OK', {
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