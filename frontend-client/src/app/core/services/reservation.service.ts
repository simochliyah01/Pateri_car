import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type PickupLocation = 'AGENCE' | 'GARE' | 'DOMICILE';
export type OptionType = 'GPS' | 'CHILD_SEAT' | 'ADDITIONAL_DRIVER' | 'FULL_INSURANCE';
export type ReservationStatus =
  'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTE';

export interface CreateReservationRequest {
  vehicleId: number;
  pickupLocation: PickupLocation;
  startDate: string;
  endDate: string;
  internalNotes?: string;
  options?: { optionType: OptionType; quantity: number }[];
}

export interface ReservationOptionDto {
  id: number;
  optionType: OptionType;
  pricePerDay: number;
  totalPrice: number;
}

export interface ReservationDto {
  id: number;
  reservationNumber: string;
  clientId: number;
  clientName: string;
  clientEmail: string;
  vehicleId: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleLicensePlate: string;
  pickupLocation: PickupLocation;
  startDate: string;
  endDate: string;
  durationDays: number;
  basePrice: number;
  totalPrice: number;
  status: ReservationStatus;
  internalNotes?: string;
  confirmedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  options: ReservationOptionDto[];
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservations`;

  create(request: CreateReservationRequest): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(this.apiUrl, request);
  }

  getMyReservations(): Observable<ReservationDto[]> {
    return this.http.get<ReservationDto[]>(`${this.apiUrl}/me`);
  }

  cancel(id: number, reason: string): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(
      `${this.apiUrl}/${id}/cancel`,
      { reason }
    );
  }
}
