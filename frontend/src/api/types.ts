export type UserRole = 'admin' | 'driver';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export type TripStatus = 'pending' | 'ready' | 'in_progress' | 'closed';

export interface Passenger {
  id: string;
  tripId: string;
  name: string;
  document: string;
  boarded: boolean;
}

export interface Driver {
  id: string;
  fullName: string;
  email: string;
}

export interface Trip {
  id: string;
  code: string;
  origin: string;
  destination: string;
  driverId: string;
  driver: Driver;
  status: TripStatus;
  signature: string | null;
  startedAt: string | null;
  closedAt: string | null;
  passengers: Passenger[];
  createdAt: string;
}

export type ExpenseType = 'combustible' | 'peaje' | 'reparacion' | 'otro';
export type IncidentType = 'retraso' | 'problema_pasajero' | 'desvio' | 'otro';

export interface Expense {
  id: string;
  tripId: string;
  type: ExpenseType;
  amount: number;
  concept: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  tripId: string;
  type: IncidentType;
  description: string;
  createdAt: string;
}

export interface TripReport {
  trip: Pick<Trip, 'id' | 'code' | 'origin' | 'destination' | 'status' | 'startedAt' | 'closedAt'> & {
    driver: { id: string; fullName: string } | null;
  };
  passengers: { total: number; boarded: number; list: Passenger[] };
  expenses: { total: number; items: Expense[] };
  incidents: { total: number; items: Incident[] };
}

export interface PaginatedTrips {
  data: Trip[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
