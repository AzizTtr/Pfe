import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { RoleGuard } from './core/auth/role.guard';

/**
 * Définition des routes principales.
 * Les modules sont chargés en lazy-loading pour réduire la taille du bundle initial.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Pages publiques
  {
    path: 'home',
    loadComponent: () =>
      import('./features/public/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/public/register/register.component').then(m => m.RegisterComponent)
  },

  // Espace authentifié
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },

  // Espace institution (Jiha)
  {
    path: 'my-requests',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ENTITY_MANAGER'] },
    loadChildren: () =>
      import('./features/entity-portal/entity-portal.routes').then(m => m.entityPortalRoutes)
  },

  // Espace évaluation
  {
    path: 'evaluation',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_EVALUATOR', 'ROLE_ADMIN_REVIEWER', 'ROLE_FIELD_REVIEWER'] },
    loadChildren: () =>
      import('./features/evaluation/evaluation.routes').then(m => m.evaluationRoutes)
  },

  // Admin Panel
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_PLATFORM_ADMIN'] },
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },

  // Fallback
  { path: '**', redirectTo: 'home' }
];
