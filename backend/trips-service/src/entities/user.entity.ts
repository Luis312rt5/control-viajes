import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Trip } from './trip.entity';

export enum UserRole {
  ADMIN = 'admin',
  DRIVER = 'driver',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // hash bcrypt

  @Column()
  fullName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.DRIVER })
  role: UserRole;

  @OneToMany(() => Trip, (trip) => trip.driver)
  trips: Trip[];
}
