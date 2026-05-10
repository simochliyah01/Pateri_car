import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle, VehicleStatus, VehicleCategory } from '../models/vehicle.model';
import { environment } from '../../../environments/environment';

export interface VehicleFilters {
  search?:        string;
  category?:      string[];
  fuelType?:      string[];
  transmission?:  string[];
  minPrice?:      number;
  maxPrice?:      number;
  status?:        string;
  sort?:          'priceAsc' | 'priceDesc' | 'newest' | 'name';
}

export interface AvailabilityResponse {
  vehicleId: number;
  available: boolean;
  daysCount: number;
  dailyRate: number;
  estimatedTotal: number;
  conflictingDates?: { from: string; to: string }[];
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http   = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vehicles`;
  private reservationsApi = `${environment.apiUrl}/reservations`;

  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

  getVehicleById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  getByStatus(status: VehicleStatus): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/by-status`, {
      params: new HttpParams().set('status', status),
    });
  }

  getByCategory(category: VehicleCategory): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/by-category`, {
      params: new HttpParams().set('category', category),
    });
  }

  /**
   * Client-side filtering. Filtering happens in the catalog component.
   * Switch to backend HttpParams for large fleets (1000+ vehicles).
   */
  getFilteredVehicles(_filters: VehicleFilters): Observable<Vehicle[]> {
    return this.getAllVehicles();
  }

  checkAvailability(
    vehicleId: number,
    startDate: string,
    endDate: string
  ): Observable<AvailabilityResponse> {
    return this.http.post<AvailabilityResponse>(
      `${this.reservationsApi}/availability/${vehicleId}`,
      { startDate, endDate }
    );
  }

  createVehicle(vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  updateVehicle(id: number, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, vehicle);
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
