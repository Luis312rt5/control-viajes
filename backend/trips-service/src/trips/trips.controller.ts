import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TripsService } from './trips.service';
import {
  CheckInPassengerDto,
  CloseTripDto,
  CreateTripDto,
  PaginationDto,
  SignTripDto,
  StartTripDto,
} from './dto/create-trip.dto';

@Controller()
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @MessagePattern('trips.create')
  create(@Payload() dto: CreateTripDto) {
    return this.tripsService.create(dto);
  }

  @MessagePattern('trips.findAll')
  findAll(@Payload() pagination: PaginationDto) {
    return this.tripsService.findAll(pagination);
  }

  @MessagePattern('trips.findOne')
  findOne(@Payload() data: { id: string }) {
    return this.tripsService.findOne(data.id);
  }

  @MessagePattern('trips.findByDriver')
  findByDriver(@Payload() data: { driverId: string }) {
    return this.tripsService.findByDriver(data.driverId);
  }

  @MessagePattern('trips.checkInPassenger')
  checkIn(@Payload() dto: CheckInPassengerDto) {
    return this.tripsService.checkInPassenger(
      dto.tripId,
      dto.passengerId,
      dto.boarded,
    );
  }

  @MessagePattern('trips.sign')
  sign(@Payload() dto: SignTripDto) {
    return this.tripsService.sign(dto.tripId, dto.signature);
  }

  @MessagePattern('trips.start')
  start(@Payload() dto: StartTripDto) {
    return this.tripsService.start(dto.tripId);
  }

  @MessagePattern('trips.close')
  close(@Payload() dto: CloseTripDto) {
    return this.tripsService.close(dto.tripId);
  }

  // Consultado por operations-service antes de aceptar un gasto/novedad
  @MessagePattern('trips.getStatus')
  getStatus(@Payload() data: { tripId: string }) {
    return this.tripsService.getStatus(data.tripId);
  }
}
