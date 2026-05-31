import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DetalleOrdenRead, DetalleOrdenCreate } from '../../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class DetalleOrdenService {

  private readonly base =
    `${environment.apiUrl}/detalle_orden`;

  constructor(
    private readonly http: HttpClient
  ) {}

  listarPorOrden(idOrden: string): Observable<any> {

    return this.http.get(
      `${this.base}/orden/${idOrden}`
    );
  }

  eliminar(idDetalle: string): Observable<any> {

    return this.http.delete(
      `${this.base}/${idDetalle}`
    );
  }

  obtenerActivaPorMesa(idMesa: string): Observable<any> {

    return this.http.get(
        `${this.base}/mesa/${idMesa}/activa`
    );
}

create(body: DetalleOrdenCreate): Observable<DetalleOrdenRead> {
  return this.http.post<DetalleOrdenRead>(
    `${this.base}`,
    body
  );
}

delete(id: string): Observable<void> {
  return this.http
    .delete(`${this.base}/${id}`, {
      observe: 'response'
    })
    .pipe(
      map(() => undefined)
    );
}

}