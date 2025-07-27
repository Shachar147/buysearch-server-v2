import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createUser(username: string, password: string): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = this.usersRepository.create({ username, passwordHash, salt });
    return this.usersRepository.save(user);
  }

  async createGoogleUser(googleData: {
    googleId: string;
    email: string;
    googleEmail: string;
    googleName: string;
    googlePicture: string;
  }): Promise<User> {
    // Generate a unique username from email
    const baseUsername = googleData.email.split('@')[0];
    let username = baseUsername;
    let counter = 1;
    
    // Ensure username is unique
    while (await this.findByUsername(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const user = this.usersRepository.create({
      username,
      email: googleData.email,
      googleId: googleData.googleId,
      googleEmail: googleData.googleEmail,
      googleName: googleData.googleName,
      googlePicture: googleData.googlePicture,
    });
    
    return this.usersRepository.save(user);
  }

  async linkGoogleToExistingUser(userId: number, googleData: {
    googleId: string;
    email: string;
    googleEmail: string;
    googleName: string;
    googlePicture: string;
  }): Promise<User> {
    await this.usersRepository.update(userId, {
      googleId: googleData.googleId,
      googleEmail: googleData.googleEmail,
      googleName: googleData.googleName,
      googlePicture: googleData.googlePicture,
      email: googleData.email, // Update email if not set
    });
    
    return this.findById(userId);
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user || !user.passwordHash) return null;
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async updateLastLoginAt(userId: number): Promise<void> {
    await this.usersRepository.update(userId, { lastLoginAt: new Date() });
  }

  async incrementTotalSearches(userId: number): Promise<void> {
    await this.usersRepository.increment({ id: userId }, 'totalSearches', 1);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }
} 