import { Routes } from '@angular/router';

/**
 * Routes du Admin Panel — Features 15 à 22.
 * Toutes les routes sont enrobées par AdminShellComponent qui fournit
 * la sub-navigation horizontale.
 */
export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      { path: '',              redirectTo: 'registrations', pathMatch: 'full' },
      { path: 'registrations', loadComponent: () =>
          import('./registrations/registrations.component').then(m => m.RegistrationsComponent) },
      { path: 'users',         loadComponent: () =>
          import('./users/users.component').then(m => m.UsersComponent) },
      { path: 'categories',    loadComponent: () =>
          import('./categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'questions',     loadComponent: () =>
          import('./questions/questions.component').then(m => m.QuestionsComponent) },
      { path: 'values',        loadComponent: () =>
          import('./values/values.component').then(m => m.ValuesComponent) },
      { path: 'assignments',   loadComponent: () =>
          import('./assignments/assignments.component').then(m => m.AssignmentsComponent) },
      { path: 'audit',         loadComponent: () =>
          import('./audit/audit.component').then(m => m.AuditComponent) },
      { path: 'reports',       loadComponent: () =>
          import('./reports/reports.component').then(m => m.ReportsComponent) }
    ]
  }
];
