import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PlatoService } from '../../core/services/plato.service';
import { OrdenService } from '../../core/services/orden.service';
import { DetalleOrdenService } from '../../core/services/detalle-orden.service';
import { AuditContextService } from '../../core/audit-context.service';

import { PlatoRead, OrdenCreate, DetalleOrdenRead} from '../../models/api.models';

@Component({
  selector: 'app-orden-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './orden-builder.html',
  styleUrl: './orden-builder.scss'
})
export class OrdenBuilderComponent {

  private readonly platoService = inject(PlatoService);
  private readonly ordenService = inject(OrdenService);
  private readonly detalleOrdenService = inject(DetalleOrdenService);
  private readonly audit = inject(AuditContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  idMesa = '';
  idOrden = '';
  modoEdicion = false;

  platos: PlatoRead[] = [];

  carrito: {
    id_detalle_orden?: string;
    id_plato: string;
    nombre: string;
    precio: number;
    cantidad: number;
  }[] = [];

  constructor() {

    this.idMesa =
      this.route.snapshot.paramMap.get('idMesa')!;

    this.cargarPlatos();

    this.buscarOrdenActiva();
  }

  cargarPlatos(): void {

    this.platoService.list().subscribe({
      next: (response: any) => {
        this.platos = response.data;
      }
    });

  }

  buscarOrdenActiva(): void {

  this.ordenService
    .obtenerActivaPorMesa(this.idMesa)
    .subscribe({

      next: (response: any) => {

        this.modoEdicion = true;

        this.idOrden =
          response.data.id_orden;

        this.cargarDetalles();
      },

      error: () => {

        this.modoEdicion = false;

      }

    });

}

cargarDetalles(): void {

  this.detalleOrdenService
    .listarPorOrden(this.idOrden)
    .subscribe({

      next: (response: any) => {

        this.carrito =
        response.data.map(
          (detalle: DetalleOrdenRead) => ({

            id_detalle_orden:
              detalle.id_detalle_orden,

            id_plato:
              detalle.plato.id_plato,

            nombre:
              detalle.plato.nombre,

            precio:
              Number(detalle.precio_unitario),

            cantidad:
              detalle.cantidad

          })
        );

      }

    });

}

  agregar(plato: PlatoRead): void {

    const existe = this.carrito.find(
      x => x.id_plato === plato.id_plato
    );

    if (existe) {
      existe.cantidad++;
      return;
    }

    this.carrito.push({
      id_plato: plato.id_plato,
      nombre: plato.nombre,
      precio: Number(plato.precio),
      cantidad: 1
    });

  }

  eliminar(idPlato: string): void {

    this.carrito =
      this.carrito.filter(
        x => x.id_plato !== idPlato
      );

  }

  total(): number {

    return this.carrito.reduce(
      (acc, item) =>
        acc + item.precio * item.cantidad,
      0
    );

  }

  guardar(): void {

    if (this.modoEdicion) {

      this.ordenService
        .actualizarDetalles(
          this.idOrden,
          this.carrito.map(item => ({
            id_plato: item.id_plato,
            cantidad: item.cantidad
          }))
        )
        .subscribe({

          next: () => {

            this.snack.open(
              'Orden actualizada',
              'OK',
              { duration: 3000 }
            );

            this.router.navigate([
              '/app/principal'
            ]);

          }

        });

      return;
    }

    const body: OrdenCreate = {

      id_mesa: this.idMesa,

      id_usuario_creacion:
        this.audit.usuarioId()!,

      detalles:
        this.carrito.map(item => ({
          id_plato: item.id_plato,
          cantidad: item.cantidad
        }))
    };

    this.ordenService.create(body)
      .subscribe({

        next: () => {

          this.snack.open(
            'Orden creada',
            'OK',
            { duration: 3000 }
          );

          this.router.navigate(
            ['/app/principal']
          );

        }

      });

  }

}