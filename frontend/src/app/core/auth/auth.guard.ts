import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private keycloak = inject(KeycloakService);

  async canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (!this.keycloak.isLoggedIn()) {
      await this.keycloak.login({
        redirectUri: window.location.origin + state.url
      });
      return false;
    }
    return true;
  }
}
