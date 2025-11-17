import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from '@app/common';
import { JwtPayload } from '../types';
import { UserService } from '../../user/user.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly envService: EnvService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: (req) => req.cookies['accessToken'],
      secretOrKey: envService.get('ACCESS_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.getById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
