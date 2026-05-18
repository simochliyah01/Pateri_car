import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { VehicleService } from './vehicle.service';
import { ReservationService, ReservationDto } from './reservation.service';
import { Vehicle } from '../models/vehicle.model';

export type StatsPeriod = '7d' | '30d' | '90d' | 'all';

export interface AdvancedStats {
  period: StatsPeriod;
  periodLabel: string;
  totalRevenue: number;
  revenueChangePercent: number;
  totalBookings: number;
  bookingsChange: number;
  conversionRate: number;
  avgRentalDays: number;
  pendingCount: number;
  confirmedCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  fleetUtilization: number;
  totalClients: number;
  revenueByDay: { date: string; label: string; revenue: number }[];
  bookingsByDayOfWeek: { day: string; count: number }[];
  categoryBreakdown: { category: string; count: number; revenue: number }[];
  topVehicles: { vehicleId: number; brand: string; model: string; count: number; revenue: number }[];
  recentReservations: ReservationDto[];
}

export interface ActivityItem {
  id: string;
  type: 'reservation' | 'payment' | 'client' | 'cancellation' | 'vehicle';
  title: string;
  subtitle: string;
  timestamp: string;
  meta?: {
    icon: string;
    color: 'teal' | 'blue' | 'purple' | 'amber' | 'red';
  };
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalReservations: number;
  pendingCount: number;
  confirmedCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  fleetUtilization: number;
  totalClients: number;
  revenueByDay: { date: string; revenue: number }[];
  recentReservations: ReservationDto[];
  activityFeed: ActivityItem[];
  newClientsThisWeek: number;
  revenueLast7Days: number[];
  bookingsLast7Days: number[];
}

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private vehicleService = inject(VehicleService);
  private reservationService = inject(ReservationService);

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      vehicles: this.vehicleService.getAllVehicles(),
      reservations: this.reservationService.getAllReservations(undefined, 0, 200)
        .pipe(map(p => p.content)),
    }).pipe(
      map(({ vehicles, reservations }) =>
        this.computeStats(vehicles, reservations))
    );
  }

  getAdvancedStats(period: StatsPeriod = '30d'): Observable<AdvancedStats> {
    return forkJoin({
      vehicles: this.vehicleService.getAllVehicles(),
      reservations: this.reservationService.getAllReservations(undefined, 0, 500)
        .pipe(map(p => p.content)),
    }).pipe(
      map(({ vehicles, reservations }) =>
        this.computeAdvanced(vehicles, reservations, period))
    );
  }

  private computeStats(vehicles: Vehicle[], reservations: ReservationDto[]): DashboardStats {
    const now = new Date();
    const byStatus = (status: string) =>
      reservations.filter(r => r.status === status).length;

    const totalRevenue = reservations
      .filter(r => ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(r.status))
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    const revenueByDay: { date: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRevenue = reservations
        .filter(r => r.createdAt?.startsWith(dateStr)
          && ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(r.status))
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
      revenueByDay.push({
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        revenue: dayRevenue,
      });
    }

    const last7 = revenueByDay.reduce((s, d) => s + d.revenue, 0);
    const revenueChange = totalRevenue > 0
      ? Math.round((last7 / totalRevenue) * 100)
      : 0;

    const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
    const rentedVehicles = vehicles.filter(v => v.status === 'RENTED').length;
    const fleetUtilization = vehicles.length > 0
      ? Math.round((rentedVehicles / vehicles.length) * 100)
      : 0;

    const clientIds = new Set(reservations.map(r => r.clientId));
    const recentReservations = [...reservations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const activityFeed: ActivityItem[] = [...reservations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(r => ({
        id: 'res-' + r.id,
        type: r.status === 'CANCELLED' ? 'cancellation' as const : 'reservation' as const,
        title: r.status === 'CANCELLED'
          ? `Réservation annulée par ${r.clientName}`
          : `Nouvelle réservation par ${r.clientName}`,
        subtitle: `${r.vehicleBrand} ${r.vehicleModel} · ${r.totalPrice} DH`,
        timestamp: r.createdAt || new Date().toISOString(),
        meta: {
          icon: r.status === 'CANCELLED' ? 'x-circle' : 'calendar-plus',
          color: r.status === 'CANCELLED' ? 'red' as const : 'teal' as const,
        },
      }));

    const revenueLast7Days = revenueByDay.map(d => d.revenue);

    const bookingsLast7Days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = reservations.filter(r => r.createdAt?.startsWith(dateStr)).length;
      bookingsLast7Days.push(count);
    }

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newClientsThisWeek = reservations
      .filter(r => new Date(r.createdAt) >= weekAgo)
      .map(r => r.clientId)
      .filter((id, i, arr) => arr.indexOf(id) === i)
      .length;

    return {
      totalRevenue,
      revenueChange,
      totalReservations: reservations.length,
      pendingCount: byStatus('PENDING'),
      confirmedCount: byStatus('CONFIRMED'),
      inProgressCount: byStatus('IN_PROGRESS'),
      completedCount: byStatus('COMPLETED'),
      cancelledCount: byStatus('CANCELLED'),
      totalVehicles: vehicles.length,
      availableVehicles,
      rentedVehicles,
      fleetUtilization,
      totalClients: clientIds.size,
      revenueByDay,
      recentReservations,
      activityFeed,
      newClientsThisWeek,
      revenueLast7Days,
      bookingsLast7Days,
    };
  }

  private computeAdvanced(
    vehicles: Vehicle[],
    allReservations: ReservationDto[],
    period: StatsPeriod
  ): AdvancedStats {
    const now = new Date();
    const periodDays = period === '7d' ? 7
      : period === '30d' ? 30
      : period === '90d' ? 90
      : 365 * 10;

    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - periodDays);

    const reservations = period === 'all'
      ? allReservations
      : allReservations.filter(r => new Date(r.createdAt) >= periodStart);

    const prevStart = new Date(periodStart);
    prevStart.setDate(prevStart.getDate() - periodDays);
    const prevReservations = period === 'all'
      ? []
      : allReservations.filter(r => {
          const d = new Date(r.createdAt);
          return d >= prevStart && d < periodStart;
        });

    const periodLabel = period === '7d' ? '7 derniers jours'
      : period === '30d' ? '30 derniers jours'
      : period === '90d' ? '90 derniers jours'
      : 'Toute la période';

    const revenueOf = (rs: ReservationDto[]) => rs
      .filter(r => ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(r.status))
      .reduce((s, r) => s + (r.totalPrice || 0), 0);

    const totalRevenue = revenueOf(reservations);
    const prevRevenue = revenueOf(prevReservations);
    const revenueChangePercent = prevRevenue > 0
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
      : (totalRevenue > 0 ? 100 : 0);

    const byStatus = (status: string) =>
      reservations.filter(r => r.status === status).length;

    const successful = byStatus('CONFIRMED') + byStatus('IN_PROGRESS') + byStatus('COMPLETED');
    const conversionRate = reservations.length > 0
      ? Math.round((successful / reservations.length) * 100)
      : 0;

    const withDuration = reservations.filter(r => r.durationDays && r.durationDays > 0);
    const avgRentalDays = withDuration.length > 0
      ? Math.round((withDuration.reduce((s, r) => s + r.durationDays, 0) / withDuration.length) * 10) / 10
      : 0;

    // Revenue by day
    const numDays = Math.min(periodDays, 30);
    const step = Math.max(1, Math.floor(periodDays / numDays));
    const revenueByDay: { date: string; label: string; revenue: number }[] = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - (i * step));
      const dateStr = d.toISOString().split('T')[0];
      const dayRevenue = reservations
        .filter(r => r.createdAt?.startsWith(dateStr)
          && ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(r.status))
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
      revenueByDay.push({
        date: dateStr,
        label: d.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: numDays > 14 ? '2-digit' : 'short',
        }),
        revenue: dayRevenue,
      });
    }

    // Bookings by day of week (Mon=0 … Sun=6)
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const bookingsByDayOfWeek = dayNames.map(day => ({ day, count: 0 }));
    reservations.forEach(r => {
      const dayIdx = (new Date(r.createdAt).getDay() + 6) % 7;
      bookingsByDayOfWeek[dayIdx].count++;
    });

    // Category breakdown
    const catMap = new Map<string, { count: number; revenue: number }>();
    reservations.forEach(r => {
      const v = vehicles.find(vv => vv.id === r.vehicleId);
      if (!v) return;
      const entry = catMap.get(v.category) ?? { count: 0, revenue: 0 };
      entry.count++;
      if (['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(r.status)) {
        entry.revenue += r.totalPrice || 0;
      }
      catMap.set(v.category, entry);
    });
    const categoryBreakdown = Array.from(catMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.count - a.count);

    // Top vehicles
    const vehMap = new Map<number, { brand: string; model: string; count: number; revenue: number }>();
    reservations.forEach(r => {
      const entry = vehMap.get(r.vehicleId) ?? {
        brand: r.vehicleBrand,
        model: r.vehicleModel,
        count: 0,
        revenue: 0,
      };
      entry.count++;
      if (['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(r.status)) {
        entry.revenue += r.totalPrice || 0;
      }
      vehMap.set(r.vehicleId, entry);
    });
    const topVehicles = Array.from(vehMap.entries())
      .map(([vehicleId, data]) => ({ vehicleId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
    const rentedVehicles = vehicles.filter(v => v.status === 'RENTED').length;
    const fleetUtilization = vehicles.length > 0
      ? Math.round((rentedVehicles / vehicles.length) * 100)
      : 0;

    const clientIds = new Set(reservations.map(r => r.clientId));
    const recentReservations = [...reservations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      period,
      periodLabel,
      totalRevenue,
      revenueChangePercent,
      totalBookings: reservations.length,
      bookingsChange: reservations.length - prevReservations.length,
      conversionRate,
      avgRentalDays,
      pendingCount: byStatus('PENDING'),
      confirmedCount: byStatus('CONFIRMED'),
      inProgressCount: byStatus('IN_PROGRESS'),
      completedCount: byStatus('COMPLETED'),
      cancelledCount: byStatus('CANCELLED'),
      totalVehicles: vehicles.length,
      availableVehicles,
      rentedVehicles,
      fleetUtilization,
      totalClients: clientIds.size,
      revenueByDay,
      bookingsByDayOfWeek,
      categoryBreakdown,
      topVehicles,
      recentReservations,
    };
  }
}
