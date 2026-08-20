import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InternalHttpClient } from './internal-http-client';

@Injectable()
export class TripsServiceClient extends InternalHttpClient {
  constructor(config: ConfigService) {
    super(
      config.get('TRIPS_SERVICE_URL', 'http://localhost:3001/internal'),
      config.get('INTERNAL_API_KEY', 'dev_internal_key_change_me'),
    );
  }

  createTrip(dto: unknown) {
    return this.post('/trips', dto);
  }

  findAllTrips(pagination: { page?: number; limit?: number }) {
    return this.get('/trips', pagination);
  }

  findOneTrip(id: string) {
    return this.get(`/trips/${id}`);
  }

  findTripsByDriver(driverId: string) {
    return this.get(`/trips/driver/${driverId}`);
  }

  getTripStatus(tripId: string) {
    return this.get(`/trips/${tripId}/status`);
  }

  checkInPassenger(tripId: string, passengerId: string, boarded: boolean) {
    return this.patch(`/trips/${tripId}/passengers/${passengerId}/checkin`, {
      boarded,
    });
  }

  signTrip(tripId: string, signature: string) {
    return this.post(`/trips/${tripId}/sign`, { signature });
  }

  startTrip(tripId: string) {
    return this.post(`/trips/${tripId}/start`);
  }

  closeTrip(tripId: string) {
    return this.post(`/trips/${tripId}/close`);
  }

  validateCredentials(email: string, password: string) {
    return this.post('/users/validate-credentials', { email, password });
  }

  findUserById(id: string) {
    return this.get(`/users/${id}`);
  }

  findDrivers() {
    return this.get('/users/drivers');
  }
}
