import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, signIn } from 'src/users/dto/create-user.dto';
import { GoogleAuthGuard } from './utils/auth.guard';
import { Request, Response } from 'express';
import { GoogleStrategy } from './utils/GoogleStrategy';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private googleStrategy: GoogleStrategy,
  ) {}

  @Post('signin')
  signIn(@Body() user: signIn) {
    return this.authService.signIn(user);
  }

  @Post('signup')
  signUp(@Body() user: CreateUserDto) {
    return this.authService.signUp(user);
  }
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return { msg: 'Google Authentication' };
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  handleRedirect(@Req() req: Request, @Res() res: Response) {
    const token = req.user;
    res.redirect(`http://localhost:3000/login?token=${token}`);
  }

  @Get('status')
  user(@Req() request: Request) {
    console.log(request.session, 'sesion in status');

    console.log(request.user);
    if (request.user) {
      return { msg: 'Authenticated' };
    } else {
      return { msg: 'Not Authenticated' };
    }
  }
}
