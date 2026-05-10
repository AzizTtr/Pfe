import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private keycloak = inject(KeycloakService);
  private router   = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles: string[] = route.data['roles'] || [];
    if (requiredRoles.length === 0) return true;

    const userRoles = this.keycloak.getUserRoles(true);
    const allowed = requiredRoles.some(r => userRoles.includes(r));
    if (!allowed) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
