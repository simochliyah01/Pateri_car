import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent),
    title: 'PATERI CAR - Location de voitures à Taza'
  },
  {
    path: 'voitures',
    loadComponent: () => import('./features/catalog/catalog.component')
      .then(m => m.CatalogComponent),
    title: 'Catalogue - PATERI CAR'
  },
  {
    path: 'voitures/:id',
    loadComponent: () => import('./features/vehicle-detail/vehicle-detail.component')
      .then(m => m.VehicleDetailComponent),
    title: 'Détail voiture - PATERI CAR'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent),
    title: 'Connexion - PATERI CAR'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent),
    title: 'Inscription - PATERI CAR'
  },
  { path: '**', redirectTo: 'home' }
];
