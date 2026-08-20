import { apiClient } from './client';
import { PaginatedTrips, Trip, TripReport } from './types';

export interface CreateTripPayload {
  origin: string;
  destination: string;
  driverId: string;
  passengers: { name: string; document: string }[];
}

export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  const { data } = await apiClient.post<Trip>('/trips', payload);
  return data;
}

export async function fetchTrips(page = 1, limit = 10): Promise<PaginatedTrips> {
  const { data } = await apiClient.get<PaginatedTrips>('/trips', { params: { page, limit } });
  return data;
}

export async function fetchMyTrips(): Promise<Trip[]> {
  const { data } = await apiClient.get<Trip[]>('/trips/mine');
  return data;
}

export async function fetchTrip(id: string): Promise<Trip> {
  const { data } = await apiClient.get<Trip>(`/trips/${id}`);
  return data;
}

export async function fetchTripReport(id: string): Promise<TripReport> {
  const { data } = await apiClient.get<TripReport>(`/trips/${id}/report`);
  return data;
}

export async function checkInPassenger(
  tripId: string,
  passengerId: string,
  boarded: boolean,
): Promise<Trip> {
  const { data } = await apiClient.patch<Trip>(
    `/trips/${tripId}/passengers/${passengerId}/checkin`,
    { boarded },
  );
  return data;
}

export async function signTrip(tripId: string, signature: string): Promise<Trip> {
  const { data } = await apiClient.post<Trip>(`/trips/${tripId}/sign`, { signature });
  return data;
}

export async function startTrip(tripId: string): Promise<Trip> {
  const { data } = await apiClient.post<Trip>(`/trips/${tripId}/start`, {});
  return data;
}

export async function closeTrip(tripId: string): Promise<TripReport> {
  const { data } = await apiClient.post<TripReport>(`/trips/${tripId}/close`, {});
  return data;
}
