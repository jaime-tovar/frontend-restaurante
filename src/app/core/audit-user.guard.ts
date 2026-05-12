import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuditContextService } from './audit-context.service';
import { AuthService } from './services/auth.service';

export const auditUserGuard: CanActivateFn = () => {
  const audit = inject(AuditContextService);
  const auth = inject(AuthService);
  const router = inject(Router);

  const hasUser = audit.hasUsuario();
  const isLogged = auth.isAuthenticated();

  if (hasUser && isLogged) {
    return true;
  }

  return router.createUrlTree(['/login']);
};