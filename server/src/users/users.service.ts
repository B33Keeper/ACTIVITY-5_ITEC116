import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async list(offset = 0, limit = 10) {
    const [items, total] = await this.usersRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
      select: ['id', 'username', 'email', 'createdAt'], // Exclude passwordHash
    });
    return { items, total, offset, limit };
  }

  async findOne(id: number): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.usersRepo.findOne({
      where: { id },
      // Don't use select - we want all fields except passwordHash for profile
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Return user data without passwordHash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<UserEntity, 'passwordHash'>;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.usersRepo.findOne({ where: { username } });
  }

  async create(username: string, email: string, passwordHash: string): Promise<UserEntity> {
    const user = this.usersRepo.create({ username, email, passwordHash });
    return this.usersRepo.save(user);
  }

  async update(
    id: number,
    username?: string,
    email?: string,
    password?: string,
    currentPassword?: string,
    profilePictureUrl?: string,
  ): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // If password is being changed, verify current password
    if (password && currentPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new NotFoundException('Current password is incorrect');
      }
      user.passwordHash = await bcrypt.hash(password, 10);
    }
    
    // Only update fields that are provided (not undefined and not empty string)
    if (username !== undefined && username !== null && username !== '') {
      user.username = username;
    }
    if (email !== undefined && email !== null && email !== '') {
      user.email = email;
    }
    if (profilePictureUrl !== undefined) {
      user.profilePictureUrl = profilePictureUrl || null;
    }
    
    const savedUser = await this.usersRepo.save(user);
    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as Omit<UserEntity, 'passwordHash'>;
  }

  async remove(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepo.remove(user);
    return { message: 'User deleted' };
  }
}


