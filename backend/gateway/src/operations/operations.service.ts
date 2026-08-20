import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { CreateExpenseDto, CreateIncidentDto } from './dto/operations.dto';

@Injectable()
export class OperationsService {
  constructor(
    @Inject('OPERATIONS_SERVICE')
    private readonly operationsClient: ClientProxy,
  ) {}

  private send<T>(pattern: string, data: any) {
    return firstValueFrom(
      this.operationsClient.send<T>(pattern, data).pipe(timeout(5000)),
    );
  }

  createExpense(dto: CreateExpenseDto) {
    return this.send('expenses.create', dto);
  }

  findExpensesByTrip(tripId: string) {
    return this.send('expenses.findByTrip', { tripId });
  }

  createIncident(dto: CreateIncidentDto) {
    return this.send('incidents.create', dto);
  }

  findIncidentsByTrip(tripId: string) {
    return this.send('incidents.findByTrip', { tripId });
  }
}
