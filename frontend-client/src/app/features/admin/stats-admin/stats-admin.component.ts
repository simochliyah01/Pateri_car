import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AdminStatsService, AdvancedStats, StatsPeriod } from '../../../core/services/admin-stats.service';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, NgChartsModule],
  template: `
    <div class="p-5 sm:p-8">

      <!-- PREMIUM HERO HEADER WITH PERIOD SELECTOR -->
      <div class="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-primary-900 rounded-3xl p-6 sm:p-8 mb-6 shadow-xl">
        <!-- Decorative orbs -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl"></div>

        <div class="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-[11px] font-bold text-primary-300 uppercase tracking-[0.2em] mb-2">
              Analytics premium
            </p>
            <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1">
              Statistiques & Performance
            </h1>
            <p class="text-sm text-white/70">
              {{ stats()?.periodLabel || 'Chargement...' }}
            </p>
          </div>

          <!-- Period selector glass-style -->
          <div class="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
            <button (click)="selectPeriod('7d')"
                    [class.bg-white]="period() === '7d'"
                    [class.text-ink-900]="period() === '7d'"
                    [class.text-white]="period() !== '7d'"
                    class="px-4 py-2 text-sm font-semibold transition-all">
              7 jours
            </button>
            <button (click)="selectPeriod('30d')"
                    [class.bg-white]="period() === '30d'"
                    [class.text-ink-900]="period() === '30d'"
                    [class.text-white]="period() !== '30d'"
                    class="px-4 py-2 text-sm font-semibold transition-all">
              30 jours
            </button>
            <button (click)="selectPeriod('90d')"
                    [class.bg-white]="period() === '90d'"
                    [class.text-ink-900]="period() === '90d'"
                    [class.text-white]="period() !== '90d'"
                    class="px-4 py-2 text-sm font-semibold transition-all">
              90 jours
            </button>
            <button (click)="selectPeriod('all')"
                    [class.bg-white]="period() === 'all'"
                    [class.text-ink-900]="period() === 'all'"
                    [class.text-white]="period() !== 'all'"
                    class="px-4 py-2 text-sm font-semibold transition-all">
              Tout
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
              <div class="h-3 bg-gray-100 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-100 rounded w-3/4 mb-2"></div>
              <div class="h-12 bg-gray-100 rounded"></div>
            </div>
          }
        </div>
      } @else if (stats()) {

        <!-- 4 PREMIUM KPI CARDS WITH GRADIENTS -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <!-- Revenue -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-primary-200 transition-all group">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Revenu</span>
                <div class="text-2xl sm:text-3xl font-bold text-ink-900 mt-1 leading-none">
                  {{ formatNumber(stats()!.totalRevenue) }}
                  <span class="text-sm font-semibold text-ink-500">DH</span>
                </div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <lucide-icon name="banknote" [size]="18" class="text-white"></lucide-icon>
              </div>
            </div>
            <div class="h-10 -mx-1 mt-2">
              <canvas baseChart
                      [data]="revenueSparklineData"
                      [options]="sparklineOptions"
                      type="line">
              </canvas>
            </div>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <span class="text-[10px] text-ink-500">vs période préc.</span>
              <div class="flex items-center gap-1">
                @if (stats()!.revenueChangePercent >= 0) {
                  <lucide-icon name="trending-up" [size]="10" class="text-primary-600"></lucide-icon>
                  <span class="text-[11px] font-bold text-primary-600">+{{ stats()!.revenueChangePercent }}%</span>
                } @else {
                  <lucide-icon name="trending-down" [size]="10" class="text-red-600"></lucide-icon>
                  <span class="text-[11px] font-bold text-red-600">{{ stats()!.revenueChangePercent }}%</span>
                }
              </div>
            </div>
          </div>

          <!-- Bookings -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-blue-200 transition-all">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Réservations</span>
                <div class="text-2xl sm:text-3xl font-bold text-ink-900 mt-1 leading-none">
                  {{ stats()!.totalBookings }}
                </div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <lucide-icon name="calendar" [size]="18" class="text-white"></lucide-icon>
              </div>
            </div>
            <!-- Mini bars -->
            <div class="h-10 flex items-end gap-1 mt-2">
              @for (n of bookingBars(); track $index) {
                <div class="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-sm"
                     [style.height.%]="n">
                </div>
              }
            </div>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <span class="text-[10px] text-ink-500">vs période préc.</span>
              <div class="flex items-center gap-1">
                @if (stats()!.bookingsChange >= 0) {
                  <lucide-icon name="trending-up" [size]="10" class="text-blue-600"></lucide-icon>
                  <span class="text-[11px] font-bold text-blue-600">+{{ stats()!.bookingsChange }}</span>
                } @else {
                  <lucide-icon name="trending-down" [size]="10" class="text-red-600"></lucide-icon>
                  <span class="text-[11px] font-bold text-red-600">{{ stats()!.bookingsChange }}</span>
                }
              </div>
            </div>
          </div>

          <!-- Conversion -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-purple-200 transition-all">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Conversion</span>
                <div class="text-2xl sm:text-3xl font-bold text-ink-900 mt-1 leading-none">
                  {{ stats()!.conversionRate }}<span class="text-sm font-semibold text-ink-500">%</span>
                </div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <lucide-icon name="target" [size]="18" class="text-white"></lucide-icon>
              </div>
            </div>
            <!-- Progress gauge -->
            <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden mt-6">
              <div class="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000"
                   [style.width.%]="stats()!.conversionRate">
              </div>
            </div>
            <div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <span class="text-[10px] text-ink-500">Confirmées / Total</span>
              <span class="text-[11px] font-bold text-purple-600">
                {{ getQualityLabel(stats()!.conversionRate) }}
              </span>
            </div>
          </div>

          <!-- Avg rental -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-amber-200 transition-all">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Durée moy.</span>
                <div class="text-2xl sm:text-3xl font-bold text-ink-900 mt-1 leading-none">
                  {{ stats()!.avgRentalDays }}
                  <span class="text-sm font-semibold text-ink-500">jours</span>
                </div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <lucide-icon name="clock" [size]="18" class="text-white"></lucide-icon>
              </div>
            </div>
            <!-- Visual range -->
            <div class="h-10 flex items-end gap-1 mt-2">
              <div class="flex-1 bg-gradient-to-t from-amber-500 to-amber-300 rounded-sm"
                   [style.height.%]="getDurationVisual()">
              </div>
            </div>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <span class="text-[10px] text-ink-500">Par location</span>
              <span class="text-[11px] font-bold text-amber-600">
                {{ getDurationLabel(stats()!.avgRentalDays) }}
              </span>
            </div>
          </div>
        </div>

        <!-- REVENUE AREA CHART (FULL WIDTH) -->
        <div class="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-bold text-ink-900">Évolution du chiffre d'affaires</h3>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 rounded-full text-[10px] font-bold text-primary-700 uppercase tracking-wider">
                  <lucide-icon name="trending-up" [size]="10"></lucide-icon>
                  {{ stats()!.revenueChangePercent >= 0 ? '+' : '' }}{{ stats()!.revenueChangePercent }}%
                </span>
              </div>
              <p class="text-xs text-ink-500">{{ stats()!.periodLabel }}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-ink-900">
                {{ formatNumber(stats()!.totalRevenue) }} <span class="text-sm font-semibold text-ink-500">DH</span>
              </div>
              <p class="text-[10px] text-ink-500 uppercase tracking-wider">Total</p>
            </div>
          </div>
          <div class="h-64 sm:h-80">
            <canvas baseChart
                    [data]="revenueAreaData"
                    [options]="revenueAreaOptions"
                    type="line">
            </canvas>
          </div>
        </div>

        <!-- CATEGORY DONUT + TOP VEHICLES -->
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4 sm:gap-6 mb-6">

          <!-- Category breakdown -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
            <div class="mb-5">
              <h3 class="font-bold text-ink-900">Répartition par catégorie</h3>
              <p class="text-xs text-ink-500">Réservations par type de véhicule</p>
            </div>
            @if (stats()!.categoryBreakdown.length > 0) {
              <div class="relative h-44 mb-5">
                <canvas baseChart
                        [data]="categoryChartData"
                        [options]="categoryChartOptions"
                        type="doughnut">
                </canvas>
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div class="text-2xl font-bold text-ink-900">
                    {{ getCategoryTotal() }}
                  </div>
                  <div class="text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                    réservations
                  </div>
                </div>
              </div>
              <div class="space-y-1.5">
                @for (cat of stats()!.categoryBreakdown; track cat.category; let i = $index) {
                  <div class="flex items-center justify-between p-2 rounded-lg hover:bg-surface-50 transition-colors">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full"
                            [style.background-color]="getCategoryColor(i)"></span>
                      <span class="text-xs font-semibold text-ink-700">{{ getCategoryLabel(cat.category) }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-xs font-bold text-ink-900">{{ cat.count }}</span>
                      <span class="text-[10px] text-ink-500 font-medium min-w-[60px] text-right">
                        {{ formatNumber(cat.revenue) }} DH
                      </span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-center text-sm text-ink-500 py-10">Aucune donnée</p>
            }
          </div>

          <!-- Top vehicles -->
          <div class="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
            <div class="flex items-center justify-between mb-5">
              <div>
                <h3 class="font-bold text-ink-900 flex items-center gap-2">
                  Top voitures
                  <span class="inline-flex items-center px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Best performers
                  </span>
                </h3>
                <p class="text-xs text-ink-500">Les plus réservées de la période</p>
              </div>
              <a routerLink="/admin/voitures"
                 class="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                Voir tout
                <lucide-icon name="arrow-right" [size]="12"></lucide-icon>
              </a>
            </div>
            @if (stats()!.topVehicles.length > 0) {
              <div class="space-y-2">
                @for (v of stats()!.topVehicles; track v.vehicleId; let i = $index) {
                  <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors group">
                    <!-- Rank with medal -->
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                         [class.bg-gradient-to-br]="i < 3"
                         [class.from-amber-300]="i === 0"
                         [class.to-amber-500]="i === 0"
                         [class.from-gray-300]="i === 1"
                         [class.to-gray-500]="i === 1"
                         [class.from-orange-300]="i === 2"
                         [class.to-orange-500]="i === 2"
                         [class.bg-ink-100]="i >= 3"
                         [class.text-ink-700]="i >= 3"
                         [class.text-white]="i < 3"
                         [class.shadow-lg]="i < 3">
                      @if (i === 0) { 1er }
                      @else if (i === 1) { 2e }
                      @else if (i === 2) { 3e }
                      @else { {{ i + 1 }} }
                    </div>
                    <!-- Vehicle icon -->
                    <div class="w-10 h-10 bg-gradient-to-br from-primary-50 to-surface-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <lucide-icon name="car" [size]="16" class="text-primary-600"></lucide-icon>
                    </div>
                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-ink-900 text-sm truncate">
                        {{ v.brand }} {{ v.model }}
                      </div>
                      <div class="text-[11px] text-ink-500 flex items-center gap-2">
                        <span>{{ v.count }} réservation{{ v.count > 1 ? 's' : '' }}</span>
                        <span>&middot;</span>
                        <span>{{ getVehiclePercentage(v.count) }}% du total</span>
                      </div>
                    </div>
                    <!-- Revenue badge -->
                    <div class="text-right">
                      <div class="text-sm font-bold text-primary-700">
                        {{ formatNumber(v.revenue) }}
                      </div>
                      <div class="text-[10px] text-ink-500 font-semibold">DH</div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-center text-sm text-ink-500 py-10">Aucune donnée</p>
            }
          </div>
        </div>

        <!-- BOOKINGS BY DAY OF WEEK -->
        <div class="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="font-bold text-ink-900">Activité par jour de la semaine</h3>
              <p class="text-xs text-ink-500">Identifiez les pics et creux d'activité</p>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-ink-900">
                {{ getBusiestDay() }}
              </div>
              <p class="text-[10px] text-primary-600 uppercase tracking-wider font-bold">
                Jour le + actif
              </p>
            </div>
          </div>
          <div class="h-56">
            <canvas baseChart
                    [data]="weekChartData"
                    [options]="weekChartOptions"
                    type="bar">
            </canvas>
          </div>
        </div>
      }
    </div>
  `,
})
export class StatsAdminComponent implements OnInit {
  private statsService = inject(AdminStatsService);

