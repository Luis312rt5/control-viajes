import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

// Rutas internas (llamadas solo por el gateway). Ver nota en main.ts.
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() dto: CreateIncidentDto) {
    return this.incidentsService.create(dto);
  }

  @Get('trip/:tripId')
  findByTrip(@Param('tripId') tripId: string) {
    return this.incidentsService.findByTrip(tripId);
  }
}
