import { Controller, Post, Body, Res, UnauthorizedException, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { ApiBody } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { UserGuard } from './user.guard';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  private getCookieExpiration(): number {
    // Convert JWT expiration string (e.g., '7d') to milliseconds
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const days = jwtExpiresIn.includes('d') ? parseInt(jwtExpiresIn) : 7;
    return days * 24 * 60 * 60 * 1000; // Convert to milliseconds
  }

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
      res.cookie('token', token, { 
        httpOnly: false, 
        sameSite: 'lax',
        secure: false,
        maxAge: this.getCookieExpiration(),
        path: '/'
      });
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
      res.cookie('token', token, { 
        httpOnly: false, 
        sameSite: 'lax',
        secure: false,
        maxAge: this.getCookieExpiration(),
        path: '/'
      });
      res.json({ status: 'success', token, expiresIn });
    } catch (e) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This will redirect to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      // Check if Google OAuth is configured
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/login?google=error&message=Google OAuth is not configured`);
      }

      const googleData = (req as any).user as any;
      const { token, isNewUser } = await this.authService.handleGoogleLogin(googleData);
      
      // Decode token to get expiration
      const decoded: any = (token && token.split('.').length === 3)
        ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        : null;
      const expiresIn = decoded && decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : null;
      
      res.cookie('token', token, { 
        httpOnly: false, 
        sameSite: 'lax',
        secure: false,
        maxAge: this.getCookieExpiration(),
        path: '/'
      });
      
      // Redirect to frontend with success and token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?google=success&isNewUser=${isNewUser}&token=${encodeURIComponent(token)}`);
    } catch (error) {
      console.error('Google auth error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMessage = error.message || 'Authentication failed';
      res.redirect(`${frontendUrl}/login?google=error&message=${encodeURIComponent(errorMessage)}`);
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
      path: '/'
    });
    
    res.json({ status: 'success', message: 'Logged out successfully' });
  }

  @Get('profile')
  @UseGuards(UserGuard)
  async getProfile(@Req() req: Request) {
    const user = await this.userService.findById((req as any).user.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      googleName: user.googleName,
      googlePicture: user.googlePicture,
      lastLoginAt: user.lastLoginAt,
      totalSearches: user.totalSearches,
    };
  }

  @UseGuards(UserGuard)
  @Get('users')
  async getAllUsers() {
    const users = await this.userService.findAll();
    // Use injected entityManager for raw query
    const favRows = await this.entityManager.query(`
      SELECT "userId", COUNT(*) as count
      FROM favourite_products
      GROUP BY "userId"
    `);
    const favCounts: Record<number, number> = {};
    for (const row of favRows) {
      favCounts[Number(row.userId)] = Number(row.count);
    }

    // Get filter sets count for each user
    const filterRows = await this.entityManager.query(`
      SELECT "userId", COUNT(*) as count
      FROM saved_filters
      GROUP BY "userId"
    `);
    const filterCounts: Record<number, number> = {};
    for (const row of filterRows) {
      filterCounts[Number(row.userId)] = Number(row.count);
    }

    return users.map(u => ({
      id: u.id,
      username: u.username,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      totalSearches: u.totalSearches,
      favouritesCount: favCounts[u.id] || 0,
      filterSetsCount: filterCounts[u.id] || 0,
      userType: u.googleId ? 'google' : 'regular'
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
      SELECT c.id, c.name,
        SUM(CASE WHEN p.gender = 'Men' THEN 1 ELSE 0 END) as men,
        SUM(CASE WHEN p.gender = 'Women' THEN 1 ELSE 0 END) as women,
        SUM(CASE WHEN p.gender = 'Unisex' THEN 1 ELSE 0 END) as unisex
      FROM categories c
      LEFT JOIN product_categories pc ON pc."categoryId" = c.id
      LEFT JOIN products p ON p.id = pc."productId"
      GROUP BY c.id, c.name
      ORDER BY c.name
    `);
    return rows;
  }

  @UseGuards(UserGuard)
  @Get('stats/brands')
  async getBrandStats() {
    const rows = await this.entityManager.query(`
      SELECT b.id, b.name,
        SUM(CASE WHEN p.gender = 'Men' THEN 1 ELSE 0 END) as men,
        SUM(CASE WHEN p.gender = 'Women' THEN 1 ELSE 0 END) as women,
        SUM(CASE WHEN p.gender = 'Unisex' THEN 1 ELSE 0 END) as unisex
      FROM brands b
      LEFT JOIN products p ON p."brandId" = b.id
      GROUP BY b.id, b.name
      ORDER BY b.name
    `);
    return rows;
  }

  @UseGuards(UserGuard)
  @Get('stats/total-products')
  async getTotalProducts() {
    const rows = await this.entityManager.query(`
      SELECT COUNT(*) as total
      FROM products
    `);
    return rows[0];
  }

  @UseGuards(UserGuard)
  @Get('stats/daily-stats')
  async getDailyStats() {
    // Get today's date in UTC (start of day)
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    
    // Get tomorrow's date in UTC (start of day)
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);

    // Get products added today
    const addedRows = await this.entityManager.query(`
      SELECT COUNT(*) as total_added_today
      FROM products
      WHERE "createdAt" >= $1 AND "createdAt" < $2
    `, [todayUTC.toISOString(), tomorrowUTC.toISOString()]);

    // Get products updated today (regardless of when they were created)
    const updatedRows = await this.entityManager.query(`
      SELECT COUNT(*) as total_updated_today
      FROM products
      WHERE "updatedAt" >= $1 AND "updatedAt" < $2
    `, [todayUTC.toISOString(), tomorrowUTC.toISOString()]);

    // Get price changes today (products with price history changes)
    const priceChangesRows = await this.entityManager.query(`
      SELECT COUNT(DISTINCT ph."productId") as total_price_changes_today
      FROM price_history ph
      WHERE ph."date" >= $1 AND ph."date" < $2
    `, [todayUTC.toISOString(), tomorrowUTC.toISOString()]);

    return {
      total_added_today: parseInt(addedRows[0].total_added_today) || 0,
      total_updated_today: parseInt(updatedRows[0].total_updated_today) || 0,
      total_price_changes_today: parseInt(priceChangesRows[0].total_price_changes_today) || 0
    };
  }
} 