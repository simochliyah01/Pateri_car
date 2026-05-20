import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AdminStatsService, DashboardStats } from '../../../core/services/admin-stats.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, NgChartsModule],
  template: `
    <div class="p-5 sm:p-8">
      @if (loading()) {
        <div class="space-y-6">
          <div class="h-44 bg-white rounded-3xl animate-pulse"></div>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            @for (i of [1,2,3,4]; track i) {
              <div class="h-40 bg-white rounded-2xl animate-pulse"></div>
            }
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4">
            <div class="h-80 bg-white rounded-2xl animate-pulse"></div>
            <div class="h-80 bg-white rounded-2xl animate-pulse"></div>
          </div>
        </div>
      } @else if (stats()) {

        <!-- HERO GREETING CARD -->
        <div class="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-primary-900 rounded-3xl p-6 sm:p-8 mb-6 shadow-xl">
          <div class="absolute top-0 right-0 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-20 -left-10 w-72 h-72 bg-primary-500/15 rounded-full blur-3xl"></div>

          <div class="relative flex flex-wrap items-center justify-between gap-4">
            <div class="flex-1 min-w-0">
              <p class="text-[11px] font-bold text-primary-300 uppercase tracking-[0.2em] mb-2">
                {{ greeting() }}
              </p>
              <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1">
                {{ greetingText() }}, {{ authService.currentUser()?.firstName }}
              </h1>
              <p class="text-sm text-white/70">
                {{ todayLabel() }}
              </p>

              @if (stats()!.pendingCount > 0) {
                <div class="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 rounded-full backdrop-blur-sm">
                  <span class="relative flex">
                    <span class="absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75 animate-ping"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  </span>
                  <span class="text-xs font-semibold text-amber-100">
                    {{ stats()!.pendingCount }} réservation(s) en attente de confirmation
                  </span>
                </div>
              } @else {
                <div class="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-primary-500/20 border border-primary-400/30 rounded-full backdrop-blur-sm">
                  <lucide-icon name="check-circle" [size]="12" class="text-primary-300"></lucide-icon>
                  <span class="text-xs font-semibold text-primary-100">
                    Tout est à jour, bon travail
                  </span>
                </div>
              }
            </div>

            <a routerLink="/admin/reservations"
               class="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all">
              <lucide-icon name="zap" [size]="14"></lucide-icon>
              Gérer les réservations
              <lucide-icon name="arrow-right" [size]="14"></lucide-icon>
            </a>
          </div>
        </div>

        <!-- KPI CARDS -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <!-- Revenue -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-primary-200 transition-all">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Revenu total</span>
                <div class="text-2xl sm:text-3xl font-bold text-ink-900 mt-1 leading-none">
                  {{ formatNumber(stats()!.totalRevenue) }}<span class="text-sm font-semibold text-ink-500 ml-1">DH</span>
                </div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0">
                <lucide-icon name="banknote" [size]="18" class="text-white"></lucide-icon>
              </div>
            </div>
            <div class="h-10 -mx-1">
              <canvas baseChart
                      [data]="revenueSparklineData"
                      [options]="sparklineOptions"
                      type="line">
              </canvas>
            </div>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <span class="text-[10px] text-ink-500">Cette semaine</span>
              <div class="flex items-center gap-1">
                <lucide-icon name="trending-up" [size]="10" class="text-primary-600"></lucide-icon>
                <span class="text-[11px] font-bold text-primary-600">+{{ stats()!.revenueChange }}%</span>
              </div>
            </div>
          </div>

          <!-- Bookings -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-blue-200 transition-all">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Réservations</span>
                <div class="text-2xl sm:text-3xl font-bold text-ink-900 mt-1 leading-none">
                  {{ stats()!.totalReservations }}
                </div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                <lucide-icon name="calendar" [size]="18" class="text-white"></lucide-icon>
              </div>
            </div>
            <div class="h-10 flex items-end gap-0.5">
              @for (count of stats()!.bookingsLast7Days; track $index) {
                <div class="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-sm"
                     [style.height.%]="getBookingBarHeight(count)">
                </div>
              }
            </div>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              @if (stats()!.pendingCount > 0) {
                <span class="text-[10px] text-amber-700 font-semibold">{{ stats()!.pendingCount }} en attente</span>
              } @else {
                <span class="text-[10px] text-ink-500">7 derniers jours</span>
              }
              <div class="flex items-center gap-1">
                <lucide-icon name="trending-up" [size]="10" class="text-blue-600"></lucide-icon>
                <span class="text-[11px] font-bold text-blue-600">+{{ weekBookingsTotal() }}</span>
              </div>
            </div>
          </div>

          <!-- Fleet -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-purple-200 transition-all">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Flotte</span>
                <div class="text-2xl sm:text-3xl font-bold text-ink-900 mt-1 leading-none">
                  {{ stats()!.availableVehicles }}<span class="text-lg text-ink-400">/{{ stats()!.totalVehicles }}</span>
                </div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                <lucide-icon name="car" [size]="18" class="text-white"></lucide-icon>
              </div>
            </div>
            <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden mt-4">
              <div class="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000"
                   [style.width.%]="stats()!.fleetUtilization">
              </div>
            </div>
            <div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <span class="text-[10px] text-ink-500">Utilisation</span>
              <span class="text-[11px] font-bold text-purple-600">{{ stats()!.fleetUtilization }}%</span>
            </div>
          </div>

          <!-- Clients -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-pink-200 transition-all">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Clients</span>
                <div class="text-2xl sm:text-3xl font-bold text-ink-900 mt-1 leading-none">
                  {{ stats()!.totalClients }}
                </div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/30 flex-shrink-0">
                <lucide-icon name="users" [size]="18" class="text-white"></lucide-icon>
              </div>
            </div>
            <div class="flex -space-x-2 mt-4">
              @for (i of [1,2,3,4]; track i) {
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                  {{ i }}
                </div>
              }
              @if (stats()!.totalClients > 4) {
                <div class="w-7 h-7 rounded-full bg-ink-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-ink-600">
                  +{{ stats()!.totalClients - 4 }}
                </div>
              }
            </div>
            <div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <span class="text-[10px] text-ink-500">Total actifs</span>
              @if (stats()!.newClientsThisWeek > 0) {
                <span class="text-[11px] font-bold text-pink-600">+{{ stats()!.newClientsThisWeek }} cette sem.</span>
              }
            </div>
          </div>
        </div>

        <!-- CHARTS ROW -->
        <div class="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4 sm:gap-6 mb-6">

          <!-- Revenue area chart -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
            <div class="flex items-center justify-between mb-5">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-ink-900">Chiffre d'affaires</h3>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 rounded-full text-[10px] font-bold text-primary-700 uppercase tracking-wider">
                    <lucide-icon name="trending-up" [size]="10"></lucide-icon>
                    +{{ stats()!.revenueChange }}%
                  </span>
                </div>
                <p class="text-xs text-ink-500">7 derniers jours</p>
              </div>
              <a routerLink="/admin/stats"
                 class="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                Détails
                <lucide-icon name="arrow-right" [size]="12"></lucide-icon>
              </a>
            </div>
            <div class="h-56 sm:h-64">
              <canvas baseChart
                      [data]="revenueAreaData"
                      [options]="revenueAreaOptions"
                      type="line">
              </canvas>
            </div>
          </div>

          <!-- Status donut -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
            <div class="mb-5">
              <h3 class="font-bold text-ink-900">Statuts</h3>
              <p class="text-xs text-ink-500">Vue d'ensemble</p>
            </div>
            <div class="relative h-44 mb-4">
              <canvas baseChart
                      [data]="statusDonutData"
                      [options]="statusDonutOptions"
                      type="doughnut">
              </canvas>
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div class="text-2xl font-bold text-ink-900">{{ stats()!.totalReservations }}</div>
                <div class="text-[10px] font-semibold text-ink-500 uppercase tracking-wider">Total</div>
              </div>
            </div>
            <div class="space-y-1.5 text-xs">
              <div class="flex items-center justify-between py-1">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span class="text-ink-700">En attente</span>
                </div>
                <span class="font-bold text-ink-900">{{ stats()!.pendingCount }}</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-primary-500"></span>
                  <span class="text-ink-700">Confirmées</span>
                </div>
                <span class="font-bold text-ink-900">{{ stats()!.confirmedCount }}</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span class="text-ink-700">En cours</span>
                </div>
                <span class="font-bold text-ink-900">{{ stats()!.inProgressCount }}</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                  <span class="text-ink-700">Terminées</span>
                </div>
                <span class="font-bold text-ink-900">{{ stats()!.completedCount }}</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-red-400"></span>
                  <span class="text-ink-700">Annulées</span>
                </div>
                <span class="font-bold text-ink-900">{{ stats()!.cancelledCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ACTIVITY FEED + QUICK ACTIONS -->
        <div class="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 sm:gap-6">

          <!-- Activity Table -->
          <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <!-- Header -->
            <div class="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-ink-900 flex items-center gap-2">
                  Activité récente
                  <span class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-[10px] font-bold">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                    Live
                  </span>
                </h3>
                <p class="text-xs text-ink-500 mt-0.5">Les derniers événements</p>
              </div>
              <a routerLink="/admin/reservations"
                 class="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                Voir tout
                <lucide-icon name="arrow-right" [size]="12"></lucide-icon>
              </a>
            </div>

            @if (stats()!.activityFeed.length === 0) {
              <div class="text-center py-12 px-6">
                <lucide-icon name="inbox" [size]="32" class="text-ink-300 mx-auto mb-2"></lucide-icon>
                <p class="text-sm text-ink-500">Aucune activité récente</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-surface-50 border-b border-gray-100">
                    <tr>
                      <th class="text-left px-5 sm:px-6 py-2.5 text-[10px] font-bold text-ink-500 uppercase tracking-wider w-16">Type</th>
                      <th class="text-left px-3 py-2.5 text-[10px] font-bold text-ink-500 uppercase tracking-wider">Événement</th>
                      <th class="text-left px-3 py-2.5 text-[10px] font-bold text-ink-500 uppercase tracking-wider hidden md:table-cell">Détails</th>
                      <th class="text-right px-5 sm:px-6 py-2.5 text-[10px] font-bold text-ink-500 uppercase tracking-wider w-24">Quand</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of stats()!.activityFeed; track item.id) {
                      <tr class="border-b border-gray-50 last:border-b-0 hover:bg-surface-50 transition-colors cursor-pointer">
                        <td class="px-5 sm:px-6 py-3">
                          <div [ngClass]="getActivityIconClasses(item.meta?.color)"
                               class="w-8 h-8 rounded-lg flex items-center justify-center">
                            <lucide-icon [name]="item.meta?.icon || 'circle'" [size]="14"></lucide-icon>
                          </div>
                        </td>
                        <td class="px-3 py-3">
                          <div class="font-semibold text-ink-900 text-sm truncate max-w-[200px]">
                            {{ item.title }}
                          </div>
                          <div class="md:hidden text-[11px] text-ink-500 truncate mt-0.5">
                            {{ item.subtitle }}
                          </div>
                        </td>
                        <td class="px-3 py-3 hidden md:table-cell">
                          <span class="text-[11px] text-ink-500 truncate block max-w-[220px]">
                            {{ item.subtitle }}
                          </span>
                        </td>
                        <td class="px-5 sm:px-6 py-3 text-right">
                          <span class="text-[11px] font-medium text-ink-500 whitespace-nowrap">
                            {{ formatRelative(item.timestamp) }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Quick Actions -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
            <div class="mb-5">
              <h3 class="font-bold text-ink-900">Actions rapides</h3>
              <p class="text-xs text-ink-500">Raccourcis fréquents</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <a routerLink="/admin/reservations"
                 class="quick-action-card bg-gradient-to-br from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-200/50 border-amber-200/50">
                <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <lucide-icon name="clock" [size]="18" class="text-white"></lucide-icon>
                </div>
                <div>
                  <div class="font-bold text-sm text-ink-900">A confirmer</div>
                  <div class="text-[11px] text-ink-600">{{ stats()!.pendingCount }} réservation(s)</div>
                </div>
              </a>

              <a routerLink="/admin/voitures"
                 class="quick-action-card bg-gradient-to-br from-primary-50 to-primary-100/50 hover:from-primary-100 hover:to-primary-200/50 border-primary-200/50">
                <div class="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <lucide-icon name="plus" [size]="18" class="text-white"></lucide-icon>
                </div>
                <div>
                  <div class="font-bold text-sm text-ink-900">Voiture</div>
                  <div class="text-[11px] text-ink-600">Ajouter au catalogue</div>
                </div>
              </a>

              <a routerLink="/admin/clients"
                 class="quick-action-card bg-gradient-to-br from-pink-50 to-pink-100/50 hover:from-pink-100 hover:to-pink-200/50 border-pink-200/50">
                <div class="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <lucide-icon name="users" [size]="18" class="text-white"></lucide-icon>
                </div>
                <div>
                  <div class="font-bold text-sm text-ink-900">Clients</div>
                  <div class="text-[11px] text-ink-600">{{ stats()!.totalClients }} actifs</div>
                </div>
              </a>

              <a routerLink="/admin/stats"
                 class="quick-action-card bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 border-blue-200/50">
                <div class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <lucide-icon name="trending-up" [size]="18" class="text-white"></lucide-icon>
                </div>
                <div>
                  <div class="font-bold text-sm text-ink-900">Analytics</div>
                  <div class="text-[11px] text-ink-600">Voir détails</div>
                </div>
              </a>
            </div>
          </div>
        </div>

      }
    </div>
  `,
  styles: [`
    .quick-action-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border: 1px solid;
      border-radius: 16px;
      transition: all 0.2s;
      cursor: pointer;
      text-decoration: none;
    }
    .quick-action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.1);
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  protected authService  = inject(AuthService);
  private statsService   = inject(AdminStatsService);
  private reservationService = inject(ReservationService);

  stats   = signal<DashboardStats | null>(null);
  loading = signal(true);

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 6)  return 'Nuit';
    if (h < 12) return 'Matin';
    if (h < 18) return 'Après-midi';
    return 'Soir';
  });

  greetingText = computed(() => {
    const h = new Date().getHours();
    if (h < 6)  return 'Bonne nuit';
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  });

  todayLabel = computed(() =>
    new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

  weekBookingsTotal = computed(() =>
    (this.stats()?.bookingsLast7Days ?? []).reduce((s, n) => s + n, 0)
  );

  revenueSparklineData: ChartData<'line'> = {
    labels: ['', '', '', '', '', '', ''],
    datasets: [{
      data: [],
      borderColor: '#14B8A6',
      backgroundColor: 'rgba(20, 184, 166, 0.15)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointBackgroundColor: '#14B8A6',
    }],
  };

  sparklineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  revenueAreaData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Revenu',
      borderColor: '#14B8A6',
      backgroundColor: 'rgba(20, 184, 166, 0.18)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#14B8A6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  revenueAreaOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { weight: 'bold', size: 12 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        callbacks: { label: (ctx) => `${ctx.parsed.y} DH` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        grid: { color: '#F1F5F9' },
        ticks: { font: { size: 10 }, callback: (val) => val + ' DH' },
        beginAtZero: true,
      },
    },
  };

  statusDonutData: ChartData<'doughnut'> = {
    labels: ['En attente', 'Confirmées', 'En cours', 'Terminées', 'Annulées'],
    datasets: [{
      data: [],
      backgroundColor: ['#FBBF24', '#14B8A6', '#3B82F6', '#9CA3AF', '#F87171'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  statusDonutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.statsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.updateCharts(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateCharts(data: DashboardStats) {
    this.revenueSparklineData = {
      labels: ['', '', '', '', '', '', ''],
      datasets: [{
        ...this.revenueSparklineData.datasets[0],
        data: data.revenueLast7Days,
      }],
    };

    this.revenueAreaData = {
      labels: data.revenueByDay.map(d => d.date),
      datasets: [{
        ...this.revenueAreaData.datasets[0],
        data: data.revenueByDay.map(d => d.revenue),
      }],
    };

    this.statusDonutData = {
      ...this.statusDonutData,
      datasets: [{
        ...this.statusDonutData.datasets[0],
        data: [
          data.pendingCount,
          data.confirmedCount,
          data.inProgressCount,
          data.completedCount,
          data.cancelledCount,
        ],
      }],
    };
  }

  getBookingBarHeight(count: number): number {
    const max = Math.max(...(this.stats()?.bookingsLast7Days ?? [1]), 1);
    return Math.max(8, (count / max) * 100);
  }

  getActivityIconClasses(color?: string): Record<string, boolean> {
    return {
      'bg-primary-100 text-primary-700': color === 'teal' || !color,
      'bg-blue-100 text-blue-700':       color === 'blue',
      'bg-purple-100 text-purple-700':   color === 'purple',
      'bg-amber-100 text-amber-700':     color === 'amber',
      'bg-red-100 text-red-700':         color === 'red',
    };
  }

  formatNumber(n: number): string {
    return n.toLocaleString('fr-FR');
  }

  formatRelative(dateStr: string): string {
    const date    = new Date(dateStr);
    const diffMs  = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffH   = Math.floor(diffMs / 3_600_000);
    const diffD   = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1)  return "A l'instant";
    if (diffMin < 60) return `il y a ${diffMin} min`;
    if (diffH   < 24) return `il y a ${diffH}h`;
    if (diffD   < 7)  return `il y a ${diffD}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
}
