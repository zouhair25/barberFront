export interface BarberPublic {
  id: number;
  shopName: string;
  bio?: string;
  address?: string;
  city?: string;
  phone?: string;
  queueCount: number;
  averageRating?: number;
  reviewCount: number;
  services?: BarberServicePublic[];
}

export interface BarberServicePublic {
  id: number;
  name: string;
  category: ServiceCategory;
  description?: string;
  price: number;
  durationMin: number;
}

export type ServiceCategory = 'MENS_CUT' | 'WOMENS_CUT' | 'BEARD' | 'TREATMENT' | 'OTHER';

export interface OpeningHours {
  id?: number;
  dayOfWeek: number;
  openTime?: string;
  closeTime?: string;
  closed: boolean;
  slotDurationMin: number;
}

export interface ClosingDay {
  id: number;
  closedDate: string;
  reason?: string;
}
