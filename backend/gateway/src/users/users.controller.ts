import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    @Inject('TRIPS_SERVICE') private readonly tripsClient: ClientProxy,
  ) {}

  @Get('drivers')
  @Roles('admin')
  findDrivers() {
    return firstValueFrom(
      this.tripsClient.send('users.findDrivers', {}).pipe(timeout(5000)),
    );
  }
}
