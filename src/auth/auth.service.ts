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
    // Update lastLoginAt
    await this.userService.updateLastLoginAt(user.id);
    const payload = { sub: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }

  async register(
    username: string,
    password: string,
  ): Promise<{ token: string }> {
    if (!username || username.length < 4) {
      const err: any = new Error('usernameTooShort');
      err.code = 'usernameTooShort';
      throw err;
    }
    if (!password || password.length < 8) {
      const err: any = new Error('passwordTooShort');
      err.code = 'passwordTooShort';
      throw err;
    }
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

  async handleGoogleLogin(googleData: {
    googleId: string;
    email: string;
    googleEmail: string;
    googleName: string;
    googlePicture: string;
  }): Promise<{ token: string; isNewUser: boolean }> {
    // First, try to find user by Google ID
    let user = await this.userService.findByGoogleId(googleData.googleId);

    if (user) {
      // User exists with this Google ID
      await this.userService.updateLastLoginAt(user.id);
      const payload = { sub: user.id, username: user.username };
      const token = await this.jwtService.signAsync(payload);
      return { token, isNewUser: false };
    }

    // Check if user exists with this email
    user = await this.userService.findByEmail(googleData.email);

    if (user) {
      // Link Google account to existing user
      user = await this.userService.linkGoogleToExistingUser(
        user.id,
        googleData,
      );
      await this.userService.updateLastLoginAt(user.id);
      const payload = { sub: user.id, username: user.username };
      const token = await this.jwtService.signAsync(payload);
      return { token, isNewUser: false };
    }

    // Create new user with Google data
    user = await this.userService.createGoogleUser(googleData);
    await this.userService.updateLastLoginAt(user.id);
    const payload = { sub: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);
    return { token, isNewUser: true };
  }

  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token);
  }
}
