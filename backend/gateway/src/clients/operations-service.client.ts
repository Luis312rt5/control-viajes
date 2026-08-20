import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InternalHttpClient } from './internal-http-client';

@Injectable()
export class OperationsServiceClient extends InternalHttpClient {
  constructor(config: ConfigService) {
    super(
      config.get('OPERATIONS_SERVICE_URL', 'http://localhost:3002/internal'),
      config.get('INTERNAL_API_KEY', 'dev_internal_key_change_me'),
    );
  }

  createExpense(dto: unknown) {
    return this.post('/expenses', dto);
  }

  findExpensesByTrip(tripId: string) {
    return this.get(`/expenses/trip/${tripId}`);
  }

  totalExpensesByTrip(tripId: string) {
    return this.get<number>(`/expenses/trip/${tripId}/total`);
  }

  createIncident(dto: unknown) {
    return this.post('/incidents', dto);
  }

  findIncidentsByTrip(tripId: string) {
    return this.get<any[]>(`/incidents/trip/${tripId}`);
  }
}
