import { Injectable, signal } from '@angular/core';

export interface DayHours {
  open: boolean;
  start: string;
  end: string;
}

export interface AgencySettings {
  agencyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  taxId?: string;

  hours: {
    mon: DayHours;
    tue: DayHours;
    wed: DayHours;
    thu: DayHours;
    fri: DayHours;
    sat: DayHours;
    sun: DayHours;
  };

  feeAgence: number;
  feeGare: number;
  feeDomicile: number;

  pricingGps: number;
  pricingChildSeat: number;
  pricingAdditionalDriver: number;
  pricingFullInsurance: number;

  minRentalDays: number;
  maxRentalDays: number;
  cancellationHours: number;

  notifyEmail: boolean;
  notifySms: boolean;
}

const DEFAULT_SETTINGS: AgencySettings = {
  agencyName: 'PATERI CAR',
  email: 'contact@patericar.ma',
  phone: '+212 6XX XXX XXX',
  address: 'Avenue Mohammed V',
  city: 'Taza, Maroc',
  taxId: '',

  hours: {
    mon: { open: true,  start: '08:00', end: '20:00' },
    tue: { open: true,  start: '08:00', end: '20:00' },
    wed: { open: true,  start: '08:00', end: '20:00' },
    thu: { open: true,  start: '08:00', end: '20:00' },
    fri: { open: true,  start: '08:00', end: '20:00' },
    sat: { open: true,  start: '09:00', end: '18:00' },
    sun: { open: false, start: '10:00', end: '16:00' },
  },

  feeAgence: 0,
  feeGare: 50,
  feeDomicile: 100,

  pricingGps: 50,
  pricingChildSeat: 30,
  pricingAdditionalDriver: 100,
  pricingFullInsurance: 80,

  minRentalDays: 1,
  maxRentalDays: 365,
  cancellationHours: 24,

  notifyEmail: true,
  notifySms: false,
};

const STORAGE_KEY = 'pateri_settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  settings = signal<AgencySettings>(this.load());

  private load(): AgencySettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  save(settings: AgencySettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    this.settings.set(settings);
  }

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.settings.set({ ...DEFAULT_SETTINGS });
  }

  getDefaults(): AgencySettings {
    return { ...DEFAULT_SETTINGS };
  }
}
