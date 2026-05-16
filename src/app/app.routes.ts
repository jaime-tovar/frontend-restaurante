import { Routes } from '@angular/router';

import { auditUserGuard } from './core/audit-user.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [auditUserGuard],
    loadComponent: () => import('./features/shell/main-layout').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuario-list').then((m) => m.UsuarioListComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categoria-list').then((m) => m.CategoriaListComponent),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/cliente-list').then((m) => m.ClienteListComponent),
      },
      {
        path: 'metodos-pago',
        loadComponent: () =>
          import('./features/metodos_pago/metodos_pago-list').then((m) => m.MetodoPagoListComponent),
      },
      {
        path: 'mesas',
        loadComponent: () =>
          import('./features/mesas/mesa-list').then((m) => m.MesaListComponent),
      }
    ],
  },
  { path: '**', redirectTo: 'login' },
];