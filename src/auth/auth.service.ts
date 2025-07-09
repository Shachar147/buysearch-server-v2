import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    return this.userService.validateUser(username, password);
  }

  async login(username: string, password: string): Promise<{ token: string }> {
    const user = await this.userService.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }

  async register(username: string, password: string): Promise<{ token: string }> {
    const existing = await this.userService.findByUsername(username);
    if (existing) {
      const err: any = new Error('userAlreadyExist');
      err.code = 'userAlreadyExist';
      throw err;
    }
    const user = await this.userService.createUser(username, password);
    const payload = { sub: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }

  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token);
  }
} 