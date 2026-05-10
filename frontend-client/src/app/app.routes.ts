import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

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
    path: 'voitures/:id/reserver',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reservation-wizard/reservation-wizard.component')
      .then(m => m.ReservationWizardComponent),
    title: 'Réservation - PATERI CAR'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent),
    title: 'Connexion - PATERI CAR'
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent),
    title: 'Inscription - PATERI CAR'
  },
  { path: '**', redirectTo: 'home' }
];
