//users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { AdminController } from './admin.controller';
import { UserEntity } from './users.entity';
import { UsersInitService } from './users-init.service';
import { JwtModule } from '@nestjs/jwt';
import { getJwtSecret } from '../auth/jwt-secret';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { }, // Set your token expiration
    }),
  ],
    providers: [UserService, UsersInitService],
    controllers: [UserController, AdminController],
    exports: [UserService],
})
export class UserModule {}

