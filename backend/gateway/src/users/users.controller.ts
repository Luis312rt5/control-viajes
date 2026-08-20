import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TripsServiceClient } from '../clients/trips-service.client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly tripsClient: TripsServiceClient) {}

  @Get('drivers')
  @Roles('admin')
  findDrivers() {
    return this.tripsClient.findDrivers();
  }
}
