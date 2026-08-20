import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export enum ExpenseType {
  COMBUSTIBLE = 'combustible',
  PEAJE = 'peaje',
  REPARACION = 'reparacion',
  OTRO = 'otro',
}

export enum IncidentType {
  RETRASO = 'retraso',
  PROBLEMA_PASAJERO = 'problema_pasajero',
  DESVIO = 'desvio',
  OTRO = 'otro',
}

export class CreateExpenseDto {
  @IsUUID() tripId: string;
  @IsEnum(ExpenseType) type: ExpenseType;
  @IsNumber() @IsPositive() amount: number;
  @IsString() @IsNotEmpty() concept: string;
}

export class CreateIncidentDto {
  @IsUUID() tripId: string;
  @IsEnum(IncidentType) type: IncidentType;
  @IsString() @IsNotEmpty() description: string;
}
