import { Routes } from '@angular/router';

export const evaluationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./inbox/inbox.component').then(m => m.InboxComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./review/review.component').then(m => m.ReviewComponent)
  }
];
