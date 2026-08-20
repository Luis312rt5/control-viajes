import { apiClient } from './client';
import { Expense, ExpenseType, Incident, IncidentType } from './types';

export async function createExpense(payload: {
  tripId: string;
  type: ExpenseType;
  amount: number;
  concept: string;
}): Promise<Expense> {
  const { data } = await apiClient.post<Expense>('/expenses', payload);
  return data;
}

export async function fetchExpenses(tripId: string): Promise<Expense[]> {
  const { data } = await apiClient.get<Expense[]>(`/trips/${tripId}/expenses`);
  return data;
}

export async function createIncident(payload: {
  tripId: string;
  type: IncidentType;
  description: string;
}): Promise<Incident> {
  const { data } = await apiClient.post<Incident>('/incidents', payload);
  return data;
}

export async function fetchIncidents(tripId: string): Promise<Incident[]> {
  const { data } = await apiClient.get<Incident[]>(`/trips/${tripId}/incidents`);
  return data;
}
