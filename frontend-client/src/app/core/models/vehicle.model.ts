export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';
export type VehicleCategory = 'ECONOMY' | 'COMPACT' | 'SUV' | 'LUXURY' | 'VAN' | 'CONVERTIBLE';
export type TransmissionType = 'MANUAL' | 'AUTOMATIC';
export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  category: VehicleCategory;
  status: VehicleStatus;
  transmission: TransmissionType;
  fuelType: FuelType;
  seats: number;
  pricePerDay: number;
  mileage: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
