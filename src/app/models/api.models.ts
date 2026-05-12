/** Contratos alineados con `src/api/*.py` del backend FastAPI. */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    resultado: string;
    id_usuario: string;
    access_token: string;
    token_type: string;
    expires_in: number;
    rol: string;
  };
}

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

export interface CategoriaRead {
  id_categoria: string;
  descripcion: string;
  activo: boolean;
}

export interface CategoriaCreate {
  descripcion: string;
  activo?: boolean;
  id_usuario_creacion: string;
}

export interface CategoriaUpdate {
  descripcion?: string;
  activo?: boolean;
  id_usuario_edita?: string;
}

