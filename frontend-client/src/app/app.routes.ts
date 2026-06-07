import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

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
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component')
      .then(m => m.ProfileComponent),
    title: 'Mon profil - PATERI CAR'
  },
  {
    path: 'voitures/:id/reserver',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reservation-wizard/reservation-wizard.component')
      .then(m => m.ReservationWizardComponent),
    title: 'Réservation - PATERI CAR'
  },
  {
    path: 'mes-reservations',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-reservations/my-reservations.component')
      .then(m => m.MyReservationsComponent),
    title: 'Mes réservations - PATERI CAR'
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
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component')
      .then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component')
          .then(m => m.AdminDashboardComponent),
        title: 'Tableau de bord - PATERI CAR'
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/admin/reservations-admin/reservations-admin.component')
          .then(m => m.ReservationsAdminComponent),
        title: 'Réservations - PATERI CAR'
      },
      {
        path: 'voitures',
        loadComponent: () => import('./features/admin/vehicles-admin/vehicles-admin.component')
          .then(m => m.VehiclesAdminComponent),
        title: 'Voitures - PATERI CAR'
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/admin/clients-admin/clients-admin.component')
          .then(m => m.ClientsAdminComponent),
        title: 'Clients - PATERI CAR'
      },
      {
        path: 'stats',
        loadComponent: () => import('./features/admin/stats-admin/stats-admin.component')
          .then(m => m.StatsAdminComponent),
        title: 'Statistiques - PATERI CAR'
      },
      {
        path: 'parametres',
        loadComponent: () => import('./features/admin/settings-admin/settings-admin.component')
          .then(m => m.SettingsAdminComponent),
        title: 'Paramètres - PATERI CAR'
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/admin/notifications-admin/notifications-admin.component')
          .then(m => m.NotificationsAdminComponent),
        title: 'Notifications - PATERI CAR'
      },
    ],
  },
  { path: '**', redirectTo: 'home' }
];
