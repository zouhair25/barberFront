export interface DailyStats {
  date: string;
  revenue: number;
  totalAppointments: number;
}

export interface RevenuePoint {
  period: string;
  revenue: number;
  count: number;
}

export interface ServiceStats {
  name: string;
  category: string;
  count: number;
  revenue: number;
}

export interface ClientStats {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  visitCount: number;
  lastVisit: string;
}
