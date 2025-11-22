import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
    Admin = 'Admin',
    User = 'User',
}

export enum UserStatus {
    Active = 'active',
    Banned = 'banned',
}

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', unique: true })
    username!: string;

    @Column({ type: 'varchar' })
    firstname!: string;

    @Column({ type: 'varchar' })
    lastname!: string;

    @Column({ type: 'varchar', unique: true })
    email!: string;

    @Column({ type: 'varchar' })
    password!: string;

    @Column({ type: 'boolean', default: false })
    isVerified!: boolean;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.User,
    })
    role!: UserRole;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.Active,
    })
    status!: UserStatus;

    @Column({ nullable: true, type: 'varchar' })
    verificationToken?: string | null;

    @Column({ nullable: true, type: 'timestamp' })
    verificationTokenExpires?: Date | null;

    @Column({ nullable: true, type: 'varchar' })
    resetToken?: string | null;

    @Column({ nullable: true, type: 'timestamp' })
    resetTokenExpires?: Date | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
