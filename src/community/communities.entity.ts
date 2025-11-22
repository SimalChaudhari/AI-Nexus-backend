import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { CategoryEntity } from '../category/categories.entity';

export enum CommunityPricingType {
    Free = 'free',
    Paid = 'paid',
}

@Entity('communities')
export class CommunityEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'text', nullable: true })
    smallImage?: string; // Store file path

    @Column({ type: 'text', nullable: true })
    largeImage?: string; // Store file path

    @Column({
        type: 'enum',
        enum: CommunityPricingType,
        default: CommunityPricingType.Free,
    })
    pricingType!: CommunityPricingType;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
    amount?: number;

    @Column({ type: 'uuid', nullable: true })
    categoryId?: string;

    @ManyToOne(() => CategoryEntity, { cascade: false, nullable: true })
    @JoinColumn({ name: 'categoryId' })
    category?: CategoryEntity;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}

