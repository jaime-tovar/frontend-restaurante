import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PlatoCreate, PlatoRead, PlatoUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class PlatoService {
  private readonly base = `${environment.apiUrl}/platos`;
  
  constructor(private readonly http: HttpClient) {}

  list(): Observable<PlatoRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<PlatoRead[]>(`${this.base}`, { params });
  }
  
  get(id: string): Observable<PlatoRead> {
    return this.http.get<PlatoRead>(`${this.base}/${id}`);
  }

  create(body: PlatoCreate): Observable<PlatoRead> {
    return this.http.post<PlatoRead>(`${this.base}/`, body);
  }

  update(id: string, body: PlatoUpdate): Observable<PlatoRead> {
    return this.http.put<PlatoRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}