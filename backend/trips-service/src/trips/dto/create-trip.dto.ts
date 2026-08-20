export class PassengerInputDto {
  name: string;
  document: string;
}

export class CreateTripDto {
  origin: string;
  destination: string;
  driverId: string;
  passengers: PassengerInputDto[];
}

export class CheckInPassengerDto {
  tripId: string;
  passengerId: string;
  boarded: boolean;
}

export class SignTripDto {
  tripId: string;
  signature: string; // base64
}

export class StartTripDto {
  tripId: string;
}

export class CloseTripDto {
  tripId: string;
}

export class PaginationDto {
  page?: number = 1;
  limit?: number = 10;
}
