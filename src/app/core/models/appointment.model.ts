export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: number;
  barber: { id: number; shopName: string };
  client: { id: number; firstName: string; lastName: string; phone?: string };
  service: { id: number; name: string; price: number; durationMin: number };
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  queuePosition?: number;
  notes?: string;
  createdAt: string;
}

export interface QueuePosition {
  appointmentId: number;
  status: AppointmentStatus;
  startTime: string;
  queuePosition: number;
  peopleAhead: number;
}

export interface BookAppointmentRequest {
  barberId: number;
  serviceId: number;
  startTime: string;
  notes?: string;
}
