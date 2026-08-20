import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TripsService } from './trips.service';
import { CheckInDto, CreateTripDto, PaginationQueryDto, SignTripDto } from './dto/trips.dto';

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  /**
   * Un conductor solo puede operar viajes que le fueron asignados a él.
   * El admin no tiene esta restricción. Se usa antes de cualquier acción
   * sensible sobre un viaje (ver detalle, check-in, firmar, iniciar, cerrar),
   * lo cual también protege el acceso vía QR: escanear el código de otro
   * conductor no le da acceso si el viaje no es suyo.
   */
  private async assertAccess(tripId: string, user: any) {
    if (user.role !== 'driver') return;
    const trip: any = await this.tripsService.findOne(tripId);
    if (trip.driverId !== user.userId) {
      throw new ForbiddenException('Este viaje no está asignado a tu usuario');
    }
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateTripDto, @CurrentUser() user: any) {
    return this.tripsService.create(dto, user.userId);
  }

  @Get()
  @Roles('admin')
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.tripsService.findAll(pagination);
  }

  @Get('mine')
  @Roles('driver')
  findMine(@CurrentUser() user: any) {
    return this.tripsService.findByDriver(user.userId);
  }

  @Get(':id')
  @Roles('admin', 'driver')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    await this.assertAccess(id, user);
    return this.tripsService.findOne(id);
  }

  @Get(':id/report')
  @Roles('admin', 'driver')
  async report(@Param('id') id: string, @CurrentUser() user: any) {
    await this.assertAccess(id, user);
    return this.tripsService.buildReport(id);
  }

  @Patch(':id/passengers/:passengerId/checkin')
  @Roles('driver')
  async checkIn(
    @Param('id') id: string,
    @Param('passengerId') passengerId: string,
    @Body() dto: CheckInDto,
    @CurrentUser() user: any,
  ) {
    await this.assertAccess(id, user);
    return this.tripsService.checkInPassenger(id, passengerId, dto.boarded);
  }

  @Post(':id/sign')
  @Roles('driver')
  async sign(@Param('id') id: string, @Body() dto: SignTripDto, @CurrentUser() user: any) {
    await this.assertAccess(id, user);
    return this.tripsService.sign(id, dto.signature);
  }

  @Post(':id/start')
  @Roles('driver')
  async start(@Param('id') id: string, @CurrentUser() user: any) {
    await this.assertAccess(id, user);
    return this.tripsService.start(id);
  }

  @Post(':id/close')
  @Roles('driver')
  async close(@Param('id') id: string, @CurrentUser() user: any) {
    await this.assertAccess(id, user);
    return this.tripsService.close(id);
  }
}

