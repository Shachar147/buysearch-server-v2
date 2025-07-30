import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserService } from '../user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly userService: UserService) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL =
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3001/api/auth/google/callback';

    super({
      clientID: clientID || 'dummy',
      clientSecret: clientSecret || 'dummy',
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // If credentials are not configured, return error
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return done(
        new Error(
          'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
        ),
        null,
      );
    }

    const { name, emails, photos, id } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      googleEmail: emails[0].value,
      googleName: name.givenName + ' ' + name.familyName,
      googlePicture: photos[0].value,
    };

    done(null, user);
  }
}
