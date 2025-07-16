import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('saved_filters')
export class SavedFilter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('jsonb')
  filters: {
    sort?: string;
    brand?: string[];
    category?: string[];
    color?: string[];
    priceRange?: { label: string; from?: number; to?: number };
    gender?: string;
    isFavourite?: boolean;
    withPriceChange?: boolean;
    source?: string[];
    isOnSale?: boolean;
  };

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;
} 