import { apiClient } from './client';
import { Driver } from './types';

export async function fetchDrivers(): Promise<Driver[]> {
  const { data } = await apiClient.get<Driver[]>('/users/drivers');
  return data;
}
