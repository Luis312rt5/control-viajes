import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    const { password: _pw, ...safe } = user;
    return safe;
  }

  async create(data: Partial<User>): Promise<User> {
    const hashed = await bcrypt.hash(data.password as string, 10);
    const user: User = this.usersRepo.create({ ...data, password: hashed });
    return this.usersRepo.save(user);
  }

  async count(): Promise<number> {
    return this.usersRepo.count();
  }

  async findDrivers(): Promise<Omit<User, 'password'>[]> {
    const drivers = await this.usersRepo.find({
      where: { role: UserRole.DRIVER },
      order: { fullName: 'ASC' },
    });
    return drivers.map(({ password: _pw, ...safe }) => safe);
  }
}
