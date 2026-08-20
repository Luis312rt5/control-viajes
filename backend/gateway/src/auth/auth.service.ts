import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TripsServiceClient } from '../clients/trips-service.client';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly tripsClient: TripsServiceClient,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user: any = await this.tripsClient.validateCredentials(
      dto.email,
      dto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
