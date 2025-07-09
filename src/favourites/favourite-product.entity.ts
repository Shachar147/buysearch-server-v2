import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('favourite_products')
@Unique(['userId', 'productId'])
export class FavouriteProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  productId: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
} 