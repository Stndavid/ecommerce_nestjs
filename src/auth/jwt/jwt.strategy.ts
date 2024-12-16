
import{ ExtractJwt} from 'passport-jwt'
import{ PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './jwt.constants';
import { Strategy } from 'passport-jwt';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret
        });
    }

    async validate(paylod:any){
        return {userId: paylod.id, username:paylod.name, roles: paylod.roles};
    }
}




