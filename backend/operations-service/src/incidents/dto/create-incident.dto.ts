import { IncidentType } from '../../entities/incident.entity';

export class CreateIncidentDto {
  tripId: string;
  type: IncidentType;
  description: string;
}
