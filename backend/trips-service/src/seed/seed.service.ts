import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    const count = await this.usersService.count();
    if (count > 0) return;

    await this.usersService.create({
      email: 'admin@viajes.com',
      password: 'Admin123!',
      fullName: 'Administrador General',
      role: UserRole.ADMIN,
    });

    await this.usersService.create({
      email: 'conductor@viajes.com',
      password: 'Conductor123!',
      fullName: 'Carlos Conductor',
      role: UserRole.DRIVER,
    });

    this.logger.log(
      'Usuarios de prueba creados: admin@viajes.com / conductor@viajes.com (ver README para contraseñas)',
    );
  }
}
