import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MesaService } from '../../core/services/mesa.service';
import { MesaSimpleRead } from '../../models/api.models';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './principal-list.html',
  styleUrl: './principal-list.scss',
})
export class PrincipalComponent implements OnInit {

  private readonly mesaService = inject(MesaService);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);

  loading = true;

  mesas: MesaSimpleRead[] = [];

  ngOnInit(): void {
    this.cargarMesas();
  }

  cargarMesas(): void {

    this.loading = true;

    this.mesaService.list().subscribe({

      next: (response: any) => {

        this.mesas = response.data;

        this.loading = false;
      },

      error: (err: HttpErrorResponse) => {

        this.loading = false;

        this.snack.open(
          this.obtenerMensaje(err),
          'Cerrar',
          {
            duration: 5000,
          }
        );
      }
    });
  }

  abrirMesa(mesa: MesaSimpleRead): void {
  this.router.navigate([
    '/app/orden-builder',
    mesa.id_mesa
  ]);
}

  private obtenerMensaje(err: HttpErrorResponse): string {

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