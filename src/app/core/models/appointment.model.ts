import { UserCentreSoin } from "./user-centre-soin.model";
import { User } from "./user.model";

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: number;
  client: User;
  service: { id: number; name: string; price: number; durationMin: number };
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  queuePosition?: number;
  notes?: string;
  createdAt: string;
  userCentreSoin: UserCentreSoin;
}

export interface QueuePosition {
  appointmentId: number;
  status: AppointmentStatus;
  startTime: string;
  queuePosition: number;
  peopleAhead: number;
}

export interface BookAppointmentRequest {
  userCentreSoinId: number;
  serviceId: number;
  startTime: string;
  notes?: string;
}

export interface BarberBookRequest {
  clientId: number;
  serviceId: number;
  startTime: string;
  notes?: string;
}
