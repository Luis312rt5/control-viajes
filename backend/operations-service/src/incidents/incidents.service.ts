import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from '../entities/incident.entity';
import { TripsClientService } from '../trips-client/trips-client.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentsRepo: Repository<Incident>,
    private readonly tripsClient: TripsClientService,
  ) {}

  async create(dto: CreateIncidentDto): Promise<Incident> {
    await this.tripsClient.assertTripInProgress(dto.tripId);
    const incident = this.incidentsRepo.create(dto);
    return this.incidentsRepo.save(incident);
  }

  async findByTrip(tripId: string): Promise<Incident[]> {
    return this.incidentsRepo.find({
      where: { tripId },
      order: { createdAt: 'DESC' },
    });
  }
}
