import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Brand } from '../brand/brand.entity';
import { Category } from '../category/category.entity';
import { Color } from '../color/color.entity';
import { Source } from '../source/source.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  url: string;

  @Column('simple-array')
  images: string[];

  @Column()
  isSellingFast: boolean;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  oldPrice: number;

  @Column({ nullable: true })
  salePercent: number;

  @Column()
  currency: string;

  @Column()
  gender: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Brand, brand => brand.products)
  brand: Brand;

  @ManyToOne(() => Source, source => source.products)
  source: Source;

  @ManyToMany(() => Category, category => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' }
  })
  categories: Category[];

  @ManyToMany(() => Color, color => color.products)
  @JoinTable({
    name: 'product_colors',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'colorId', referencedColumnName: 'id' }
  })
  colors: Color[];
} 