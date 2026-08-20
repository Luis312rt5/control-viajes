import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto, PaginationDto } from './dto/create-trip.dto';

// Rutas internas (llamadas solo por gateway y operations-service, nunca
// directamente por el navegador). Antes esto era un microservicio TCP puro;
// ver nota en main.ts sobre por qué ahora es HTTP protegido con x-internal-key.
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  create(@Body() dto: CreateTripDto) {
    return this.tripsService.create(dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.tripsService.findAll(pagination);
  }

  @Get('driver/:driverId')
  findByDriver(@Param('driverId') driverId: string) {
    return this.tripsService.findByDriver(driverId);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.tripsService.getStatus(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Patch(':id/passengers/:passengerId/checkin')
  checkIn(
    @Param('id') id: string,
    @Param('passengerId') passengerId: string,
    @Body('boarded') boarded: boolean,
  ) {
    return this.tripsService.checkInPassenger(id, passengerId, boarded);
  }

  @Post(':id/sign')
  sign(@Param('id') id: string, @Body('signature') signature: string) {
    return this.tripsService.sign(id, signature);
  }

  @Post(':id/start')
  start(@Param('id') id: string) {
    return this.tripsService.start(id);
  }

  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.tripsService.close(id);
  }
}
