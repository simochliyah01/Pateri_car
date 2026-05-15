export type ClientStatus = 'ACTIVE' | 'BLOCKED' | 'VIP';

export interface Client {
  id:               number;
  firstName:        string;
  lastName:         string;
  cinPassport?:     string;
  dateOfBirth?:     string;
  phone?:           string;
  email?:           string;
  address?:         string;
  city?:            string;
  status:           ClientStatus;
  isBlacklisted?:   boolean;
  blacklistReason?: string;
  createdAt?:       string;
  updatedAt?:       string;
  reservationCount?: number;
}
