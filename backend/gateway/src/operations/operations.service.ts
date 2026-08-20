import { Injectable } from '@nestjs/common';
import { OperationsServiceClient } from '../clients/operations-service.client';
import { CreateExpenseDto, CreateIncidentDto } from './dto/operations.dto';

@Injectable()
export class OperationsService {
  constructor(private readonly operationsClient: OperationsServiceClient) {}

  createExpense(dto: CreateExpenseDto) {
    return this.operationsClient.createExpense(dto);
  }

  findExpensesByTrip(tripId: string) {
    return this.operationsClient.findExpensesByTrip(tripId);
  }

  createIncident(dto: CreateIncidentDto) {
    return this.operationsClient.createIncident(dto);
  }

  findIncidentsByTrip(tripId: string) {
    return this.operationsClient.findIncidentsByTrip(tripId);
  }
}
