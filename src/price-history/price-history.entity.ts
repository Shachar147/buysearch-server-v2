import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class PriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column('float')
  price: number;

  @CreateDateColumn()
  date: Date;
} 