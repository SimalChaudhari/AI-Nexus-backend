//users.controller.ts
import {
    Controller,
    HttpStatus,
    Param,
    Get,
    Post,
    Delete,
    Put,
    Body,
    Res,
    UseGuards,
} from '@nestjs/common';
import { UserRole } from './users.entity';
import { Response } from 'express';
import { UserService } from './users.service';
import { UpdateUserDto, UserDto } from './users.dto';
import { JwtAuthGuard } from './../jwt/jwt-auth.guard';
import { RolesGuard } from './../jwt/roles.guard';
import { Roles } from './../jwt/roles.decorator';
import { SessionGuard } from './../jwt/session.guard';

@Controller('users')
@UseGuards(SessionGuard,JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Get()
    @Roles(UserRole.Admin)
    async getAllUsers(@Res() response: Response) {
        const users = await this.userService.getAll();
        return response.status(HttpStatus.OK).json({
            length: users.length,
            data: users,
        });
    }

    @Get(':id')
    @Roles(UserRole.Admin)
    async getUserById(@Param('id') id: string, @Res() response: Response) {
        const user = await this.userService.getById(id);
        return response.status(HttpStatus.OK).json({
            data: user,
        });
    }

    @Post()
    @Roles(UserRole.Admin)
    async createUser(
        @Body() createUserDto: Partial<UserDto>,
        @Res() response: Response,
    ) {
        const result = await this.userService.create(createUserDto);
        return response.status(HttpStatus.CREATED).json(result);
    }

    @Put('update/:id')
    @Roles(UserRole.Admin)
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Res() response: Response,
    ) {
        const result = await this.userService.update(id, updateUserDto);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete('delete/:id')
    @Roles(UserRole.Admin)
    async deleteUser(@Param('id') id: string, @Res() response: Response) {
        const result = await this.userService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }


}
