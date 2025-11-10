import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const contentRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./content-list/content-list.component').then(m => m.ContentListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./content-form/content-form.component').then(m => m.ContentFormComponent),
    canActivate: [RoleGuard],
    data: { roles: ['MODERATOR', 'ADMIN'] }
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./content-form/content-form.component').then(m => m.ContentFormComponent),
    canActivate: [RoleGuard],
    data: { roles: ['MODERATOR', 'ADMIN'] }
  },
  {
    path: 'my',
    loadComponent: () => import('./my-content/my-content.component').then(m => m.MyContentComponent),
    canActivate: [RoleGuard],
    data: { roles: ['MODERATOR', 'ADMIN'] }
  },
  {
    path: ':id',
    loadComponent: () => import('./content-detail/content-detail.component').then(m => m.ContentDetailComponent)
  }
];
