export type VehicleStatus   = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';
export type VehicleCategory = 'ECONOMIQUE' | 'COMPACTE' | 'BERLINE' | 'SUV' | 'PREMIUM' | 'UTILITAIRE';
export type Transmission    = 'MANUAL' | 'AUTO';
export type FuelType        = 'ESSENCE' | 'DIESEL' | 'HYBRIDE' | 'ELECTRIQUE';

export interface Vehicle {
  id:                 number;
  brand:              string;
  model:              string;
  year:               number;
  licensePlate:       string;
  vin?:               string;
  color?:             string;
  category:           VehicleCategory;
  transmission:       Transmission;
  fuelType:           FuelType;
  seats:              number;
  doors?:             number;
  powerHp?:           number;
  engineCc?:          number;
  consumptionPer100km?: number;
  pricePerDay:        number;
  pricePerWeek?:      number;
  pricePerMonth?:     number;
  deposit?:           number;
  kmIncludedPerDay?:  number;
  pricePerExtraKm?:   number;
  currentMileage?:       number;
  lastOilChangeKm?:      number;
  insuranceExpiry?:      string;
  registrationExpiry?:   string;
  technicalVisitExpiry?: string;
  status:                VehicleStatus;
  description?:          string;
  hasImage?:             boolean;
  createdAt?:            string;
  updatedAt?:            string;
}
