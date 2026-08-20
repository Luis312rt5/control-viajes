import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PassengerInputDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() document: string;
}

export class CreateTripDto {
  @IsString() @IsNotEmpty() origin: string;
  @IsString() @IsNotEmpty() destination: string;
  @IsUUID() driverId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe cargar al menos un pasajero' })
  @ValidateNested({ each: true })
  @Type(() => PassengerInputDto)
  passengers: PassengerInputDto[];
}

export class CheckInDto {
  @IsBoolean()
  boarded: boolean;
}

export class SignTripDto {
  @IsString() @IsNotEmpty({ message: 'La firma digital es obligatoria' })
  signature: string;
}

export class PaginationQueryDto {
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
