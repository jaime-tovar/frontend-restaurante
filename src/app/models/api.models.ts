/** Contratos alineados con `src/api/*.py` del backend FastAPI. */

export interface UsuarioRead {
  id_usuario: string;
  nombre_completo: string;
  username: string;
  email: string;
  rol: string;
  telefono: string | null;
  activo: boolean;
}

export interface UsuarioCreate {
  nombre_completo: string;
  username: string;
  email: string;
  password: string;
  rol: string;
  telefono?: string | null;
  activo?: boolean;
}

export interface UsuarioUpdate {
  nombre_completo?: string;
  username?: string;
  email?: string;
  password?: string;
  rol?: string;
  telefono?: string | null;
  activo?: boolean;
}