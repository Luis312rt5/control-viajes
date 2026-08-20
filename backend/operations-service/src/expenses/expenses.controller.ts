import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @MessagePattern('expenses.create')
  create(@Payload() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  @MessagePattern('expenses.findByTrip')
  findByTrip(@Payload() data: { tripId: string }) {
    return this.expensesService.findByTrip(data.tripId);
  }

  @MessagePattern('expenses.totalByTrip')
  totalByTrip(@Payload() data: { tripId: string }) {
    return this.expensesService.totalByTrip(data.tripId);
  }
}
