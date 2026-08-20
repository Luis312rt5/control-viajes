import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

// Rutas internas (llamadas solo por el gateway). Ver nota en main.ts.
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  @Get('trip/:tripId/total')
  totalByTrip(@Param('tripId') tripId: string) {
    return this.expensesService.totalByTrip(tripId);
  }

  @Get('trip/:tripId')
  findByTrip(@Param('tripId') tripId: string) {
    return this.expensesService.findByTrip(tripId);
  }
}
