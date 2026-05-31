import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DetalleOrdenCreate, OrdenCreate, OrdenRead, OrdenUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class OrdenService {
  private readonly base = `${environment.apiUrl}/ordenes`;
  
  constructor(private readonly http: HttpClient) {}

  list(): Observable<OrdenRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<OrdenRead[]>(`${this.base}`, { params });
  }
  
  get(id: string): Observable<OrdenRead> {
    return this.http.get<OrdenRead>(`${this.base}/${id}`);
  }

  create(body: OrdenCreate): Observable<OrdenRead> {
    return this.http.post<OrdenRead>(`${this.base}`, body);
  }

  update(id: string, body: OrdenUpdate): Observable<OrdenRead> {
    return this.http.put<OrdenRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }

  obtenerActivaPorMesa(idMesa: string): Observable<any> {

    return this.http.get(
      `${this.base}/mesa/${idMesa}/activa`
    );

  }

  actualizarDetalles(
    idOrden: string,
    detalles: DetalleOrdenCreate[]
  ): Observable<any> {

    return this.http.put(
      `${this.base}/${idOrden}/detalles`,
      detalles
    );

  }
}