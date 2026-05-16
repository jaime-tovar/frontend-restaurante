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

import { MesaService } from '../../core/services/mesa.service';
import { MesaRead } from '../../models/api.models';
import {
  MesaDialogComponent,
  MesaDialogData,
} from './mesa-dialog';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Component({
  selector: 'app-mesa-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './mesa-list.html',
  styleUrl: './mesa-list.scss',
})
export class MesaListComponent implements AfterViewInit {
  private readonly svc = inject(MesaService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = ['numero_mesa', 'capacidad', 'estado', 'acciones'];

  readonly dataSource = new MatTableDataSource<MesaRead>([]);

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

  editar(row: MesaRead): void {
    this.open({
      mode: 'edit',
      row,
    });
  }

  private open(data: MesaDialogData): void {
    this.dialog
      .open(MesaDialogComponent, {
        width: '480px',
        data,
      })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: MesaRead): void {
    if (!confirm(`¿Eliminar mesa ${row.numero_mesa}?`)) {
      return;
    }

    this.svc.delete(row.id_mesa).subscribe({
      next: () => {
        this.snack.open('Mesa eliminada', 'OK', {
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