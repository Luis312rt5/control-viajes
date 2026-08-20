import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { CreateTripDto, PaginationQueryDto } from './dto/trips.dto';

@Injectable()
export class TripsService {
  constructor(
    @Inject('TRIPS_SERVICE') private readonly tripsClient: ClientProxy,
    @Inject('OPERATIONS_SERVICE')
    private readonly operationsClient: ClientProxy,
  ) {}

  private send<T>(client: ClientProxy, pattern: string, data: any) {
    return firstValueFrom(client.send<T>(pattern, data).pipe(timeout(5000)));
  }

  create(dto: CreateTripDto, driverId: string) {
    // El admin puede especificar el driverId directamente en el DTO
    return this.send(this.tripsClient, 'trips.create', dto);
  }

  findAll(pagination: PaginationQueryDto) {
    return this.send(this.tripsClient, 'trips.findAll', pagination);
  }

  findOne(id: string) {
    return this.send(this.tripsClient, 'trips.findOne', { id });
  }

  findByDriver(driverId: string) {
    return this.send(this.tripsClient, 'trips.findByDriver', { driverId });
  }

  checkInPassenger(tripId: string, passengerId: string, boarded: boolean) {
    return this.send(this.tripsClient, 'trips.checkInPassenger', {
      tripId,
      passengerId,
      boarded,
    });
  }

  sign(tripId: string, signature: string) {
    return this.send(this.tripsClient, 'trips.sign', { tripId, signature });
  }

  start(tripId: string) {
    return this.send(this.tripsClient, 'trips.start', { tripId });
  }

  async close(tripId: string) {
    await this.send(this.tripsClient, 'trips.close', { tripId });
    return this.buildReport(tripId);
  }

  /** Agrega datos de trips-service + operations-service en un solo reporte */
  async buildReport(tripId: string) {
    const [trip, expenses, incidents, totalExpenses] = await Promise.all([
      this.send<any>(this.tripsClient, 'trips.findOne', { id: tripId }),
      this.send<any[]>(this.operationsClient, 'expenses.findByTrip', {
        tripId,
      }),
      this.send<any[]>(this.operationsClient, 'incidents.findByTrip', {
        tripId,
      }),
      this.send<number>(this.operationsClient, 'expenses.totalByTrip', {
        tripId,
      }),
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
