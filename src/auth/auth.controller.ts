import { Controller, Post, Body, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'test' },
        password: { type: 'string', example: 'test' },
      },
      required: ['username', 'password'],
    },
    examples: {
      default: {
        value: { username: 'test', password: 'test' },
      },
    },
  })
  async register(@Body() body: { username: string; password: string }, @Res() res: Response) {
    const { username, password } = body;
    try {
      const { token } = await this.authService.register(username, password);
      res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
      res.json({ status: 'success', token });
    } catch (e: any) {
      if (e.code === 'userAlreadyExist') {
        res.status(409).json({ status: 'error', error: 'userAlreadyExist' });
      } else if (e.code === 'usernameTooShort') {
        res.status(400).json({ status: 'error', error: 'usernameTooShort' });
      } else if (e.code === 'passwordTooShort') {
        res.status(400).json({ status: 'error', error: 'passwordTooShort' });
      } else {
        res.status(500).json({ status: 'error', error: 'internal' });
      }
    }
  }

  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'test' },
        password: { type: 'string', example: 'test' },
      },
      required: ['username', 'password'],
    },
    examples: {
      default: {
        value: { username: 'test', password: 'test' },
      },
    },
  })
  async login(@Body() body: { username: string; password: string }, @Res() res: Response) {
    const { username, password } = body;
    try {
      const { token } = await this.authService.login(username, password);
      // Decode token to get expiration
      const decoded: any = (token && token.split('.').length === 3)
        ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        : null;
      const expiresIn = decoded && decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : null;
      res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
      res.json({ status: 'success', token, expiresIn });
    } catch (e) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
} 