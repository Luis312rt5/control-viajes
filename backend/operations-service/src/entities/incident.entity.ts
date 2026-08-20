import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum IncidentType {
  RETRASO = 'retraso',
  PROBLEMA_PASAJERO = 'problema_pasajero',
  DESVIO = 'desvio',
  OTRO = 'otro',
}

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tripId: string;

  @Column({ type: 'enum', enum: IncidentType })
  type: IncidentType;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