  stats = signal<AdvancedStats | null>(null);
  loading = signal(true);
  period = signal<StatsPeriod>('30d');

  revenueSparklineData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      borderColor: '#14B8A6',
      backgroundColor: 'rgba(20, 184, 166, 0.15)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
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
      backgroundColor: (context: any) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return 'rgba(20, 184, 166, 0.15)';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(20, 184, 166, 0.35)');
        gradient.addColorStop(1, 'rgba(20, 184, 166, 0.02)');
        return gradient;
      },
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
        callbacks: {
          label: (ctx: any) => {
            const v = ctx.parsed?.y ?? 0;
            return v.toLocaleString('fr-FR') + ' DH';
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        grid: { color: '#F1F5F9' },
        ticks: {
          font: { size: 10 },
          callback: (val) => val + ' DH',
        },
        beginAtZero: true,
      },
    },
  };

  categoryChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#14B8A6', '#3B82F6', '#A855F7', '#F59E0B', '#EC4899', '#10B981'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  categoryChartOptions: ChartConfiguration<'doughnut'>['options'] = {
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

  weekChartData: ChartData<'bar'> = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      data: [],
      backgroundColor: (context: any) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return '#14B8A6';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, '#0D9488');
        gradient.addColorStop(1, '#5EEAD4');
        return gradient;
      },
      borderRadius: 8,
      hoverBackgroundColor: '#0D9488',
    }],
  };

  weekChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx: any) => {
            const v = ctx.parsed?.y ?? 0;
            return v + ' réservation' + (v > 1 ? 's' : '');
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11, weight: 'bold' } } },
      y: {
        grid: { color: '#F1F5F9' },
        ticks: { stepSize: 1, precision: 0 },
        beginAtZero: true,
      },
    },
  };

  readonly categoryColors = ['#14B8A6', '#3B82F6', '#A855F7', '#F59E0B', '#EC4899', '#10B981'];

  ngOnInit() {
    this.loadStats();
  }

  selectPeriod(p: StatsPeriod) {
    this.period.set(p);
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.statsService.getAdvancedStats(this.period()).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.updateCharts(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateCharts(data: AdvancedStats) {
    this.revenueSparklineData = {
      labels: data.revenueByDay.map(() => ''),
      datasets: [{
        ...this.revenueSparklineData.datasets[0],
        data: data.revenueByDay.map(d => d.revenue),
      }],
    };

    this.revenueAreaData = {
      labels: data.revenueByDay.map(d => d.label),
      datasets: [{
        ...this.revenueAreaData.datasets[0],
        data: data.revenueByDay.map(d => d.revenue),
      }],
    };

    this.categoryChartData = {
      labels: data.categoryBreakdown.map(c => this.getCategoryLabel(c.category)),
      datasets: [{
        ...this.categoryChartData.datasets[0],
        data: data.categoryBreakdown.map(c => c.count),
      }],
    };

    this.weekChartData = {
      labels: data.bookingsByDayOfWeek.map(d => d.day),
      datasets: [{
        ...this.weekChartData.datasets[0],
        data: data.bookingsByDayOfWeek.map(d => d.count),
      }],
    };
  }

  bookingBars(): number[] {
    const data = this.stats()?.revenueByDay?.slice(-7) || [];
    const max = Math.max(...data.map(d => d.revenue || 0), 1);
    return data.map(d => Math.max(8, ((d.revenue || 0) / max) * 100));
  }

  getCategoryTotal(): number {
    return this.stats()?.categoryBreakdown.reduce((s, c) => s + c.count, 0) || 0;
  }

  getVehiclePercentage(count: number): number {
    const total = this.stats()?.topVehicles.reduce((s, v) => s + v.count, 0) || 1;
    return Math.round((count / total) * 100);
  }

  getBusiestDay(): string {
    const days = this.stats()?.bookingsByDayOfWeek || [];
    if (days.length === 0) return '—';
    const max = days.reduce((best, d) => d.count > best.count ? d : best);
    return max.day;
  }

  getQualityLabel(rate: number): string {
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Bon';
    if (rate >= 40) return 'Moyen';
    return 'À améliorer';
  }

  getDurationLabel(days: number): string {
    if (days >= 7) return 'Long séjour';
    if (days >= 3) return 'Moyen séjour';
    return 'Court séjour';
  }

  getDurationVisual(): number {
    const days = this.stats()?.avgRentalDays || 0;
    return Math.min(100, (days / 14) * 100);
  }

  formatNumber(n: number): string {
    return n.toLocaleString('fr-FR');
  }

  getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      ECONOMIQUE: 'Économique',
      COMPACTE: 'Compacte',
      BERLINE: 'Berline',
      SUV: 'SUV',
      PREMIUM: 'Premium',
      UTILITAIRE: 'Utilitaire',
    };
    return labels[cat] || cat;
  }

  getCategoryColor(index: number): string {
    return this.categoryColors[index % this.categoryColors.length];
  }
}
