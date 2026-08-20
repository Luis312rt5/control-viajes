import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ExpenseType {
  COMBUSTIBLE = 'combustible',
  PEAJE = 'peaje',
  REPARACION = 'reparacion',
  OTRO = 'otro',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tripId: string; // referencia lógica al Trip en trips-service (no FK física, otro microservicio/DB)

  @Column({ type: 'enum', enum: ExpenseType })
  type: ExpenseType;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column()
  concept: string;

  @CreateDateColumn()
  createdAt: Date;
}
