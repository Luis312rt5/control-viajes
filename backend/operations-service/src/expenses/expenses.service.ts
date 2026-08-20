import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { TripsClientService } from '../trips-client/trips-client.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepo: Repository<Expense>,
    private readonly tripsClient: TripsClientService,
  ) {}

  async create(dto: CreateExpenseDto): Promise<Expense> {
    // Regla de negocio: no se pueden reportar gastos de un viaje que no ha iniciado
    await this.tripsClient.assertTripInProgress(dto.tripId);

    const expense = this.expensesRepo.create(dto);
    return this.expensesRepo.save(expense);
  }

  async findByTrip(tripId: string): Promise<Expense[]> {
    return this.expensesRepo.find({
      where: { tripId },
      order: { createdAt: 'DESC' },
    });
  }

  async totalByTrip(tripId: string): Promise<number> {
    const expenses = await this.findByTrip(tripId);
    return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }
}
