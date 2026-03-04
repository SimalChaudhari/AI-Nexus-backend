// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserEntity } from './../user/users.entity';
import { EmailService } from './../service/email.service';
import { getJwtSecret } from './jwt-secret';

if (!process.env.JWT_SECRET?.trim()) {
  console.warn('⚠️ JWT_SECRET is not set; using default. Set JWT_SECRET in .env or .env-local for production.');
}

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: {},
    }),
  ],
  providers: [AuthService, EmailService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
