import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.validateCredentials')
  async validateCredentials(
    @Payload() data: { email: string; password: string },
  ) {
    return this.usersService.validateCredentials(data.email, data.password);
  }

  @MessagePattern('users.findById')
  async findById(@Payload() data: { id: string }) {
    const user = await this.usersService.findById(data.id);
    if (!user) return null;
    const { password: _pw, ...safe } = user;
    return safe;
  }

  @MessagePattern('users.findDrivers')
  async findDrivers() {
    return this.usersService.findDrivers();
  }
}
