import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Passenger } from './passenger.entity';

export enum TripStatus {
  PENDING = 'pending', // creado, aún no check-in ni firma
  READY = 'ready', // check-in + firma completos, listo para arrancar
  IN_PROGRESS = 'in_progress', // en ruta
  CLOSED = 'closed', // finalizado
}

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string; // ej: VJ-0001

  @Column()
  origin: string;

  @Column()
  destination: string;

  @ManyToOne(() => User, (user) => user.trips, { eager: true })
  @JoinColumn({ name: 'driverId' })
  driver: User;

  @Column()
  driverId: string;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.PENDING })
  status: TripStatus;

  @Column({ type: 'text', nullable: true })
  signature: string | null; // firma digital en base64

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @OneToMany(() => Passenger, (passenger) => passenger.trip, {
    cascade: true,
    eager: true,
  })
  passengers: Passenger[];

  @CreateDateColumn()
  createdAt: Date;
}
