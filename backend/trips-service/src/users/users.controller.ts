import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('validate-credentials')
  async validateCredentials(
    @Body() body: { email: string; password: string },
  ) {
    return this.usersService.validateCredentials(body.email, body.password);
  }

  // Nota de orden de rutas: 'drivers' y 'validate-credentials' deben quedar
  // declaradas antes de ':id' para que no sean interpretadas como un id.
  @Get('drivers')
  async findDrivers() {
    return this.usersService.findDrivers();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) return null;
    const { password: _pw, ...safe } = user;
    return safe;
  }
}
