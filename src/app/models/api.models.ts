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

export interface ClienteRead {
  id_cliente: string;
  documento: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  activo: boolean;
}

export interface ClienteCreate {
  documento: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  activo?: boolean;
  id_usuario_creacion: string;
}

export interface ClienteUpdate {
  documento?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string | null;
  activo?: boolean;
  id_usuario_edita?: string;
}

export interface MetodoPagoRead {
  id_metodo_pago: string;
  nombre: string;
  activo: boolean;
}

export interface MetodoPagoCreate {
  nombre: string;
  activo?: boolean;
  id_usuario_creacion: string;
}

export interface MetodoPagoUpdate {
  nombre?: string;
  activo?: boolean;
  id_usuario_edita?: string;
}

export interface MesaRead {
  id_mesa: string;
  numero_mesa: number;
  capacidad: number;
  estado: string;
}

export interface MesaCreate {
  numero_mesa: number;
  capacidad: number;
  estado: string;
  id_usuario_creacion: string;
}

export interface MesaUpdate {
  numero_mesa?: number;
  capacidad?: number;
  estado?: string;
  id_usuario_edita?: string;
}

export interface CategoriaSimpleRead {
  id_categoria: string;
  descripcion: string;
}

export interface PlatoRead {
  id_plato: string;
  nombre: string;
  descripcion: string;
  precio: number;
  id_categoria: string;
  categoria: CategoriaSimpleRead;
  activo: boolean;
}

export interface PlatoCreate {
  nombre: string;
  descripcion: string;
  precio: number;
  id_categoria: string;
  activo?: boolean;
  id_usuario_creacion: string;
}

export interface PlatoUpdate {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  id_categoria?: string;
  activo?: boolean;
  id_usuario_edita?: string;
}