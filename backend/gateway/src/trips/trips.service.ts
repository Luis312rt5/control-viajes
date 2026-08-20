import { Injectable } from '@nestjs/common';
import { TripsServiceClient } from '../clients/trips-service.client';
import { OperationsServiceClient } from '../clients/operations-service.client';
import { CreateTripDto, PaginationQueryDto } from './dto/trips.dto';

@Injectable()
export class TripsService {
  constructor(
    private readonly tripsClient: TripsServiceClient,
    private readonly operationsClient: OperationsServiceClient,
  ) {}

  create(dto: CreateTripDto, driverId: string) {
    // El admin puede especificar el driverId directamente en el DTO
    return this.tripsClient.createTrip(dto);
  }

  findAll(pagination: PaginationQueryDto) {
    return this.tripsClient.findAllTrips(pagination);
  }

  findOne(id: string) {
    return this.tripsClient.findOneTrip(id);
  }

  findByDriver(driverId: string) {
    return this.tripsClient.findTripsByDriver(driverId);
  }

  checkInPassenger(tripId: string, passengerId: string, boarded: boolean) {
    return this.tripsClient.checkInPassenger(tripId, passengerId, boarded);
  }

  sign(tripId: string, signature: string) {
    return this.tripsClient.signTrip(tripId, signature);
  }

  start(tripId: string) {
    return this.tripsClient.startTrip(tripId);
  }

  async close(tripId: string) {
    await this.tripsClient.closeTrip(tripId);
    return this.buildReport(tripId);
  }

  /** Agrega datos de trips-service + operations-service en un solo reporte */
  async buildReport(tripId: string) {
    const [trip, expenses, incidents, totalExpenses] = await Promise.all([
      this.tripsClient.findOneTrip(tripId) as Promise<any>,
      this.operationsClient.findExpensesByTrip(tripId) as Promise<any[]>,
      this.operationsClient.findIncidentsByTrip(tripId),
      this.operationsClient.totalExpensesByTrip(tripId),
    ]);

    const totalPassengers = trip.passengers?.length || 0;
    const boardedPassengers =
      trip.passengers?.filter((p: any) => p.boarded).length || 0;

    return {
      trip: {
        id: trip.id,
        code: trip.code,
        origin: trip.origin,
        destination: trip.destination,
        status: trip.status,
        driver: trip.driver
          ? { id: trip.driver.id, fullName: trip.driver.fullName }
          : null,
        startedAt: trip.startedAt,
        closedAt: trip.closedAt,
      },
      passengers: {
        total: totalPassengers,
        boarded: boardedPassengers,
        list: trip.passengers,
      },
      expenses: {
        total: totalExpenses,
        items: expenses,
      },
      incidents: {
        total: incidents.length,
        items: incidents,
      },
    };
  }
}
