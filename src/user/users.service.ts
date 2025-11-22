//users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserEntity, UserRole, UserStatus } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { UpdateUserDto, UserDto } from './users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) { }

    async getAll(): Promise<UserEntity[]> {
        return await this.userRepository.find({
            where: { role: Not(UserRole.Admin) }
        });
    }

    async findAllUsers(): Promise<UserEntity[]> {
        return this.userRepository.find({ where: { role: UserRole.User } });
    }

    async getById(id: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        return user;
    }

    async create(createUserDto: Partial<UserDto>): Promise<{ message: string; user: UserEntity }> {
        // Check if email already exists
        const existingUserByEmail = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUserByEmail) {
            throw new BadRequestException('Email already exists');
        }

        // Check if username already exists
        const existingUserByUsername = await this.userRepository.findOne({
            where: { username: createUserDto.username },
        });
        if (existingUserByUsername) {
            throw new BadRequestException('Username already exists');
        }

        // Create new user
        const user = this.userRepository.create({
            username: createUserDto.username,
            firstname: createUserDto.firstname,
            lastname: createUserDto.lastname,
            email: createUserDto.email,
            password: createUserDto.password || await bcrypt.hash('defaultPassword123', 10), // Default password if not provided
            role: createUserDto.role || UserRole.User,
            status: createUserDto.status || UserStatus.Active,
            isVerified: false,
        });

        await this.userRepository.save(user);
        return {
            message: 'User created successfully',
            user: user,
        };
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<{ message: string; user: UserEntity }> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if email is being updated and if it already exists
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUser) {
                throw new BadRequestException('Email already exists');
            }
            user.email = updateUserDto.email;
        }

        // Check if username is being updated and if it already exists
        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const existingUser = await this.userRepository.findOne({
                where: { username: updateUserDto.username },
            });
            if (existingUser) {
                throw new BadRequestException('Username already exists');
            }
            user.username = updateUserDto.username;
        }

        // Update other fields if provided
        if (updateUserDto.firstname !== undefined) {
            user.firstname = updateUserDto.firstname;
        }
        if (updateUserDto.lastname !== undefined) {
            user.lastname = updateUserDto.lastname;
        }
        if (updateUserDto.password) {
            // Hash new password
            user.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        if (updateUserDto.role !== undefined) {
            user.role = updateUserDto.role;
        }
        if (updateUserDto.status !== undefined) {
            user.status = updateUserDto.status;
        }
        if (updateUserDto.isVerified !== undefined) {
            user.isVerified = updateUserDto.isVerified;
        }

        await this.userRepository.save(user);
        return {
            message: 'User updated successfully',
            user: user,
        };
    }

    async delete(id: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.userRepository.remove(user);
        return { message: 'User deleted successfully' };
    }
}
