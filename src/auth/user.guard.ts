import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token =
      req.cookies?.token ||
      req.headers['authorization']?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('No token');
    try {
      // console.log('token', token);
      const payload = await this.authService.verifyToken(token);
      (req as any).user = payload;
      return true;
    } catch (error) {
      // console.log('error', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
