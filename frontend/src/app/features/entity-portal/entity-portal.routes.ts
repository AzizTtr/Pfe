import { Routes } from '@angular/router';

export const entityPortalRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/requests-list.component').then(m => m.RequestsListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./new-request/new-request.component').then(m => m.NewRequestComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./detail/request-detail.component').then(m => m.RequestDetailComponent)
  }
];
