import { Controller, Post, Body, Res, UnauthorizedException, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ApiBody } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { UserGuard } from './user.guard';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

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

  @UseGuards(UserGuard)
  @Get('users')
  async getAllUsers() {
    const users = await this.userService.findAll();
    // Use injected entityManager for raw query
    const rows = await this.entityManager.query(`
      SELECT "userId", COUNT(*) as count
      FROM favourite_products
      GROUP BY "userId"
    `);
    const favCounts: Record<number, number> = {};
    for (const row of rows) {
      favCounts[Number(row.userId)] = Number(row.count);
    }
    return users.map(u => ({
      id: u.id,
      username: u.username,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      totalSearches: u.totalSearches,
      favouritesCount: favCounts[u.id] || 0,
    }));
  }

  @UseGuards(UserGuard)
  @Get('stats/sources')
  async getSourceStats() {
    const rows = await this.entityManager.query(`
      SELECT s.id, s.name,
        SUM(CASE WHEN p.gender = 'Men' THEN 1 ELSE 0 END) as men,
        SUM(CASE WHEN p.gender = 'Women' THEN 1 ELSE 0 END) as women,
        SUM(CASE WHEN p.gender = 'Unisex' THEN 1 ELSE 0 END) as unisex
      FROM sources s
      LEFT JOIN products p ON p."sourceId" = s.id
      GROUP BY s.id, s.name
      ORDER BY s.id
    `);
    return rows;
  }

  @UseGuards(UserGuard)
  @Get('stats/categories')
  async getCategoryStats() {
    const rows = await this.entityManager.query(`
      SELECT c.name,
        SUM(CASE WHEN p.gender = 'Men' THEN 1 ELSE 0 END) as men,
        SUM(CASE WHEN p.gender = 'Women' THEN 1 ELSE 0 END) as women,
        SUM(CASE WHEN p.gender = 'Unisex' THEN 1 ELSE 0 END) as unisex
      FROM categories c
      LEFT JOIN product_categories pc ON pc."categoryId" = c.id
      LEFT JOIN products p ON p.id = pc."productId"
      GROUP BY c.name
      ORDER BY c.name
    `);
    return rows;
  }

  @UseGuards(UserGuard)
  @Get('stats/brands')
  async getBrandStats() {
    const rows = await this.entityManager.query(`
      SELECT b.name,
        SUM(CASE WHEN p.gender = 'Men' THEN 1 ELSE 0 END) as men,
        SUM(CASE WHEN p.gender = 'Women' THEN 1 ELSE 0 END) as women,
        SUM(CASE WHEN p.gender = 'Unisex' THEN 1 ELSE 0 END) as unisex
      FROM brands b
      LEFT JOIN products p ON p."brandId" = b.id
      GROUP BY b.name
      ORDER BY b.name
    `);
    return rows;
  }
} 