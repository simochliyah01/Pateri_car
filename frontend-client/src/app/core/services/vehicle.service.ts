import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehicle, VehicleStatus, VehicleCategory } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/vehicles`;

  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.base);
  }

  getVehicleById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.base}/${id}`);
  }

  getByStatus(status: VehicleStatus): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.base}/by-status`, {
      params: new HttpParams().set('status', status),
    });
  }

  getByCategory(category: VehicleCategory): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.base}/by-category`, {
      params: new HttpParams().set('category', category),
    });
  }

  createVehicle(vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.base, vehicle);
  }

  updateVehicle(id: number, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.base}/${id}`, vehicle);
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
