import { Injectable, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, Observable } from 'rxjs';
import { KeycloakProfile } from 'keycloak-js';

/**
 * Façade autour de KeycloakService pour exposer une API simple à l'app.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(KeycloakService);

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  login(): Promise<void> {
    return this.keycloak.login({
      redirectUri: window.location.origin + '/dashboard'
    });
  }

  logout(): Promise<void> {
    return this.keycloak.logout(window.location.origin + '/home');
  }

  accountManagement(): Promise<void> {
    return this.keycloak.getKeycloakInstance().accountManagement();
  }

  getRoles(): string[] {
    return this.keycloak.getUserRoles(true);
  }

  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }

  loadProfile(): Observable<KeycloakProfile> {
    return from(this.keycloak.loadUserProfile());
  }

  getUsername(): string {
    return this.keycloak.getUsername() || '';
  }

  getToken(): Promise<string> {
    return this.keycloak.getToken();
  }
}
