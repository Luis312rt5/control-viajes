import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OperationsService } from './operations.service';
import { CreateExpenseDto, CreateIncidentDto } from './dto/operations.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post('expenses')
  @Roles('driver')
  createExpense(@Body() dto: CreateExpenseDto) {
    return this.operationsService.createExpense(dto);
  }

  @Get('trips/:tripId/expenses')
  @Roles('admin', 'driver')
  findExpenses(@Param('tripId') tripId: string) {
    return this.operationsService.findExpensesByTrip(tripId);
  }

  @Post('incidents')
  @Roles('driver')
  createIncident(@Body() dto: CreateIncidentDto) {
    return this.operationsService.createIncident(dto);
  }

  @Get('trips/:tripId/incidents')
  @Roles('admin', 'driver')
  findIncidents(@Param('tripId') tripId: string) {
    return this.operationsService.findIncidentsByTrip(tripId);
  }
}
