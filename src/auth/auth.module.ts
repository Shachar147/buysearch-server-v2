import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { GoogleStrategy } from './google.strategy';
import { getSecurityConfig } from '../config/security.config';

const securityConfig = getSecurityConfig();

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: securityConfig.jwt.secret,
      signOptions: { expiresIn: securityConfig.jwt.expiresIn },
    }),
  ],
  providers: [AuthService, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
