import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from '../entities/trip.entity';
import { Passenger } from '../entities/passenger.entity';
import {
  CreateTripDto,
  PaginationDto,
} from './dto/create-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip) private readonly tripsRepo: Repository<Trip>,
    @InjectRepository(Passenger)
    private readonly passengersRepo: Repository<Passenger>,
  ) {}

  async create(dto: CreateTripDto): Promise<Trip> {
    const count = await this.tripsRepo.count();
    const code = `VJ-${String(count + 1).padStart(4, '0')}`;

    const trip = this.tripsRepo.create({
      code,
      origin: dto.origin,
      destination: dto.destination,
      driverId: dto.driverId,
      status: TripStatus.PENDING,
      passengers: dto.passengers.map((p) =>
        this.passengersRepo.create({ name: p.name, document: p.document }),
      ),
    });

    return this.tripsRepo.save(trip);
  }

  async findAll(pagination: PaginationDto) {
    const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
    const limit =
      pagination.limit && pagination.limit > 0 ? pagination.limit : 10;

    const [data, total] = await this.tripsRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.tripsRepo.findOne({ where: { id } });
    if (!trip) throw new NotFoundException('Viaje no encontrado');
    return trip;
  }

  async findByDriver(driverId: string): Promise<Trip[]> {
    return this.tripsRepo.find({
      where: { driverId },
      order: { createdAt: 'DESC' },
    });
  }

  async checkInPassenger(
    tripId: string,
    passengerId: string,
    boarded: boolean,
  ): Promise<Trip> {
    const trip = await this.findOne(tripId);
    if (trip.status === TripStatus.CLOSED) {
      throw new BadRequestException('El viaje ya está cerrado');
    }
    const passenger = await this.passengersRepo.findOne({
      where: { id: passengerId, tripId },
    });
    if (!passenger) throw new NotFoundException('Pasajero no encontrado');

    passenger.boarded = boarded;
    await this.passengersRepo.save(passenger);
    return this.findOne(tripId);
  }

  async sign(tripId: string, signature: string): Promise<Trip> {
    const trip = await this.findOne(tripId);
    if (trip.status === TripStatus.CLOSED) {
      throw new BadRequestException('El viaje ya está cerrado');
    }
    if (!signature) {
      throw new BadRequestException('La firma es obligatoria');
    }

    trip.signature = signature;
    // Si ya tiene firma, queda listo para arrancar (independiente del check de pasajeros,
    // que es responsabilidad del conductor validar visualmente antes de firmar)
    trip.status = TripStatus.READY;
    return this.tripsRepo.save(trip);
  }

  async start(tripId: string): Promise<Trip> {
    const trip = await this.findOne(tripId);

    if (!trip.signature) {
      throw new BadRequestException(
        'No se puede iniciar el viaje: falta la firma digital del despachador/cliente',
      );
    }
    if (trip.status === TripStatus.IN_PROGRESS) {
      throw new BadRequestException('El viaje ya está en curso');
    }
    if (trip.status === TripStatus.CLOSED) {
      throw new BadRequestException('El viaje ya está cerrado');
    }

    trip.status = TripStatus.IN_PROGRESS;
    trip.startedAt = new Date();
    return this.tripsRepo.save(trip);
  }

  async close(tripId: string): Promise<Trip> {
    const trip = await this.findOne(tripId);
    if (trip.status !== TripStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Solo se puede cerrar un viaje que está en curso',
      );
    }
    trip.status = TripStatus.CLOSED;
    trip.closedAt = new Date();
    return this.tripsRepo.save(trip);
  }

  /** Usado internamente por operations-service para validar antes de aceptar gastos/novedades */
  async getStatus(tripId: string): Promise<{ status: TripStatus }> {
    const trip = await this.findOne(tripId);
    return { status: trip.status };
  }
}
